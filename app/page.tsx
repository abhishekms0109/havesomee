"use client"
import { useState, useEffect } from "react"
import { MultiStepForm } from "@/components/multi-step-form"
import { OffersPopup } from "@/components/offers-popup"
import { OffersMarquee } from "@/components/offers-marquee"
import Link from "next/link"

export default function Home() {
  const [adminLinkVisible, setAdminLinkVisible] = useState(false)
  const [konami, setKonami] = useState<string[]>([])
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newKonami = [...konami, e.key]
      if (newKonami.length > konamiCode.length) {
        newKonami.shift()
      }
      setKonami(newKonami)

      if (newKonami.join(",") === konamiCode.join(",")) {
        setAdminLinkVisible(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [konami])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <OffersPopup />
      <OffersMarquee />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-orange-800 md:text-4xl lg:text-5xl">
            <span className="inline-block animate-bounce">✨</span> Sweet Delights{" "}
            <span className="inline-block animate-bounce delay-150">✨</span>
          </h1>
          <p className="mx-auto max-w-md text-orange-600 text-sm md:text-base">
            Experience the authentic taste of traditional Indian sweets
          </p>
        </div>
        <MultiStepForm />

        {adminLinkVisible && (
          <div className="fixed bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity">
            <Link href="/admin/login" className="text-xs text-gray-400 hover:text-orange-500">
              Admin Access
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
