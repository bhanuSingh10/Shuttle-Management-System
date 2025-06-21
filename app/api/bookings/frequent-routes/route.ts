import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"])(request)
    if (user instanceof NextResponse) return user

    const frequentRoutes = await prisma.booking.groupBy({
      by: ["routeId"],
      where: { userId: user.userId },
      _count: {
        routeId: true,
      },
      orderBy: {
        _count: {
          routeId: "desc",
        },
      },
      take: 3,
    })

    const routeIds = frequentRoutes.map((item) => item.routeId)
    const routes = await prisma.route.findMany({
      where: { id: { in: routeIds } },
    })

    const result = frequentRoutes.map((item) => ({
      ...routes.find((route) => route.id === item.routeId),
      bookingCount: item._count.routeId,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching frequent routes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
