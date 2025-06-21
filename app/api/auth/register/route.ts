import { type NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user and wallet in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
        },
      })

      // Create wallet for student users
      if (role === "STUDENT") {
        await tx.wallet.create({
          data: {
            userId: newUser.id,
            balance: 0,
          },
        })
      }

      return newUser
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
