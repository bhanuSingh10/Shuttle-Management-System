import { type NextRequest, NextResponse } from "next/server";
import { scheduleSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schedulesCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");
    const date = searchParams.get("date");

    const cacheKey = `schedules_${routeId}_${date}`;
    const cached = schedulesCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const where: any = {};
    if (routeId) where.routeId = routeId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.departure = {
        gte: startDate,
        lt: endDate
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        route: true,
        vehicle: {
          include: {
            driver: true
          }
        }
      },
      orderBy: { departure: "asc" }
    });

    schedulesCache.set(cacheKey, schedules);
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const data = scheduleSchema.parse(body);

    const schedule = await prisma.schedule.create({
      data: {
        ...data,
        departure: new Date(data.departure),
        arrival: new Date(data.arrival)
      },
      include: {
        route: true,
        vehicle: {
          include: {
            driver: true
          }
        }
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
