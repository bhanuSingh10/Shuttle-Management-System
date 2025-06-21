import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { email: true, role: true } },
      },
      orderBy: { balance: "desc" },
    })

    return NextResponse.json(wallets)
  } catch (error) {
    console.error("Error fetching wallets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}