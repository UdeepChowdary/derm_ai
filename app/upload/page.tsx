"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useHistory } from "@/components/history-provider"
import Image from "next/image"
import { analyzeSkinImage } from "@/lib/analyze-skin"
import { LoadingLogo } from "@/components/loading-logo"

export default function UploadPage() {
  const router = useRouter()
  const { addReport } = useHistory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const processFile = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      // Toast notification removed per user request
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) {
      // Toast notification removed per user request
      // Keeping validation check without the notification
      return
    }
    setIsAnalyzing(true)
    
    try {
      const analysis = await analyzeSkinImage(selectedImage)
      const reportData = {
        id: analysis.id,
        date: new Date().toISOString(),
        condition: analysis.condition,
        description: analysis.description,
        severity: analysis.severity,
        recommendations: analysis.recommendations,
        imageUrl: selectedImage,
      }
      addReport(reportData)
      router.push(`/report/${reportData.id}`)
    } catch (error) {
      console.error('Failed to analyze image:', error)
      // Toast notification removed per user request
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Upload Image</h1>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 flex flex-col">
        <Card
          className={`w-full aspect-square overflow-hidden relative mb-4 ${
            isDragging ? "border-2 border-dashed border-teal-500" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedImage ? (
            <div className="relative w-full h-full">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Selected skin image"
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={clearSelectedImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
              <Upload className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-center mb-2">
                {isDragging ? "Drop your image here" : "Select an image of the skin condition you want to analyze"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Drag and drop or click to browse</p>
            </div>
          )}
        </Card>

        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />

        <div className="mt-auto space-y-4">
          {!selectedImage ? (
            <Button
              className="w-full py-6 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
              onClick={triggerFileInput}
            >
              <Upload className="mr-2 h-5 w-5" />
              Select Image
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                className="w-full py-6 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                onClick={analyzeImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 mr-2">
                      <LoadingLogo />
                    </div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <>Analyze Skin Condition</>
                )}
              </Button>

              <Button variant="outline" className="w-full" onClick={triggerFileInput} disabled={isAnalyzing}>
                Choose Different Image
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
