import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
    }

    // Only proceed if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        status: "error",
        message: "Missing required environment variables",
        environment: envVars,
      })
    }

    // Create Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Test connection by checking if our tables exist
    const tables = []
    const requiredTables = ["sweets", "sweet_sizes", "sweet_tags", "offers", "offer_products", "admin_users"]
    const missingTables = []

    // Check each table individually
    for (const table of requiredTables) {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error) {
        missingTables.push(table)
      } else {
        tables.push({ table, count })
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      environment: envVars,
      tables: {
        found: tables,
        missing: missingTables,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
