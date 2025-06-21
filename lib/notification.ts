import { prisma } from "@/lib/prisma";

export type NotificationType = "BOOKING" | "WALLET" | "SYSTEM";

export class Notification {
  recipientId: string;
  message: string;
  type: NotificationType;
  read: boolean;

  constructor(recipientId: string, message: string, type: NotificationType) {
    this.recipientId = recipientId;
    this.message = message;
    this.type = type;
    this.read = false;
  }

  markAsRead() {
    this.read = true;
  }

  static async getNotifications(userId: string, unreadOnly: boolean = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
