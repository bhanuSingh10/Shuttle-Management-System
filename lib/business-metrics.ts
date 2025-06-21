import { Logger } from "./logger"
import { prisma } from "./prisma"

export class BusinessMetrics {
  static async trackBookingSuccess(userId: string, routeId: string, fareAmount: number, pointsDeducted: number) {
    Logger.info("Booking completed", {
      event: "booking_success",
      userId,
      routeId,
      fareAmount,
      pointsDeducted,
      timestamp: new Date().toISOString(),
    })

    // Update route popularity
    await this.updateRoutePopularity(routeId)
  }

  static async trackBookingFailure(userId: string, routeId: string, reason: string) {
    Logger.warn("Booking failed", {
      event: "booking_failure",
      userId,
      routeId,
      reason,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackWalletTopUp(userId: string, amount: number, method: string, transactionId?: string) {
    Logger.info("Wallet top-up", {
      event: "wallet_topup",
      userId,
      amount,
      method,
      transactionId,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackWalletTopUpFailure(userId: string, amount: number, method: string, reason: string) {
    Logger.warn("Wallet top-up failed", {
      event: "wallet_topup_failure",
      userId,
      amount,
      method,
      reason,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackRouteView(routeId: string, userId?: string) {
    Logger.info("Route viewed", {
      event: "route_view",
      routeId,
      userId,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackUserLogin(userId: string, role: string, ip?: string) {
    Logger.info("User login", {
      event: "user_login",
      userId,
      role,
      ip,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackUserLogout(userId: string) {
    Logger.info("User logout", {
      event: "user_logout",
      userId,
      timestamp: new Date().toISOString(),
    })
  }

  private static async updateRoutePopularity(routeId: string) {
    try {
      // This could be implemented with a separate popularity tracking table
      // For now, we'll just log it
      Logger.debug("Route popularity updated", { routeId })
    } catch (error) {
      Logger.error("Error updating route popularity", error as Error, { routeId })
    }
  }

  static async getBusinessSummary(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const [totalBookings, totalRevenue, activeUsers, popularRoutes] = await Promise.all([
        prisma.booking.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.booking.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { fareCharged: true },
        }),
        prisma.user.count({
          where: {
            role: "STUDENT",
            bookings: {
              some: {
                createdAt: { gte: startDate },
              },
            },
          },
        }),
        prisma.booking.groupBy({
          by: ["routeId"],
          where: { createdAt: { gte: startDate } },
          _count: { routeId: true },
          orderBy: { _count: { routeId: "desc" } },
          take: 5,
        }),
      ])

      return {
        totalBookings,
        totalRevenue: totalRevenue._sum.fareCharged || 0,
        activeUsers,
        popularRoutes,
        period: days,
      }
    } catch (error) {
      Logger.error("Error generating business summary", error as Error)
      throw error
    }
  }
}
