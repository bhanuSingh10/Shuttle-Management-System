import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Notification } from "@/lib/notification";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT", "ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await Notification.getNotifications(
      user.userId,
      unreadOnly
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(["STUDENT"])(request);
  if (user instanceof NextResponse) return user;

  const { message, type } = await request.json();
  const notif = new Notification(user.userId, message, type);
  // Save notif to DB
  await prisma.notification.create({
    data: {
      userId: notif.recipientId,
      message: notif.message,
      type: notif.type,
      read: notif.read
    }
  });

  return NextResponse.json({ message: "Notification sent" });
}
