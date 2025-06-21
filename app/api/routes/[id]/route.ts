import { type NextRequest, NextResponse } from "next/server"
import { routeSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const route = await prisma.route.findUnique({
      where: { id: params.id },
      include: {
        stops: true,
        vehicles: true,
        schedules: {
          include: {
            vehicle: true,
          },
        },
      },
    })

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error fetching route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = routeSchema.parse(body)

    const route = await prisma.route.update({
      where: { id: params.id },
      data,
      include: {
        stops: true,
        vehicles: true,
      },
    })

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error updating route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    await prisma.route.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Route deleted successfully" })
  } catch (error) {
    console.error("Error deleting route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
