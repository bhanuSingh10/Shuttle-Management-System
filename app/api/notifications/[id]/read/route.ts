import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { NotificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const notification = await NotificationService.markAsRead(user.userId, params.id)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
