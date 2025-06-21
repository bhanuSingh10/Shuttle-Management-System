import { type NextRequest, NextResponse } from "next/server"
import { vehicleSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    const vehicles = await prisma.vehicle.findMany({
      include: {
        route: true,
        driver: true,
      },
      orderBy: { plateNo: "asc" },
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["ADMIN"])
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = vehicleSchema.parse(body)

    const vehicle = await prisma.vehicle.create({
      data,
      include: {
        route: true,
        driver: true,
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
