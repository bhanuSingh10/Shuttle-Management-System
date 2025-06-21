import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalRoutes, activeVehicles, todayBookings, totalUsers, weeklyBookings] = await Promise.all([
      prisma.route.count(),
      prisma.vehicle.count(),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.user.count({
        where: { role: "STUDENT" },
      }),
      prisma.booking.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
      }),
    ])

    const peakHourAnalysis = await prisma.booking.findMany({
      select: {
        createdAt: true,
        fareCharged: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const bookingsInHour = peakHourAnalysis.filter((booking) => booking.createdAt.getHours() === hour)
      return {
        hour,
        bookings: bookingsInHour.length,
        revenue: bookingsInHour.reduce((sum, booking) => sum + booking.fareCharged, 0),
      }
    })

    return NextResponse.json({
      totalRoutes,
      activeVehicles,
      todayBookings,
      totalUsers,
      weeklyBookings: weeklyBookings.length,
      hourlyData,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
