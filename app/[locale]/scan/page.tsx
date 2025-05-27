"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { LoadingLogo } from "@/components/loading-logo"
import { useHistory } from "@/components/history-provider"
import { analyzeSkinImage } from "@/lib/analyze-skin"
import { useTranslations } from "@/lib/language-provider"
import { LanguageSelectorMenu } from "@/components/language-selector-menu"

export default function ScanPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const { locale } = params
  const { addReport } = useHistory()
  const [showCamera, setShowCamera] = useState(true)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const t = useTranslations()

  // Open camera on mount
  React.useEffect(() => {
    if (showCamera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: "environment" } // Prefer back camera
        } 
      })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error("Could not access camera:", error)
          setShowCamera(false)
        })
    }
    
    return () => {
      // Clean up the camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [showCamera])

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        // Match canvas dimensions to video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png')
        setCapturedImage(imageDataUrl)
        setShowCamera(false)
        
        // Stop the camera stream
        const tracks = (video.srcObject as MediaStream)?.getTracks()
        tracks?.forEach(track => track.stop())
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setShowCamera(true)
  }

  const analyzeImage = async () => {
    if (!capturedImage) return
    
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeSkinImage(capturedImage)
      
      if (analysis) {
        // Add to history
        addReport({
          id: analysis.id,
          condition: analysis.condition,
          severity: analysis.severity,
          description: analysis.description,
          recommendations: analysis.recommendations,
          date: new Date().toISOString(),
          imageUrl: capturedImage,
        })
        
        // Navigate to report
        router.push(`/${locale}/report/${analysis.id}`)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${locale}/home`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">{t('scan.title')}</h1>
        </div>
        <LanguageSelectorMenu />
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="text-center mb-6">
          <p className="text-slate-500 dark:text-slate-400">
            {t('scan.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {showCamera ? (
            <Card className="overflow-hidden border-[color:hsl(var(--border))] dark:border-slate-700">
              <CardContent className="p-0 aspect-square relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={captureImage}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-teal-500"
                >
                  <span className="sr-only">{t('scan.capture_button')}</span>
                  <div className="w-10 h-10 rounded-full bg-teal-500"></div>
                </Button>
              </CardContent>
            </Card>
          ) : capturedImage ? (
            <Card className="overflow-hidden border-[color:hsl(var(--border))] dark:border-slate-700">
              <CardContent className="p-0 aspect-square relative">
                <img
                  src={capturedImage}
                  alt="Captured skin image"
                  className="w-full h-full object-cover"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="aspect-square flex items-center justify-center border-[color:hsl(var(--border))] dark:border-slate-700">
              <CardContent className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>{t('scan.no_camera')}</p>
              </CardContent>
            </Card>
          )}

          {capturedImage && !isAnalyzing && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={retakePhoto}
              >
                {t('scan.retake_button')}
              </Button>
              <Button
                className="flex-1 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                onClick={analyzeImage}
              >
                {t('scan.analyze_button')}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin mb-4">
                <LoadingLogo size="md" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">{t('analysis.loading')}</p>
            </div>
          )}
        </div>
      </main>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
