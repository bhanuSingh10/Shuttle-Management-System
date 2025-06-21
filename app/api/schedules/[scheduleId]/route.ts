import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const { scheduleId } = params;

    // Try to delete the schedule
    const deleted = await prisma.schedule.delete({
      where: { id: scheduleId }
    });

    return NextResponse.json({ message: "Schedule deleted", deleted });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
