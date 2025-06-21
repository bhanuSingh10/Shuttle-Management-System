import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit-logger"
import { z } from "zod"

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        bookings: {
          select: {
            id: true,
            createdAt: true,
            pointsDeducted: true,
            fareCharged: true,
            route: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = updateUserSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    await AuditLogger.logAdminAction(user.userId, "UPDATE_USER", "user", params.id, {
      before: existingUser,
      after: updatedUser,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting other admins
    if (existingUser.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    await AuditLogger.logAdminAction(user.userId, "DELETE_USER", "user", params.id, { deletedUser: existingUser })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
