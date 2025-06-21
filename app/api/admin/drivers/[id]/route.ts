import { type NextRequest, NextResponse } from "next/server"
import { driverSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit-logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const driver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: {
        vehicles: {
          include: {
            route: true,
          },
        },
      },
    })

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error("Error fetching driver:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = driverSchema.parse(body)

    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id },
    })

    if (!existingDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data,
      include: {
        vehicles: true,
      },
    })

    await AuditLogger.logAdminAction(user.userId, "UPDATE_DRIVER", "driver", params.id, {
      before: existingDriver,
      after: driver,
    })

    return NextResponse.json(driver)
  } catch (error) {
    console.error("Error updating driver:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: { vehicles: true },
    })

    if (!existingDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    if (existingDriver.vehicles.length > 0) {
      return NextResponse.json({ error: "Cannot delete driver with assigned vehicles" }, { status: 400 })
    }

    await prisma.driver.delete({
      where: { id: params.id },
    })

    await AuditLogger.logAdminAction(user.userId, "DELETE_DRIVER", "driver", params.id, {
      deletedDriver: existingDriver,
    })

    return NextResponse.json({ message: "Driver deleted successfully" })
  } catch (error) {
    console.error("Error deleting driver:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
