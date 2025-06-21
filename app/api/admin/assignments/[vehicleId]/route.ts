import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    // Unassign driver from vehicle
    await prisma.vehicle.update({
      where: { id: params.vehicleId },
      data: { driverId: null },
    })

    return NextResponse.json({ message: "Vehicle unassigned successfully" })
  } catch (error) {
    console.error("Error unassigning vehicle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}