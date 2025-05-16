import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { HistoryProvider } from "@/components/history-provider"
import { AnimatedFavicon } from "@/components/app-icons/animated-favicon"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Derm AI - Skin Health Assistant",
  description: "AI-powered dermatology assistant for skin health analysis",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <HistoryProvider>
            <AnimatedFavicon />
            {children}
          </HistoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
