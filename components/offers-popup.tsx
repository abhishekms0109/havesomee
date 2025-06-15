"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOffers } from "@/hooks/use-offers"

export function OffersPopup() {
  const { offers, loading } = useOffers(true)
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [dismissedOffers, setDismissedOffers] = useState<string[]>([])
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    // Check if user has visited before
    const visited = localStorage.getItem("hasVisitedOffers")

    // For first-time visitors or if there are active offers that haven't been dismissed
    if (!loading && offers.length > 0) {
      if (!visited) {
        localStorage.setItem("hasVisitedOffers", "true")
        setIsFirstVisit(true)
        setShowPopup(true) // Show immediately for first-time visitors
      } else {
        setIsFirstVisit(false)
        const activeOffers = offers.filter((offer) => !dismissedOffers.includes(offer.id))
        if (activeOffers.length > 0) {
          const timer = setTimeout(() => {
            setShowPopup(true)
          }, 2000)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [loading, offers, dismissedOffers])

  const handleDismiss = () => {
    if (offers[currentOfferIndex]) {
      setDismissedOffers([...dismissedOffers, offers[currentOfferIndex].id])
    }
    setShowPopup(false)
  }

  const handleNext = () => {
    if (currentOfferIndex < offers.length - 1) {
      setCurrentOfferIndex(currentOfferIndex + 1)
    } else {
      setShowPopup(false)
    }
  }

  if (loading || offers.length === 0 || dismissedOffers.length === offers.length) {
    return null
  }

  const currentOffer = offers[currentOfferIndex]
  if (!currentOffer) return null

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-xl shadow-2xl"
            style={{
              backgroundColor: currentOffer.bannerColor || "#f97316",
              color: currentOffer.textColor || "#ffffff",
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-current hover:bg-white/20"
              onClick={handleDismiss}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>

            <div className="p-6">
              <h3 className="mb-2 text-2xl font-bold">{currentOffer.title}</h3>
              <p className="mb-4">{currentOffer.description}</p>

              <div className="mb-4 rounded-lg bg-white/20 p-3 text-center">
                <span className="text-lg font-bold">{currentOffer.code}</span>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-current hover:bg-white/20"
                  onClick={handleDismiss}
                >
                  Dismiss
                </Button>

                {currentOfferIndex < offers.length - 1 && (
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-current hover:bg-white/20"
                    onClick={handleNext}
                  >
                    Next Offer
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
