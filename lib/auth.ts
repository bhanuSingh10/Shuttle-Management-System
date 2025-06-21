import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { prisma } from "./prisma"
import { NextResponse } from "next/server"
import { Logger } from "./logger"
import { AuditLogger } from "./audit-logger"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  role: "ADMIN" | "STUDENT"
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    Logger.warn("Token verification failed", { error: error instanceof Error ? error.message : "Unknown error" })
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  try {
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      Logger.warn("User not found for valid token", { userId: payload.userId })
      return null
    }

    return payload
  } catch (error) {
    Logger.error("Error verifying user existence", error as Error, { userId: payload.userId })
    return null
  }
}

export function requireAuth(allowedRoles?: ("ADMIN" | "STUDENT")[]) {
  return async (request: NextRequest): Promise<JWTPayload | NextResponse> => {
    const user = await getAuthUser(request)

    if (!user) {
      await AuditLogger.logSecurityEvent("UNAUTHORIZED_ACCESS", "medium", {
        path: request.nextUrl.pathname,
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      await AuditLogger.logSecurityEvent("FORBIDDEN_ACCESS", "high", {
        userId: user.userId,
        role: user.role,
        requiredRoles: allowedRoles,
        path: request.nextUrl.pathname,
      })
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return user
  }
}

export async function refreshToken(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  // Check if token expires within 24 hours
  const expiresIn = (payload.exp || 0) * 1000 - Date.now()
  if (expiresIn > 24 * 60 * 60 * 1000) return null // More than 24 hours left

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) return null

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.next()
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    Logger.info("Token refreshed", { userId: user.id })
    return response
  } catch (error) {
    Logger.error("Error refreshing token", error as Error, { userId: payload.userId })
    return null
  }
}
