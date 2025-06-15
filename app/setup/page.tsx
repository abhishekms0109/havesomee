"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPage() {
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const seedDatabase = async () => {
    try {
      setIsLoading(true)
      setSeedStatus("Seeding database...")

      const response = await fetch("/api/seed")
      const data = await response.json()

      if (response.ok) {
        setSeedStatus("✅ Database seeded successfully!")
      } else {
        setSeedStatus(`❌ Error: ${data.error || data.message || "Unknown error"}`)
        console.error("Seed error details:", data)
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      setSeedStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkConnection = async () => {
    try {
      setIsLoading(true)
      setDebugInfo("Checking connection...")

      const response = await fetch("/api/debug")
      const data = await response.json()

      setDebugInfo(data)
    } catch (error) {
      console.error("Error checking connection:", error)
      setDebugInfo({ error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Setup & Diagnostics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Populate your database with initial data for sweets and admin users</CardDescription>
          </CardHeader>
          <CardContent>
            {seedStatus && (
              <div
                className={`p-4 mb-4 rounded ${seedStatus.includes("✅") ? "bg-green-100" : seedStatus.includes("❌") ? "bg-red-100" : "bg-blue-100"}`}
              >
                {seedStatus}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={seedDatabase} disabled={isLoading}>
              {isLoading ? "Processing..." : "Seed Database"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check Connection</CardTitle>
            <CardDescription>Verify your Supabase connection and environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo && typeof debugInfo === "object" ? (
              <div className="p-4 rounded bg-gray-100 max-h-80 overflow-auto">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            ) : debugInfo ? (
              <div className="p-4 rounded bg-blue-100">{debugInfo}</div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button onClick={checkConnection} disabled={isLoading} variant="outline">
              {isLoading ? "Checking..." : "Check Connection"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            After seeding the database, try logging in to the{" "}
            <a href="/admin/login" className="text-blue-600 hover:underline">
              admin portal
            </a>{" "}
            with username <code className="bg-gray-100 px-1">admin</code> and password{" "}
            <code className="bg-gray-100 px-1">admin123</code>
          </li>
          <li>
            Visit the{" "}
            <a href="/" className="text-blue-600 hover:underline">
              home page
            </a>{" "}
            to see your sweets catalog
          </li>
          <li>If you encounter any issues, use the "Check Connection" button to diagnose problems</li>
        </ul>
      </div>
    </div>
  )
}
