import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { checkAdminSession } from "@/lib/sweets-service"
import { headers } from "next/headers"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Double-check auth on the server side
  const isAuthenticated = await checkAdminSession()

  // Get the current path to check if we're on the login page
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || headersList.get("x-url") || ""
  const isLoginPage = pathname.includes("/admin/login")

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !isLoginPage) {
    redirect("/admin/login")
  }

  return <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">{children}</div>
}
