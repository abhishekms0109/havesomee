import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add the pathname to the headers so we can access it in the layout
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Only apply to admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSession = request.cookies.get("admin_session")

    // If no admin session, redirect to login
    if (!adminSession || adminSession.value !== "authenticated") {
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/admin/:path*"],
}
