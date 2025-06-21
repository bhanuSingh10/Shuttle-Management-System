// export const runtime = "nodejs";
// ...existing code...

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token (just presence, not validity)
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Do NOT verify token here (Edge runtime limitation)

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
