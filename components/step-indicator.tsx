"use client"

import type { FormStep } from "@/components/multi-step-form"
import { CheckCircle2, ShoppingCart, CreditCard } from "lucide-react"
import { motion } from "framer-motion"

interface StepIndicatorProps {
  currentStep: FormStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: "selection", label: "Select Sweets", icon: ShoppingCart },
    { id: "checkout", label: "Checkout", icon: CreditCard },
    { id: "success", label: "Complete", icon: CheckCircle2 },
  ]

  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-2xl items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted =
            (currentStep === "checkout" && step.id === "selection") ||
            (currentStep === "success" && (step.id === "selection" || step.id === "checkout"))

          return (
            <div key={step.id} className="flex flex-1 flex-col">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <motion.div
                    className="h-1 flex-1"
                    initial={{ backgroundColor: "rgba(229, 231, 235, 0.5)" }}
                    animate={{
                      backgroundColor:
                        isCompleted || (isActive && index > 0) ? "rgba(249, 115, 22, 0.8)" : "rgba(229, 231, 235, 0.5)",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                <div className="flex flex-col items-center">
                  <motion.div
                    className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full backdrop-blur-sm"
                    initial={{ backgroundColor: "rgba(229, 231, 235, 0.5)", color: "rgba(107, 114, 128, 0.8)" }}
                    animate={{
                      backgroundColor: isActive
                        ? "rgba(249, 115, 22, 0.8)"
                        : isCompleted
                          ? "rgba(249, 115, 22, 0.8)"
                          : "rgba(229, 231, 235, 0.5)",
                      color: isActive || isCompleted ? "#ffffff" : "rgba(107, 114, 128, 0.8)",
                      scale: isActive ? 1.1 : 1,
                      boxShadow: isActive
                        ? "0 0 20px rgba(249, 115, 22, 0.4)"
                        : isCompleted
                          ? "0 0 10px rgba(249, 115, 22, 0.2)"
                          : "none",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" />
                    ) : (
                      <step.icon className="h-4 w-4 md:h-6 md:w-6" />
                    )}
                  </motion.div>

                  <motion.span
                    className="mt-1 md:mt-2 text-xs md:text-sm font-medium text-center"
                    initial={{ color: "rgba(107, 114, 128, 0.8)" }}
                    animate={{
                      color: isActive ? "#f97316" : isCompleted ? "#f97316" : "rgba(107, 114, 128, 0.8)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.label}
                  </motion.span>
                </div>

                {index < steps.length - 1 && (
                  <motion.div
                    className="h-1 flex-1"
                    initial={{ backgroundColor: "rgba(229, 231, 235, 0.5)" }}
                    animate={{
                      backgroundColor: isCompleted ? "rgba(249, 115, 22, 0.8)" : "rgba(229, 231, 235, 0.5)",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
