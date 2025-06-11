"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Camera, Upload, X, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { InteractiveLogo } from "@/components/interactive-logo"
import { PageTransition } from "@/components/page-transition"
import { analyzeSkinImage, type AnalysisResult, type SkinAnalysisResult } from "@/lib/analyze-skin"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isNonSkinImage, setIsNonSkinImage] = useState(false)
  const [showNonSkinPopup, setShowNonSkinPopup] = useState(false)
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
    console.log('Starting image analysis...')
    if (!capturedImage) {
      console.log('No captured image, returning early')
      return
    }
    
      try {
      console.log('Starting image analysis...')
      const result = await analyzeSkinImage(capturedImage)
      
      // Check if it's a non-skin image result
      if ('isNonSkinImage' in result) {
        console.log('Non-skin image detected:', result.message)
        setIsAnalyzing(false)
        setIsNonSkinImage(true)
        setError(result.message)
        setShowNonSkinPopup(true)
        return
      }
      
      // If we get here, it's a valid skin analysis result
      const analysis = result as SkinAnalysisResult
      console.log('Analysis successful:', analysis.condition)
      setAnalysis(analysis)
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]')
      const newHistory = [
        {
          id: analysis.id || Date.now().toString(),
          condition: analysis.condition,
          date: new Date().toISOString(),
          image: capturedImage
        },
        ...history
      ]
      localStorage.setItem('analysisHistory', JSON.stringify(newHistory))
      
      // Navigate to results page
      router.push(`/report/${analysis.id || 'new'}`)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setError('An error occurred while analyzing the image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
    
    // If we get here, it's a valid skin image, proceed with analysis
    console.log('Proceeding with full skin analysis...')
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const result = await analyzeSkinImage(capturedImage)
      console.log('Analysis result:', result)
      
      // It's a valid skin analysis result
      const analysis = result as SkinAnalysisResult
      
      // Map the analysis to our state
      setAnalysis({
        name: analysis.condition,
        description: analysis.description,
        severity: analysis.severity,
        riskScore: analysis.riskScore,
        recommendations: analysis.recommendations,
        imageUrl: capturedImage,
        confidence: analysis.confidence,
        conditionDetails: analysis.conditionDetails,
        preventionTips: analysis.preventionTips,
        additionalNotes: analysis.additionalNotes
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

  // Handle non-skin popup close
  const handleNonSkinPopupClose = () => {
    console.log('Closing non-skin popup')
    setShowNonSkinPopup(false)
    setCapturedImage(null)
    setError(null)
    setIsNonSkinImage(false)
    setIsAnalyzing(false)
    router.push('/')
  }

  // Add debug effect
  useEffect(() => {
    console.log('Popup state:', { showNonSkinPopup, isNonSkinImage, error });
  }, [showNonSkinPopup, isNonSkinImage, error]);

  // Show non-skin popup
  if (showNonSkinPopup) {
    console.log('Rendering non-skin popup');
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl transform transition-all">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Not a Skin Image
            </h3>
            <div className="mt-2">
              <p className="text-base text-slate-700 dark:text-slate-300">
                This image does not contain human skin and cannot be analyzed.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Please upload a clear photo of a skin condition.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-6 py-2.5 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-colors"
                onClick={handleNonSkinPopupClose}
              >
                OK, I understand
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state when analyzing
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-4 mb-4 ${
              isNonSkinImage 
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                : 'bg-teal-100 dark:bg-teal-900/50 text-teal-500 dark:text-teal-400'
            }`}>
              {isNonSkinImage ? (
                <AlertCircle className="w-10 h-10 animate-pulse" />
              ) : (
                <Camera className="w-10 h-10 animate-pulse" />
              )}
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {isNonSkinImage ? 'Not a Skin Image' : 'Analyzing Skin...'}
            </h2>
            
            <p className={`text-lg mb-6 ${
              isNonSkinImage 
                ? 'text-amber-600 dark:text-amber-400 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {isNonSkinImage 
                ? 'This image is not a human skin image.'
                : 'Please wait while we analyze your skin condition...'}
            </p>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${
                  isNonSkinImage ? 'bg-amber-500' : 'bg-teal-500'
                }`}
                style={{
                  width: isNonSkinImage ? '100%' : '70%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></div>
            </div>
            
            {isNonSkinImage && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting you back to the home page...
              </p>
            )}
          </div>
        </div>
      </div>
    );
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
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {error.includes('not of skin') ? 'Non-Skin Image' : 'Notice'}
                    </h3>
                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      <p>{error}</p>
                      {error.includes('not of skin') && (
                        <p className="mt-2">
                          Please take a clear photo of the skin condition you want to analyze.
                        </p>
                      )}
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
