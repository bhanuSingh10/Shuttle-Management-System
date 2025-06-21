export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
  data?: any
}

// Mock Logger (replace with actual logger in production)
const Logger = {
  info: (message: string, data: any) => {
    console.log(`INFO: ${message}`, data)
  },
  error: (message: string, data: any) => {
    console.error(`ERROR: ${message}`, data)
  },
}

export class NotificationService {
  private static notifications = new Map<string, Notification[]>()

  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    data?: any,
  ) {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
      data,
    }

    const userNotifications = this.notifications.get(userId) || []
    userNotifications.unshift(notification)

    // Keep only last 50 notifications per user
    if (userNotifications.length > 50) {
      userNotifications.splice(50)
    }

    this.notifications.set(userId, userNotifications)

    // In production, this would integrate with push notification services
    Logger.info("Notification sent", {
      userId,
      notificationId: notification.id,
      type,
      title,
    })

    return notification
  }

  static async getNotifications(userId: string, unreadOnly = false) {
    const userNotifications = this.notifications.get(userId) || []

    if (unreadOnly) {
      return userNotifications.filter((n) => !n.read)
    }

    return userNotifications
  }

  static async markAsRead(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId) || []
    const notification = userNotifications.find((n) => n.id === notificationId)

    if (notification) {
      notification.read = true
      this.notifications.set(userId, userNotifications)
    }

    return notification
  }

  static async markAllAsRead(userId: string) {
    const userNotifications = this.notifications.get(userId) || []
    userNotifications.forEach((n) => (n.read = true))
    this.notifications.set(userId, userNotifications)

    return userNotifications.length
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId) || []
    const index = userNotifications.findIndex((n) => n.id === notificationId)

    if (index > -1) {
      userNotifications.splice(index, 1)
      this.notifications.set(userId, userNotifications)
      return true
    }

    return false
  }

  // Predefined notification templates
  static async notifyBookingSuccess(userId: string, routeName: string, departureTime: Date) {
    return this.sendNotification(
      userId,
      "Booking Confirmed",
      `Your booking for ${routeName} at ${departureTime.toLocaleTimeString()} has been confirmed.`,
      "success",
      { type: "booking", routeName, departureTime },
    )
  }

  static async notifyBookingFailure(userId: string, routeName: string, reason: string) {
    return this.sendNotification(userId, "Booking Failed", `Your booking for ${routeName} failed: ${reason}`, "error", {
      type: "booking_failure",
      routeName,
      reason,
    })
  }

  static async notifyWalletTopUp(userId: string, amount: number, newBalance: number) {
    return this.sendNotification(
      userId,
      "Wallet Topped Up",
      `₹${amount} has been added to your wallet. New balance: ${newBalance} points.`,
      "success",
      { type: "wallet_topup", amount, newBalance },
    )
  }

  static async notifyLowBalance(userId: string, currentBalance: number) {
    return this.sendNotification(
      userId,
      "Low Wallet Balance",
      `Your wallet balance is low (${currentBalance} points). Please top up to continue booking.`,
      "warning",
      { type: "low_balance", currentBalance },
    )
  }

  static async notifyScheduleChange(userId: string, routeName: string, newTime: Date) {
    return this.sendNotification(
      userId,
      "Schedule Updated",
      `The schedule for ${routeName} has been updated to ${newTime.toLocaleTimeString()}.`,
      "info",
      { type: "schedule_change", routeName, newTime },
    )
  }
}
