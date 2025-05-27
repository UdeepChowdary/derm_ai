"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Camera, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InteractiveLogo } from "@/components/interactive-logo"
import { PageTransition } from "@/components/page-transition"
import { useTranslations } from "@/lib/language-provider"
import { LanguageSelectorMenu } from "@/components/language-selector-menu"

export default function HomePage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const t = useTranslations()

  const handleScan = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push(`/${params.locale}/scan`)
      setIsLoading(false)
    }, 500)
  }

  const handleUpload = () => {
    setIsLoading(true)
    
    // Simulate file selection delay
    setTimeout(() => {
      router.push(`/${params.locale}/upload`)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center justify-end">
        <LanguageSelectorMenu />
      </header>
      
      <main className="flex-1 flex flex-col items-center py-4 px-4">
        <PageTransition>
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <InteractiveLogo size="lg" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                {t('home.title')}
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {t('home.subtitle')}
              </p>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <Card className="border border-[color:hsl(var(--border))] dark:border-slate-800 shadow-none">
                <CardContent className="p-0">
                  <Button
                    onClick={handleScan}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full p-6 h-auto bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-xl"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-teal-400/20 rounded-full">
                        <Camera className="h-6 w-6" />
                      </div>
                      <span className="text-base font-medium">{t('home.scan_button')}</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-[color:hsl(var(--border))] dark:border-slate-800 shadow-none">
                <CardContent className="p-0">
                  <Button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full p-6 h-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-base font-medium">{t('home.upload_button')}</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-4">
              <Card className="border border-[color:hsl(var(--border))] dark:border-slate-800 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('navigation.history')}</CardTitle>
                  <CardDescription>{t('home.history_button')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => router.push(`/${params.locale}/history`)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {t('navigation.history')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/home" />
    </div>
  )
}
