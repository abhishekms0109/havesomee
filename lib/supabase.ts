import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the entire server component tree
export function createServerComponentClient() {
  const cookieStore = cookies()

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}

// Create a singleton for client components to avoid duplicated instances
let clientInstance: ReturnType<typeof createClientComponentClient> | null = null

export function createClientComponentClient() {
  if (clientInstance) return clientInstance

  clientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return clientInstance
}
