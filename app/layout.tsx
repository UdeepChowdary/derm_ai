import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { HistoryProvider } from "@/components/history-provider"
import { AnimatedFavicon } from "@/components/app-icons/animated-favicon"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { AudioAccessibility } from "@/components/audio-accessibility"
import { SkipToContent } from "@/components/skip-to-content"
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
  generator: 'v0.dev',
  applicationName: "Derm AI",
  appleWebApp: {
    title: "Derm AI",
    statusBarStyle: "default",
  },
  authors: [
    { name: "Derm AI Team" }
  ],
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <HistoryProvider>
            <AccessibilityProvider>
              <SkipToContent />
              <AnimatedFavicon />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              <AccessibilitySettings />
              <AudioAccessibility 
                audioDescription="Welcome to Derm AI, your skin health assistant. Use the navigation at the bottom of the screen to explore the app."
              />
            </AccessibilityProvider>
          </HistoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
