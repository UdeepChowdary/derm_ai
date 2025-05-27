"use client"

import { Button } from "@/components/ui/button"
import { Quote } from "lucide-react"
import Link from "next/link"
import { InteractiveLogo } from "@/components/interactive-logo"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SplashScreen() {
  // This page is just a redirect to the localized version
  // The actual redirection happens in middleware.ts
  const { toast } = useToast()
  const [logoClicks, setLogoClicks] = useState(0)

  const handleLogoInteraction = () => {
    setLogoClicks((prev) => {
      const newCount = prev + 1

      // Easter egg after 5 clicks
      if (newCount === 5) {
        toast({
          title: "You found an easter egg!",
          description: "You really like our logo, don't you?",
        })
      }

      // Another easter egg after 10 clicks
      if (newCount === 10) {
        toast({
          title: "Wow, you're persistent!",
          description: "The magnifying glass is getting tired...",
        })
      }

      return newCount
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230f766e' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
        }}
      ></div>

      <div className="w-full max-w-md mx-auto text-center space-y-8 z-10">
        {/* Interactive Logo */}
        <div className="flex justify-center items-center" onClick={handleLogoInteraction}>
          <InteractiveLogo size="lg" className="mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Derm AI</h1>

        {/* Motivational Quote */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <Quote className="w-8 h-8 text-teal-500 mb-2 mx-auto" />
          <p className="text-slate-600 dark:text-slate-300 italic">
            "Healthy skin requires commitment, not a miracle. Take the first step today."
          </p>
        </div>

        {/* Get Started Button */}
        <Link href="/home" className="block w-full">
          <Button className="w-full py-6 text-lg bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
            Get Started
          </Button>
        </Link>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">Your personal skin health assistant</p>
      </div>
    </div>
  )
}
