import { type NextRequest, NextResponse } from "next/server"
import { driverSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const drivers = await prisma.driver.findMany({
      include: {
        vehicles: {
          include: {
            route: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(drivers)
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const data = driverSchema.parse(body)

    const driver = await prisma.driver.create({
      data,
      include: {
        vehicles: true,
      },
    })

    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error("Error creating driver:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
