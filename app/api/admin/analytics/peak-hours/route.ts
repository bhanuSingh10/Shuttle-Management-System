import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        fareCharged: true,
        route: {
          select: {
            name: true,
          },
        },
      },
    })

    // Group by hour of day
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookings: 0,
      revenue: 0,
      averageFare: 0,
    }))

    bookings.forEach((booking) => {
      const hour = new Date(booking.createdAt).getHours()
      hourlyData[hour].bookings += 1
      hourlyData[hour].revenue += booking.fareCharged
    })

    // Calculate average fare per hour
    hourlyData.forEach((data) => {
      data.averageFare = data.bookings > 0 ? data.revenue / data.bookings : 0
    })

    // Group by day of week
    const weeklyData = Array.from({ length: 7 }, (_, day) => ({
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
      bookings: 0,
      revenue: 0,
    }))

    bookings.forEach((booking) => {
      const day = new Date(booking.createdAt).getDay()
      weeklyData[day].bookings += 1
      weeklyData[day].revenue += booking.fareCharged
    })

    // Find peak hours
    const peakHours = hourlyData
      .filter((data) => data.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)

    // Route performance by hour
    const routeHourlyPerformance = new Map<string, Map<number, number>>()

    bookings.forEach((booking) => {
      const routeName = booking.route.name
      const hour = new Date(booking.createdAt).getHours()

      if (!routeHourlyPerformance.has(routeName)) {
        routeHourlyPerformance.set(routeName, new Map())
      }

      const routeHours = routeHourlyPerformance.get(routeName)!
      routeHours.set(hour, (routeHours.get(hour) || 0) + 1)
    })

    return NextResponse.json({
      hourlyData,
      weeklyData,
      peakHours,
      summary: {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.fareCharged, 0),
        peakHour: peakHours[0]?.hour || 0,
        analysisPeriod: days,
      },
    })
  } catch (error) {
    console.error("Error fetching peak hours analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
