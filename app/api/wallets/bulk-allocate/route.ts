import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkAllocateSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const { amount } = bulkAllocateSchema.parse(body);

    // Get all student wallets
    const wallets = await prisma.wallet.findMany({
      where: {
        user: { role: "STUDENT" }
      }
    });

    // Update all wallets in parallel
    const updates = wallets.map((wallet) =>
      prisma.wallet.update({
        where: { userId: wallet.userId },
        data: { balance: { increment: amount } }
      })
    );
    await Promise.all(updates);

    return NextResponse.json({
      message: "Bulk allocation successful",
      usersUpdated: wallets.length
    });
  } catch (error) {
    console.error("Error in bulk allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}