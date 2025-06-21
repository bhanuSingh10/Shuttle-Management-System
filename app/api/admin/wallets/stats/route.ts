import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request)
    if (user instanceof NextResponse) return user

    // Get all wallet balances
    const wallets = await prisma.wallet.findMany({
      select: { balance: true },
    })

    const totalWallets = wallets.length
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0)
    const avgBalance = totalWallets > 0 ? totalBalance / totalWallets : 0
    const lowBalance = wallets.length > 0 ? Math.min(...wallets.map((w) => Number(w.balance))) : 0

    return NextResponse.json({
      totalWallets,
      totalBalance,
      lowBalanceCount: wallets.filter(w => Number(w.balance) < 50).length, // Number of wallets with low balance
      averageBalance: avgBalance,
    })
  } catch (error) {
    console.error("Error fetching wallet stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}