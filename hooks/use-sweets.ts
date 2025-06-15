"use client"

import { useState, useEffect } from "react"
import type { Sweet } from "@/lib/sweets-service"

export function useSweets() {
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSweets() {
      try {
        setLoading(true)
        const response = await fetch("/api/sweets")
        if (!response.ok) {
          throw new Error(`Failed to fetch sweets: ${response.statusText}`)
        }
        const data = await response.json()
        setSweets(data)
        setError(null)
      } catch (err) {
        console.error("Error in useSweets:", err)
        setError(err instanceof Error ? err.message : "An error occurred while fetching sweets")
      } finally {
        setLoading(false)
      }
    }

    fetchSweets()
  }, [])

  return { sweets, loading, error }
}
