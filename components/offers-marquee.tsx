"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useOffers } from "@/hooks/use-offers"

export function OffersMarquee() {
  const { offers, loading } = useOffers(true)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    // Check if user has visited before
    const visited = localStorage.getItem("hasVisited")
    if (!visited) {
      localStorage.setItem("hasVisited", "true")
      setIsFirstVisit(true)
    } else {
      setIsFirstVisit(false)
    }
  }, [])

  if (loading || offers.length === 0) {
    return null
  }

  // Always show marquee, but could conditionally style it differently for first-time visitors
  const offerTexts = offers.map((offer) => `${offer.title}: ${offer.description} (Code: ${offer.code})`).join(" • ")

  return (
    <div
      className={`bg-gradient-to-r from-orange-500 to-orange-600 py-2 text-white overflow-hidden ${isFirstVisit ? "border-b-2 border-white" : ""}`}
    >
      <div className="relative flex items-center">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 20,
            ease: "linear",
          }}
          className="whitespace-nowrap text-sm font-medium px-4"
        >
          {offerTexts} • {offerTexts}
        </motion.div>
      </div>
    </div>
  )
}
