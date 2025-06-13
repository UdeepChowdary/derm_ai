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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative">
      {/* Background Pattern (subtle dots, like home page) */}
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle fill="%2314B8A6" fill-opacity="0.08" cx="25" cy="25" r="20"/%3E%3Ccircle fill="%2314B8A6" fill-opacity="0.06" cx="75" cy="75" r="20"/%3E%3Ccircle fill="%2314B8A6" fill-opacity="0.04" cx="75" cy="25" r="10"/%3E%3Ccircle fill="%2314B8A6" fill-opacity="0.04" cx="25" cy="75" r="10"/%3E%3C/svg%3E')`,
          backgroundSize: "300px 300px",
        }}
      ></div>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background bg-opacity-80 backdrop-blur">
        <div className="container flex h-14 items-center">
          <motion.div>
            <Sun className="h-5 w-5 mr-2 text-teal-500 dark:text-teal-400" />
          </motion.div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">UV Index Tracker</h1>
        </div>
      </header>

      <main className="container py-6 relative z-10">
        <PageTransition>
          <UVIndexTracker />
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/uv" />
    </div>
  )
} 