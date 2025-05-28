"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Clock, Sun, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
// Language provider import removed

const navItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "History",
    href: "/history",
    icon: Clock,
  },
  {
    name: "UV Index",
    href: "/uv",
    icon: Sun,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface BottomNavigationProps {
  currentPath?: string
}

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const pathname = usePathname()
  const activePath = currentPath || pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-md mx-auto">
        <div className="flex h-14 items-center justify-around">
          {navItems.map((item) => {
            const isActive = activePath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] max-w-[80px] h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-0.5"
                >
                  <item.icon className={cn("h-4 w-4", isActive && "[color:#14B8A6]")} />
                </motion.div>
                <span className={cn("text-[10px] font-medium truncate", isActive && "[color:#14B8A6]")}>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
