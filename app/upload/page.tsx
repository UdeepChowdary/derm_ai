"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Camera, 
  InfoIcon, 
  CheckCircle, 
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { useHistory } from "@/components/history-provider"
import Image from "next/image"
import { analyzeSkinImage, isSkinAnalysisResult, isNonSkinImageResult } from "@/lib/analyze-skin"
import { LoadingLogo } from "@/components/loading-logo"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageCaptureGuide, ImageQualityAssessment } from "@/components/image-capture-guide"

interface ImageQualityResult {
  score: number
  brightness: number
  contrast: number
  focus: number
  resolution: number
  issues: string[]
  recommendations: string[]
}

export default function UploadPage() {
  const router = useRouter()
  const { addReport } = useHistory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageQuality, setImageQuality] = useState<ImageQualityResult | null>(null)
  const [showQualityAssessment, setShowQualityAssessment] = useState(false)
  const [showPhotoTips, setShowPhotoTips] = useState(false)
  const [showNonSkinPopup, setShowNonSkinPopup] = useState(false)

  useEffect(() => {
    // Show photo tips to new users
    if (!localStorage.getItem('photo_tips_shown')) {
      setShowPhotoTips(true)
      localStorage.setItem('photo_tips_shown', 'true')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const processFile = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.).",
        variant: "destructive",
      })
      return
    }

    // Reset quality assessment when a new image is loaded
    setImageQuality(null)
    setShowQualityAssessment(true)

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
    setImageQuality(null)
    setShowQualityAssessment(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleQualityAssessment = (result: ImageQualityResult) => {
    setImageQuality(result)
    
    // Provide feedback based on image quality
    if (result.score < 50) {
      toast({
        title: "Low Image Quality",
        description: "This image may not provide accurate analysis results. Consider taking a new photo following the guidelines.",
        variant: "destructive",
      })
    } else if (result.score >= 50 && result.score < 70) {
      toast({
        title: "Acceptable Image Quality",
        description: "The analysis may proceed, but a better quality image would yield more accurate results.",
        variant: "default",
      })
    } else {
      toast({
        title: "Good Image Quality",
        description: "This image should provide accurate analysis results.",
        variant: "default",
      })
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      })
      return
    }
    
    // Warn about poor quality but allow analysis to continue
    if (imageQuality && imageQuality.score < 50) {
      const continueAnyway = window.confirm(
        "The image quality is poor, which may affect the accuracy of the analysis. Do you want to continue anyway?"
      )
      if (!continueAnyway) return
    }
    
    setIsAnalyzing(true)
    
    try {
      const analysis = await analyzeSkinImage(selectedImage)
      console.log('Upload analysis result:', JSON.stringify(analysis, null, 2));

      if (isNonSkinImageResult(analysis)) {
        setShowNonSkinPopup(true)
        setIsAnalyzing(false)
        return
      }

      const reportData = {
        id: (analysis as any).id || `report-${Date.now()}`,
        date: new Date().toISOString(),
        condition: (analysis as any).condition || 'Unknown Condition',
        description: (analysis as any).description || 'No description available',
        severity: (analysis as any).severity || 'Moderate',
        recommendations: (analysis as any).recommendations || [
          'Consult with a dermatologist for a professional evaluation.',
          'Monitor the area for any changes in size, shape, or color.'
        ],
        imageUrl: selectedImage,
        imageQuality: imageQuality ? imageQuality.score : null,
        warning: (analysis as any).warning,
      }

      if ((analysis as any).warning) {
        toast({
          title: 'Analysis Warning',
          description: (analysis as any).warning,
          variant: 'default',
        })
      }
      
      addReport(reportData)
      
      // Success toast
      toast({
        title: "Analysis Complete",
        description: "Your skin condition has been analyzed successfully.",
      })
      
      router.push(`/report/${reportData.id}`)
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNonSkinPopupClose = () => {
    setShowNonSkinPopup(false)
    setSelectedImage(null)
    router.push('/home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Upload Image</h1>
        </div>
        
        <ImageCaptureGuide onClose={() => setShowPhotoTips(false)} />
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 flex flex-col">
        {/* Photo tips card - shown to new users */}
        {showPhotoTips && (
          <Card className="mb-4 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900">
            <CardContent className="pt-4">
              <div className="flex items-start">
                <Camera className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-teal-700 dark:text-teal-300 mb-1">Tips for Better Photos</h3>
                  <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">
                    For the most accurate analysis, ensure your photos are:
                  </p>
                  <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1 mb-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Well-lit with natural daylight when possible</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>In focus and clearly showing the affected area</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Taken at a distance of 6-12 inches from the skin</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                    onClick={() => setShowPhotoTips(false)}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
              
              {/* Quality indicator badge */}
              {imageQuality && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm p-2 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      {imageQuality.score >= 80 ? (
                        <Sparkles className="h-4 w-4 text-green-400 mr-1" />
                      ) : imageQuality.score >= 60 ? (
                        <CheckCircle className="h-4 w-4 text-amber-400 mr-1" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400 mr-1" />
                      )}
                      <span className="text-xs text-white font-medium">
                        Image Quality: 
                        {imageQuality.score >= 80 ? " Good" : 
                        imageQuality.score >= 60 ? " Acceptable" : 
                        " Poor"}
                      </span>
                    </div>
                    <span className="text-xs text-white">{imageQuality.score}%</span>
                  </div>
                  <Progress value={imageQuality.score} className="h-1" />
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
              <Camera className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-center mb-2">
                {isDragging ? "Drop your image here" : "Select an image of the skin condition you want to analyze"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">Drag and drop or click to browse</p>
              
              <div className="flex items-center justify-center w-full">
                <Button variant="outline" size="sm" onClick={() => setShowPhotoTips(true)} className="text-xs">
                  <InfoIcon className="h-3 w-3 mr-1" />
                  Photo Tips
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Image quality assessment */}
        {selectedImage && showQualityAssessment && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <h3 className="font-medium text-slate-800 dark:text-white mb-3 flex items-center">
                <InfoIcon className="h-4 w-4 mr-2 text-slate-500" />
                Image Quality Assessment
              </h3>
              
              <ImageQualityAssessment 
                imageData={selectedImage} 
                onQualityCheck={handleQualityAssessment} 
              />
            </CardContent>
          </Card>
        )}

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

      {/* Non-skin Image Popup */}
      {showNonSkinPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Not a Skin Image
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                This image does not contain human skin and cannot be analyzed. Please upload a clear photo of a skin condition.
              </p>
              <Button
                onClick={handleNonSkinPopupClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                OK, I understand
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
