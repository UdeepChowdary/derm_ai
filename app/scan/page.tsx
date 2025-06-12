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

export default function ScanPage() {
  const router = useRouter()
  const { addReport } = useHistory()
  const [showCamera, setShowCamera] = useState(true)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
            videoRef.current.play().catch((e) => {
              if (e.name !== "AbortError") {
                console.error("Video play error:", e)
              }
            })
          }
        })
        .catch(() => {
          setShowCamera(false)
        })
    }
    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [showCamera])

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
    if (!capturedImage) {
      toast({
        title: "No Image",
        description: "Please capture an image first.",
        variant: "destructive",
      })
      return
    }
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeSkinImage(capturedImage)
      const reportData = {
        id: analysis.id,
        date: new Date().toISOString(),
        condition: analysis.condition,
        description: analysis.description,
        severity: analysis.severity,
        recommendations: analysis.recommendations,
        imageUrl: capturedImage,
      }
      
      // Wait for the report to be added before redirecting
      await new Promise<void>((resolve) => {
        addReport(reportData)
        // Give it a small delay to ensure state is updated
        setTimeout(resolve, 100)
      })
      
      router.push(`/report/${reportData.id}`)
    } catch (error) {
      console.error('Failed to analyze image:', error)
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-white">Scan Skin Condition</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <Card className="bg-slate-800 border-none shadow-none">
          <CardContent className="flex flex-col items-center">
            {showCamera && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <video ref={videoRef} className="rounded-xl w-[340px] h-[340px] object-cover bg-black" autoPlay playsInline />
                <Button onClick={capturePhoto} className="bg-[#14B8A6] text-white w-[340px]">
                  <Camera className="mr-2 h-5 w-5" /> Capture Image
                </Button>
                <canvas ref={canvasRef} className="hidden" />
                <div className="text-slate-400 text-center mt-2">Press Space or Enter key to capture when focused.</div>
              </div>
            )}
            {capturedImage && isAnalyzing && (
              <div className="flex flex-col items-center gap-4 mt-4 relative">
                <img src={capturedImage} alt="Captured" className="rounded-xl w-[340px] h-[340px] object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <LoadingLogo size="md" />
                  <div className="mt-4 text-lg font-medium text-white drop-shadow text-center">Analyzing skin condition...</div>
                </div>
              </div>
            )}
            {capturedImage && !isAnalyzing && !analysis && analyzeImage()}
            {capturedImage && !isAnalyzing && analysis && (
              <div className="flex flex-col items-center w-full max-w-md mx-auto mt-6">
                {/* Image */}
                <img src={analysis.imageUrl} alt="Analyzed" className="rounded-xl w-[320px] h-[320px] object-cover mb-4 border-2 border-slate-800 shadow-lg" />
                {/* Date/Time */}
                <div className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {/* Diagnosis Card */}
                <Card className="bg-slate-900 border border-slate-800 mb-4 w-full">
                  <CardHeader>
                    <CardTitle className="text-white mb-1">Diagnosis</CardTitle>
                    <div className="text-teal-400 font-semibold text-lg mb-1">
                      <a href="#" className="hover:underline">{analysis.name}</a>
                    </div>
                    <CardDescription className="text-slate-300 mb-2">{analysis.description}</CardDescription>
                    <div className="text-slate-200 text-sm"><span className="font-semibold">Severity</span><br />{analysis.severity}</div>
                  </CardHeader>
                </Card>
                {/* Recommendations Card */}
                <Card className="bg-slate-900 border border-slate-800 mb-4 w-full">
                  <CardHeader>
                    <CardTitle className="text-white mb-1">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ol className="list-none pl-0 space-y-2">
                      {analysis.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-teal-600 text-white font-bold text-sm mt-0.5">{idx + 1}</span>
                          <span className="text-slate-200">{rec}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
                {/* AI Disclaimer */}
                <div className="w-full mb-4">
                  <div className="bg-amber-900/80 border border-amber-700 text-amber-200 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                    <span>This report is generated by AI and is not a definitive diagnosis. Please consult with a healthcare professional for proper medical advice.</span>
                  </div>
                </div>
                {/* Share Button */}
                <Button className="w-full bg-teal-600 text-white text-base font-semibold py-6 rounded-xl shadow-lg hover:bg-teal-700 transition">Share with Healthcare Provider</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}