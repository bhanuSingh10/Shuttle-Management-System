import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    // Get all data
    const [users, routes, stops, vehicles, drivers, schedules, bookings, wallets] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.route.findMany(),
      prisma.stop.findMany(),
      prisma.vehicle.findMany(),
      prisma.driver.findMany(),
      prisma.schedule.findMany(),
      prisma.booking.findMany({
        include: {
          fromStop: { select: { name: true } },
          toStop: { select: { name: true } },
          route: { select: { name: true } },
          user: { select: { email: true } },
        },
      }),
      prisma.wallet.findMany(),
    ])

    const backupData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        exportedBy: user.userId,
      },
      data: {
        users,
        routes,
        stops,
        vehicles,
        drivers,
        schedules,
        bookings,
        wallets,
      },
    }

    await AuditLogger.logAdminAction(user.userId, "SYSTEM_BACKUP", "system", undefined, {
      format,
      recordCount: Object.values(backupData.data).reduce((sum, arr) => sum + arr.length, 0),
    })

    if (format === "csv") {
      // For CSV, we'll export each table separately in a ZIP-like structure
      // For simplicity, we'll return JSON with instructions
      return NextResponse.json({
        message: "CSV export not implemented. Use JSON format.",
        data: backupData,
      })
    }

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="shuttle-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
