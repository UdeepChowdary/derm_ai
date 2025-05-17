"use client"

import { Home, History, Settings, Sliders } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  currentPath: string
}

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
      ariaLabel: "Go to home page"
    },
    {
      name: "History",
      href: "/history",
      icon: History,
      ariaLabel: "View scan history"
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      ariaLabel: "App settings"
    },
    {
      name: "Access",
      href: "/accessibility",
      icon: Sliders,
      ariaLabel: "Accessibility features"
    },
  ]

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container max-w-md mx-auto">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href || (currentPath.startsWith("/report") && item.href === "/history")

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-3 px-5",
                  isActive
                    ? "text-teal-500 dark:text-teal-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
                )}
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
