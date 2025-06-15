"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SweetsSelection } from "@/components/sweets-selection"
import { Checkout } from "@/components/checkout"
import { CartProvider } from "@/components/cart-context"
import { StepIndicator } from "@/components/step-indicator"
import { Confetti } from "@/components/confetti"
import { useSweets } from "@/hooks/use-sweets"

export type FormStep = "selection" | "checkout" | "success"

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>("selection")
  const [showConfetti, setShowConfetti] = useState(false)
  const { sweets } = useSweets()

  const handleSelectionComplete = () => {
    setCurrentStep("checkout")
  }

  const handleCheckoutComplete = () => {
    setCurrentStep("success")
    setShowConfetti(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setShowConfetti(false)
      setCurrentStep("selection")
    }, 5000)
  }

  const handleBackToSelection = () => {
    setCurrentStep("selection")
  }

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  return (
    <CartProvider>
      {showConfetti && <Confetti />}

      <motion.div
        className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-orange-400/20 blur-xl"></div>
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-300/20 blur-xl"></div>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-orange-500/20 blur-xl"></div>

          <div className="relative p-6 md:p-8">
            <StepIndicator currentStep={currentStep} />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-8"
              >
                {currentStep === "selection" && (
                  <SweetsSelection onComplete={handleSelectionComplete} sweets={sweets} />
                )}

                {currentStep === "checkout" && (
                  <Checkout onComplete={handleCheckoutComplete} onBack={handleBackToSelection} />
                )}

                {currentStep === "success" && (
                  <div className="py-16 text-center">
                    <div className="mb-6 inline-block rounded-full bg-gradient-to-br from-green-400 to-green-600 p-4 shadow-lg shadow-green-500/20">
                      <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h2 className="mb-2 text-3xl font-bold text-green-600">Order Successful!</h2>
                    <p className="mb-8 text-gray-600">Your delicious sweets are on the way!</p>
                    <div className="relative mx-auto w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Redirecting you in a few seconds...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </CartProvider>
  )
}
