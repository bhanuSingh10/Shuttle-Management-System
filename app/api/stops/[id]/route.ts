import { type NextRequest, NextResponse } from "next/server"
import { stopSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stop = await prisma.stop.findUnique({
      where: { id: params.id },
      include: {
        route: true,
      },
    })

    if (!stop) {
      return NextResponse.json({ error: "Stop not found" }, { status: 404 })
    }

    return NextResponse.json(stop)
  } catch (error) {
    console.error("Error fetching stop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = stopSchema.parse(body)

    const stop = await prisma.stop.update({
      where: { id: params.id },
      data,
      include: {
        route: true,
      },
    })

    return NextResponse.json(stop)
  } catch (error) {
    console.error("Error updating stop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    await prisma.stop.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Stop deleted successfully" })
  } catch (error) {
    console.error("Error deleting stop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
