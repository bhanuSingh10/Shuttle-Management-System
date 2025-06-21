import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { AuditLogger } from "@/lib/audit-logger"
import { z } from "zod"

const settingsSchema = z.object({
  systemName: z.string().min(1).optional(),
  defaultFare: z.number().positive().optional(),
  maxWalletBalance: z.number().positive().optional(),
  lowBalanceThreshold: z.number().positive().optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  maxBookingsPerDay: z.number().positive().optional(),
})

// In-memory settings store (in production, this would be in database)
const systemSettings = {
  systemName: "Shuttle Management System",
  defaultFare: 10,
  maxWalletBalance: 10000,
  lowBalanceThreshold: 100,
  maintenanceMode: false,
  allowRegistration: true,
  maxBookingsPerDay: 10,
  lastUpdated: new Date().toISOString(),
  updatedBy: null as string | null,
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    return NextResponse.json(systemSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const updates = settingsSchema.parse(body)

    const previousSettings = { ...systemSettings }

    // Update settings
    Object.assign(systemSettings, updates, {
      lastUpdated: new Date().toISOString(),
      updatedBy: user.userId,
    })

    await AuditLogger.logAdminAction(user.userId, "UPDATE_SETTINGS", "system", undefined, {
      before: previousSettings,
      after: systemSettings,
      changes: updates,
    })

    return NextResponse.json(systemSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
