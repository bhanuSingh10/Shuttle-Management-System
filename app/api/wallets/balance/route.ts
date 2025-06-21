import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"])(request)
    if (user instanceof Response) return user

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    return NextResponse.json({ balance: wallet.balance })
  } catch (error) {
    console.error("Error fetching wallet balance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
