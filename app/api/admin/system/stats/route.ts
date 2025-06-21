import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessMetrics } from "@/lib/business-metrics";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get("days") || "30");

    const [businessSummary, systemStats, userStats, recentActivity] =
      await Promise.all([
        BusinessMetrics.getBusinessSummary(days),
        getSystemStats(),
        getUserStats(days),
        getRecentActivity()
      ]);

    return NextResponse.json({
      businessSummary,
      systemStats,
      userStats,
      recentActivity,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getSystemStats() {
  const [
    totalRoutes,
    totalStops,
    totalVehicles,
    totalDrivers,
    activeSchedules
  ] = await Promise.all([
    prisma.route.count(),
    prisma.stop.count(),
    prisma.vehicle.count(),
    prisma.driver.count(),
    prisma.schedule.count({
      where: {
        departure: {
          gte: new Date()
        }
      }
    })
  ]);

  return {
    totalRoutes,
    totalStops,
    totalVehicles,
    totalDrivers,
    activeSchedules
  };
}

async function getUserStats(days: number) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalUsers, activeUsers, newUsers, totalWalletBalance, todayBookings] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({
        where: {
          role: "STUDENT",
          bookings: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          role: "STUDENT",
          createdAt: { gte: startDate }
        }
      }),
      prisma.wallet.aggregate({
        _sum: { balance: true }
      }),
      countTodaysBookings()
    ]);

  return {
    totalUsers,
    activeUsers,
    newUsers,
    totalWalletBalance: totalWalletBalance._sum.balance || 0,
    todayBookings
  };
}

async function countTodaysBookings() {
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
  console.log("Counting bookings since UTC midnight:", todayUTC.toISOString());

  const todayBookings = await prisma.booking.count({
    where: {
      createdAt: {
        gte: todayUTC
      }
    }
  });

  console.log("Today's bookings count:", todayBookings);
  return todayBookings;
}

async function getRecentActivity() {
  const [recentBookings, recentUsers] = await Promise.all([
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        route: { select: { name: true } }
      }
    }),
    prisma.user.findMany({
      take: 5,
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      select: { email: true, createdAt: true }
    })
  ]);

  return {
    recentBookings: recentBookings.map((booking) => ({
      id: booking.id,
      userEmail: booking.user.email,
      routeName: booking.route.name,
      fareCharged: booking.fareCharged,
      createdAt: booking.createdAt
    })),
    recentUsers: recentUsers.map((user) => ({
      email: user.email,
      createdAt: user.createdAt
    }))
  };
}
