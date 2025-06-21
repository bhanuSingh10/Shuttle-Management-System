import { type NextRequest, NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDynamicFare } from "@/lib/utils";
import { Notification } from "@/lib/notification";
import { BusinessMetrics } from "@/lib/business-metrics";
import { AuditLogger } from "@/lib/audit-logger";
import { Booking } from "@/lib/booking";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(["STUDENT"])(request);
    if (user instanceof NextResponse) return user;

    // Validate request body
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId }
    });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Get route for fare calculation
    const route = await prisma.route.findUnique({
      where: { id: data.routeId }
    });
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Calculate dynamic fare
    const baseFare = 10; // Base fare in points
    const fareCharged = calculateDynamicFare(baseFare, route, new Date());
    const pointsRequired = Math.ceil(fareCharged);

    if (wallet.balance < pointsRequired) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // Create booking and update wallet in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Deduct points from wallet
      await tx.wallet.update({
        where: { userId: user.userId },
        data: { balance: { decrement: pointsRequired } }
      });

      // Create booking
      return tx.booking.create({
        data: {
          userId: user.userId,
          fromStopId: data.fromStopId,
          toStopId: data.toStopId,
          routeId: data.routeId,
          scheduleId: data.scheduleId,
          pointsDeducted: pointsRequired,
          fareCharged
        },
        include: {
          fromStop: true,
          toStop: true,
          route: true,
          schedule: true
        }
      });
    });

    // OOP: Use Booking class to manage state
    const bookingClass = new Booking(
      booking.id,
      user.userId,
      data.fromStopId,
      data.toStopId
    );
    bookingClass.confirm();

    // OOP: Use Notification class
    const notif = new Notification(
      user.userId,
      `Booking confirmed for route ${route.name}`,
      "BOOKING"
    );
    // Here you would save notif to DB or send it

    // OOP: Use BusinessMetrics and AuditLogger
    await BusinessMetrics.trackBookingSuccess(
      user.userId,
      data.routeId,
      fareCharged,
      pointsRequired
    );
    await AuditLogger.logUserAction(user.userId, "BOOKING_CREATED", "booking", {
      bookingId: booking.id
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    let routeId;
    let userId;
    try {
      const user = await requireAuth(["STUDENT"])(request);
      userId = user instanceof NextResponse ? null : user.userId;
    } catch (authError) {
      userId = null;
    }
    try {
      const body = await request.json();
      const data = bookingSchema.parse(body);
      routeId = data.routeId;
    } catch (parseError) {
      routeId = null;
    }
    await BusinessMetrics.trackBookingFailure(
      userId ?? "",
      routeId ?? "",
      "Booking creation failed"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"])(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: user.userId },
        include: {
          fromStop: true,
          toStop: true,
          route: true,
          schedule: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.booking.count({
        where: { userId: user.userId }
      })
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
