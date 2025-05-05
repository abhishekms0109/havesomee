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
        const response = await fetch("/api/sweets")
        if (!response.ok) {
          throw new Error("Failed to fetch sweets")
        }
        const data = await response.json()
        setSweets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSweets()
  }, [])

  return { sweets, loading, error }
}
