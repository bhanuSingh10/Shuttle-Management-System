import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "daily":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        break
      case "weekly":
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) // Last 12 weeks
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1) // Last 12 months
        break
    }

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        createdAt: true,
        fareCharged: true,
        pointsDeducted: true,
        route: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Group by time period
    const revenueData = new Map<string, { revenue: number; bookings: number }>()

    bookings.forEach((booking) => {
      let key: string
      const date = new Date(booking.createdAt)

      switch (period) {
        case "daily":
          key = date.toISOString().split("T")[0]
          break
        case "weekly":
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split("T")[0]
          break
        case "monthly":
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          break
      }

      const existing = revenueData.get(key) || { revenue: 0, bookings: 0 }
      existing.revenue += booking.fareCharged
      existing.bookings += 1
      revenueData.set(key, existing)
    })

    // Convert to array and sort
    const chartData = Array.from(revenueData.entries())
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.fareCharged, 0)
    const totalBookings = bookings.length

    // Route-wise revenue
    const routeRevenue = new Map<string, number>()
    bookings.forEach((booking) => {
      const routeName = booking.route.name
      routeRevenue.set(routeName, (routeRevenue.get(routeName) || 0) + booking.fareCharged)
    })

    const topRoutes = Array.from(routeRevenue.entries())
      .map(([route, revenue]) => ({ route, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return NextResponse.json({
      chartData,
      summary: {
        totalRevenue,
        totalBookings,
        averageRevenue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        period: period,
      },
      topRoutes,
    })
  } catch (error) {
    console.error("Error fetching revenue analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
