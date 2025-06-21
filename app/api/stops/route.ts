import { type NextRequest, NextResponse } from "next/server"
import { stopSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")

    const where = routeId ? { routeId } : {}

    const stops = await prisma.stop.findMany({
      where,
      include: {
        route: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(stops)
  } catch (error) {
    console.error("Error fetching stops:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = stopSchema.parse(body)

    const stop = await prisma.stop.create({
      data,
      include: {
        route: true,
      },
    })

    return NextResponse.json(stop, { status: 201 })
  } catch (error) {
    console.error("Error creating stop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
