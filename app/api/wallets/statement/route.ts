import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"])(request)
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"

    const now = new Date()
    let startDate: Date

    if (period === "weekly") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.userId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        fromStop: true,
        toStop: true,
        route: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const csvData = bookings.map((booking) => ({
      Date: booking.createdAt.toISOString().split("T")[0],
      Route: booking.route.name,
      From: booking.fromStop.name,
      To: booking.toStop.name,
      "Points Deducted": booking.pointsDeducted,
      "Fare Charged": booking.fareCharged,
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => JSON.stringify(row[header as keyof typeof row] || "")).join(",")),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="wallet-statement-${period}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error generating statement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
