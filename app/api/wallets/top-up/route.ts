import { type NextRequest, NextResponse } from "next/server";
import { walletTopUpSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/lib/payment";
import { NotificationService } from "@/lib/notification-service";
import { BusinessMetrics } from "@/lib/business-metrics";
import { Wallet } from "@/lib/wallet";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(["STUDENT"])(request);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { amount, paymentMethod } = walletTopUpSchema.parse(body);

    // Process payment
    const paymentResult = await PaymentService.processPayment(
      amount,
      { ...paymentMethod, details: paymentMethod.details ?? {} },
      user.userId
    );

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 });
    }

    // Convert amount to points (1 INR = 10 points)
    const pointsToAdd = amount * 10;

    // Update wallet balance using OOP Wallet class
    const walletRecord = await prisma.wallet.findUnique({
      where: { userId: user.userId }
    });
    if (!walletRecord)
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const wallet = new Wallet(walletRecord.balance);
    wallet.credit(pointsToAdd);

    await prisma.wallet.update({
      where: { userId: user.userId },
      data: { balance: wallet.getBalance() }
    });

    // Send success notification
    await NotificationService.notifyWalletTopUp(
      user.userId,
      amount,
      wallet.getBalance()
    );

    // Track business metrics
    await BusinessMetrics.trackWalletTopUp(
      user.userId,
      amount,
      paymentMethod.type,
      paymentResult.transactionId
    );

    return NextResponse.json({
      message: "Wallet topped up successfully",
      balance: wallet.getBalance(),
      transactionId: paymentResult.transactionId
    });
  } catch (error) {
    console.error("Error topping up wallet:", error);
    const body = await request.json();
    const { amount, paymentMethod } = walletTopUpSchema.parse(body);
    const user = await requireAuth(["STUDENT"])(request);
    if (user instanceof Response) return user;
    await BusinessMetrics.trackWalletTopUpFailure(
      user.userId,
      amount,
      paymentMethod.type,
      "Top-up failed"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
