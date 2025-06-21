// Mock payment service
export interface PaymentMethod {
  type: "UPI" | "CARD" | "KIOSK"
  details: any
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

export class PaymentService {
  static async processPayment(amount: number, method: PaymentMethod, userId: string): Promise<PaymentResult> {
    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    } else {
      return {
        success: false,
        error: "Payment failed. Please try again.",
      }
    }
  }

  static generateKioskQR(amount: number, userId: string): string {
    // Generate QR code data for kiosk payment
    return `kiosk://pay?amount=${amount}&user=${userId}&timestamp=${Date.now()}`
  }
}
