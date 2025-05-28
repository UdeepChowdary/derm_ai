"use client"

import { PageTransition } from "@/components/animated-section"
import { UVIndexTracker } from "@/components/uv-index-tracker"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"

export default function UVPage() {
  const { theme } = useTheme()
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background">
        <div className="container flex h-14 items-center">
          <motion.div>
            <Sun className="h-5 w-5 mr-2" />
          </motion.div>
          <h1 className="text-lg font-semibold">UV Index Tracker</h1>
        </div>
      </header>

      <main className="container py-6">
        <PageTransition>
          <UVIndexTracker />
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/uv" />
    </div>
  )
} 