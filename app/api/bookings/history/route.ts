import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Authenticate user (only STUDENT role can access)
  const user = await requireAuth(["STUDENT"])(request);
  if (user instanceof NextResponse) return user;

  // Pagination params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    // Fetch bookings for the authenticated user
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          route: true,
          fromStop: true, // <-- Add this
          toStop: true,   // <-- Add this
          schedule: {
            include: {
              vehicle: true,
            },
          },
        },
      }),
      prisma.booking.count({
        where: { userId: user.userId },
      }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load booking history" }, { status: 500 });
  }
}