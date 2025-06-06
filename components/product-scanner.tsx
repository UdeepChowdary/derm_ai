"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Search, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"

interface Ingredient {
  name: string
  safety: "safe" | "moderate" | "unsafe"
  description: string
}

interface ProductAnalysis {
  name: string
  ingredients: Ingredient[]
  overallSafety: "safe" | "moderate" | "unsafe"
  recommendations: string[]
}

export function ProductScanner() {
  const [isScanning, setIsScanning] = React.useState(false)
  const [productName, setProductName] = React.useState("")
  const [analysis, setAnalysis] = React.useState<ProductAnalysis | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = React.useState(false)

  const handleScan = async () => {
    setShowCamera(true)
    setCapturedImage(null)
    setAnalysis(null)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } catch (err) {
        alert("Camera access denied or not available.")
        setShowCamera(false)
      }
    } else {
      alert("Camera not supported on this device.")
      setShowCamera(false)
    }
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

  const handleSearch = () => {
    // Implement product search functionality
    console.log("Searching for:", productName)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Scanner</CardTitle>
          <CardDescription>
            Scan or search for skincare products to analyze their ingredients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleScan}
              disabled={isScanning}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : "Scan Product"}
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search product..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
              <Button onClick={() => {/* trigger analysis logic here */}} className="bg-[#14B8A6] text-white">Analyze Image</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{analysis.name}</CardTitle>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-sm font-medium",
                    analysis.overallSafety === "safe" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                    analysis.overallSafety === "moderate" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                    analysis.overallSafety === "unsafe" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {analysis.overallSafety.charAt(0).toUpperCase() + analysis.overallSafety.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Ingredients Analysis</h3>
                <div className="space-y-2">
                  {analysis.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.name}
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      {ingredient.safety === "safe" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                      ) : ingredient.safety === "moderate" ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-1" />
                      )}
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {ingredient.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span className="text-primary">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
} 