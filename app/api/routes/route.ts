import { type NextRequest, NextResponse } from "next/server"
import { routeSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const routes = await prisma.route.findMany({
      include: {
        stops: true,
        vehicles: true,
        _count: {
          select: {
            stops: true,
            vehicles: true,
          },
        },
      },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof Response) return user

    const body = await request.json()
    const data = routeSchema.parse(body)

    const route = await prisma.route.create({
      data,
      include: {
        stops: true,
        vehicles: true,
      },
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
