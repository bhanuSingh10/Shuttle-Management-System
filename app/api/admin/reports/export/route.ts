import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "bookings"
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let data: any[] = []
    let filename = ""

    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}

    switch (type) {
      case "bookings":
        data = await prisma.booking.findMany({
          where: dateFilter,
          include: {
            user: { select: { email: true } },
            route: { select: { name: true } },
            fromStop: { select: { name: true } },
            toStop: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        filename = `bookings-report-${new Date().toISOString().split("T")[0]}`
        break

      case "users":
        data = await prisma.user.findMany({
          where: {
            role: "STUDENT",
            ...dateFilter,
          },
          include: {
            wallet: { select: { balance: true } },
            _count: { select: { bookings: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        filename = `users-report-${new Date().toISOString().split("T")[0]}`
        break

      case "revenue":
        data = await prisma.booking.findMany({
          where: dateFilter,
          include: {
            route: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        filename = `revenue-report-${new Date().toISOString().split("T")[0]}`
        break

      case "routes":
        data = await prisma.route.findMany({
          include: {
            _count: {
              select: {
                stops: true,
                vehicles: true,
                bookings: true,
              },
            },
          },
        })
        filename = `routes-report-${new Date().toISOString().split("T")[0]}`
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    await AuditLogger.logAdminAction(user.userId, "EXPORT_REPORT", "reports", undefined, {
      type,
      format,
      recordCount: data.length,
      startDate,
      endDate,
    })

    if (format === "json") {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      })
    }

    // CSV Export
    const csvData = convertToCSV(data, type)

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function convertToCSV(data: any[], type: string): string {
  if (!data.length) return ""

  let headers: string[] = []
  let rows: string[][] = []

  switch (type) {
    case "bookings":
      headers = ["Date", "User Email", "Route", "From Stop", "To Stop", "Fare Charged", "Points Deducted"]
      rows = data.map((booking) => [
        new Date(booking.createdAt).toISOString(),
        booking.user.email,
        booking.route.name,
        booking.fromStop.name,
        booking.toStop.name,
        booking.fareCharged.toString(),
        booking.pointsDeducted.toString(),
      ])
      break

    case "users":
      headers = ["Email", "Wallet Balance", "Total Bookings", "Created Date"]
      rows = data.map((user) => [
        user.email,
        (user.wallet?.balance || 0).toString(),
        user._count.bookings.toString(),
        new Date(user.createdAt).toISOString(),
      ])
      break

    case "revenue":
      headers = ["Date", "Route", "Fare Charged", "Points Deducted"]
      rows = data.map((booking) => [
        new Date(booking.createdAt).toISOString(),
        booking.route.name,
        booking.fareCharged.toString(),
        booking.pointsDeducted.toString(),
      ])
      break

    case "routes":
      headers = ["Route Name", "Total Stops", "Total Vehicles", "Total Bookings", "Peak Multiplier"]
      rows = data.map((route) => [
        route.name,
        route._count.stops.toString(),
        route._count.vehicles.toString(),
        route._count.bookings.toString(),
        route.dynamicFare.peak.toString(),
      ])
      break
  }

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  return csvContent
}
