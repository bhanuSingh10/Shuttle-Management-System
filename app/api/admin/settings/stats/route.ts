import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof Response) return user

    // Get system statistics
    const [totalUsers, totalRoutes, totalVehicles, totalBookings, totalRevenue, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.route.count(),
      prisma.vehicle.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: {
          fareCharged: true,
        },
      }),
      prisma.user.count({
        where: {
          bookings: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      }),
    ])

    // Get recent activity
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
        route: {
          select: { name: true },
        },
      },
    })

    // Get system health metrics
    const dbHealth = await prisma.$queryRaw`SELECT 1 as health`
    const systemHealth = {
      database: Array.isArray(dbHealth) && dbHealth.length > 0 ? "healthy" : "unhealthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRoutes,
        totalVehicles,
        totalBookings,
        totalRevenue: totalRevenue._sum.fareCharged || 0,
        activeUsers,
      },
      recentActivity: recentBookings.map((booking) => ({
        id: booking.id,
        user: booking.user.email,
        route: booking.route.name,
        amount: booking.fareCharged,
        createdAt: booking.createdAt,
      })),
      systemHealth,
    })
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
