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
import { useTranslations } from "@/lib/language-provider"
import { LanguageSelectorMenu } from "@/components/language-selector-menu"

export default function UploadPage({ params }: { params: { locale: string } }) {
  const router = useRouter()
  const { addReport } = useHistory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const t = useTranslations()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const processFile = (file?: File) => {
    if (!file) return
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      // No notification for invalid file type
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleClearImage = () => {
    setSelectedImage(null)
  }

  const analyzeImage = async () => {
    if (!selectedImage) {
      // No notification for no image selected
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeSkinImage(selectedImage)
      
      if (analysis) {
        // Add to history
        addReport({
          id: analysis.id,
          condition: analysis.condition,
          severity: analysis.severity,
          description: analysis.description,
          recommendations: analysis.recommendations,
          date: new Date().toISOString(),
          imageUrl: selectedImage,
        })
        
        // Navigate to report
        router.push(`/${params.locale}/report/${analysis.id}`)
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
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${params.locale}/home`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">{t('upload.title')}</h1>
        </div>
        <LanguageSelectorMenu />
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {t('upload.subtitle')}
            </p>
          </div>

          {!selectedImage ? (
            <Card
              className={`border-2 border-dashed ${
                isDragging 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-slate-300 dark:border-slate-700'
              } rounded-lg overflow-hidden`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('upload.drag_drop')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {t('upload.or')}
                </p>
                <Button variant="outline" onClick={handleBrowseClick}>
                  {t('upload.browse')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="relative border-[color:hsl(var(--border))] dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="relative aspect-square w-full">
                  <Image
                    src={selectedImage}
                    alt="Selected skin image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white dark:bg-slate-900/80 rounded-full h-8 w-8"
                  onClick={handleClearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleClearImage}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  disabled={isAnalyzing}
                  onClick={analyzeImage}
                  className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin mr-2">
                        <LoadingLogo size="sm" />
                      </div>
                      <span>{t('analysis.loading')}</span>
                    </>
                  ) : (
                    t('upload.analyze_button')
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
