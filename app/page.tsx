"use client"
import { useState, useEffect } from "react"
import { MultiStepForm } from "@/components/multi-step-form"
import { OffersPopup } from "@/components/offers-popup"
import { OffersMarquee } from "@/components/offers-marquee"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const [adminLinkVisible, setAdminLinkVisible] = useState(false)
  const [konami, setKonami] = useState<string[]>([])
  const [imageError, setImageError] = useState(false)
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

      <div className="container mx-auto px-4 py-5">
        <div className="mb-4 text-center">
          <div className="flex justify-center">
            {imageError ? (
              // Fallback to direct img tag if Next.js Image fails
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/H-FzjEmSO5uucBtRACi5IpAhCtC1zDMO.png"
                alt="Havesomee - Pure & Healthy"
                className="h-auto w-[350px]"
              />
            ) : (
              <Image
                src="/havesomee-logo.png"
                alt="Havesomee - Pure & Healthy"
                width={350}
                height={175}
                className="h-auto"
                priority
                onError={() => setImageError(true)}
                unoptimized
              />
            )}
          </div>
          <p className="mx-auto max-w-md text-orange-600 text-sm md:text-base mt-1">
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
