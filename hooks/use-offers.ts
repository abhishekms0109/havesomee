"use client"

import { useState, useEffect } from "react"
import type { Offer } from "@/lib/sweets-service"

export function useOffers(activeOnly = false) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const url = activeOnly ? "/api/offers?active=true" : "/api/offers"
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch offers")
        }
        const data = await response.json()
        setOffers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [activeOnly])

  return { offers, loading, error }
}
