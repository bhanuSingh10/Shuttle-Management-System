import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const allocateSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive()
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["ADMIN"])(request);
    if (user instanceof NextResponse) return user;

    const body = await request.json();
    const { userId, amount } = allocateSchema.parse(body);

    // Check if wallet exists
    const walletExists = await prisma.wallet.findUnique({ where: { userId } });
    if (!walletExists) {
      return NextResponse.json(
        { error: "Wallet not found for this user" },
        { status: 404 }
      );
    }

    const wallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } }
    });

    return NextResponse.json({
      message: "Points allocated successfully",
      balance: wallet.balance
    });
  } catch (error) {
    console.error("Error allocating points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
