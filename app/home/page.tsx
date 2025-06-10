"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Camera, Upload, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InteractiveLogo } from "@/components/interactive-logo"
import { PageTransition } from "@/components/page-transition"
import { AutoDermResponse } from "@/lib/analyze-skin"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleScan = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/scan")
      setIsLoading(false)
    }, 1000)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/png")
        setCapturedImage(dataUrl)
        setShowCamera(false)
        // Stop the camera
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  const analyzeImage = async () => {
    if (!capturedImage) return
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Convert base64 image to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('file', blob, 'skin-image.jpg')
      
      // Make API call to Auto Derm
      const apiResponse = await fetch('https://autoderm.ai/v1/query', {
        method: 'POST',
        headers: {
          'Api-Key': process.env.NEXT_PUBLIC_AUTODERM_API_KEY || 'c24df526-615d-56ef-f8db-110f0f7481fd'
        },
        body: formData
      })

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status ${apiResponse.status}`)
      }

      const data = await apiResponse.json() as AutoDermResponse
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed')
      }
      
      // Get the top prediction
      const topPrediction = data.predictions[0]
      
      // Map the API response to our analysis format
      setAnalysis({
        name: topPrediction.name,
        description: `Detected with ${(topPrediction.confidence * 100).toFixed(1)}% confidence`,
        severity: topPrediction.confidence >= 0.75 ? 'Severe' : 
                 topPrediction.confidence >= 0.5 ? 'Moderate' : 'Mild',
        recommendations: [
          "Consult a dermatologist for professional evaluation",
          "Keep the affected area clean and dry",
          "Avoid scratching or irritating the area",
          "Monitor for any changes in the condition"
        ],
        imageUrl: capturedImage,
        confidence: topPrediction.confidence,
        icdCode: topPrediction.icd,
        readMoreUrl: topPrediction.readMoreUrl
      })
    } catch (error) {
      console.error('Error analyzing skin image:', error)
      // Show error to user
      setError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUpload = () => {
    setIsLoading(true)
    
    // Simulate file selection delay
    setTimeout(() => {
      router.push("/upload")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-5 dark:opacity-3 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230f766e' fillOpacity='1' fillRule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
        }}
      ></div>

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2 pb-24">
        <PageTransition>
          <div className="mb-8 flex items-center">
            <div className="mr-4 flex items-center justify-center">
              <InteractiveLogo size="sm" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Derm AI</h1>
              <p className="text-slate-500 dark:text-slate-400">Analyze your skin condition in seconds</p>
            </div>
          </div>

          <div className="grid gap-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Card className="overflow-hidden border-[color:hsl(var(--border))] dark:border-teal-900">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-6 flex flex-col items-center justify-center gap-4 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                  onClick={handleScan}
                  disabled={isLoading}
                >
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg text-slate-800 dark:text-white">Scan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Use camera to analyze skin</p>
                  </div>
                </Button>
                {showCamera && (
                  <div className="flex flex-col items-center gap-4 mt-4">
                    <video ref={videoRef} className="rounded-lg w-full max-w-xs" autoPlay playsInline />
                    <Button onClick={capturePhoto} className="bg-[#14B8A6] text-white">Capture Photo</Button>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                {capturedImage && (
                  <div className="flex flex-col items-center gap-4 mt-4">
                    <img src={capturedImage} alt="Captured" className="rounded-lg w-full max-w-xs" />
                    <Button onClick={analyzeImage} className="bg-[#14B8A6] text-white" disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                    </Button>
                  </div>
                )}
                {analysis && (
                  <div className="mt-6 w-full max-w-md mx-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>{analysis.name}</CardTitle>
                        <CardDescription>{analysis.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2"><strong>Severity:</strong> {analysis.severity}</div>
                        <div className="mb-2"><strong>Recommendations:</strong>
                          <ul className="list-disc pl-5">
                            {analysis.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4">
                          <img src={analysis.imageUrl} alt="Analyzed" className="rounded-lg w-full max-w-xs" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-[color:hsl(var(--border))] dark:border-teal-900">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-6 flex flex-col items-center justify-center gap-4 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg text-slate-800 dark:text-white">Upload Image</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select image from gallery</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>

      <BottomNavigation currentPath="/home" />
    </div>
  )
}
