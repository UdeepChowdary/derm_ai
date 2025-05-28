"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

type Report = {
  id: string
  date: string
  condition: string
  description: string
  severity: string
  recommendations: string[]
  imageUrl: string
  imageQuality?: number | null
}

// Type for reports stored in localStorage (with optional compressed image)
type StoredReport = Omit<Report, 'imageUrl'> & {
  imageUrl?: string
  thumbnailUrl?: string
}

type HistoryContextType = {
  reports: Report[]
  addReport: (report: Report) => void
  clearHistory: () => void
  getReportById: (id: string) => Report | undefined
}

const STORAGE_KEY = "dermascan-reports"
const MAX_REPORTS = 15
const MAX_IMAGE_SIZE = 50000 // Maximum length of base64 string for thumbnails

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

// Helper function to create a smaller thumbnail from base64 image
const createThumbnail = async (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      // Create an image element to load the base64 data
      const img = new Image()
      img.onload = () => {
        // Create a small thumbnail (max 200x200px)
        const canvas = document.createElement('canvas')
        const MAX_DIMENSION = 200
        const scale = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Draw the scaled image
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve("")
          return
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Get thumbnail as base64 with reduced quality
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6)
        resolve(thumbnailUrl)
      }
      
      img.onerror = () => resolve("")
      img.src = base64Image
    } catch (error) {
      console.error("Error creating thumbnail:", error)
      resolve("")
    }
  })
}

// Helper function to compress the report by creating a thumbnail and removing the full image
const compressReport = async (report: Report): Promise<StoredReport> => {
  if (!report.imageUrl) {
    return report as StoredReport
  }
  
  try {
    // Create a thumbnail for storage
    const thumbnailUrl = await createThumbnail(report.imageUrl)
    
    // Return report with thumbnail instead of full image
    return {
      ...report,
      thumbnailUrl,
      imageUrl: undefined // Don't store the full image in localStorage
    }
  } catch (error) {
    console.error("Error compressing report:", error)
    return {
      ...report,
      imageUrl: undefined // If compression fails, still remove the full image
    }
  }
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  
  // Load reports from localStorage on initial render
  useEffect(() => {
    const loadReports = () => {
      try {
        const savedReports = localStorage.getItem(STORAGE_KEY)
        if (savedReports) {
          const parsedReports: StoredReport[] = JSON.parse(savedReports)
          
          // Convert stored reports back to regular reports
          // Note: Full images are not stored in localStorage, only thumbnails
          const loadedReports: Report[] = parsedReports.map(report => ({
            ...report,
            imageUrl: report.thumbnailUrl || '' // Use thumbnail as the imageUrl
          }))
          
          setReports(loadedReports)
        }
      } catch (error) {
        console.error("Failed to parse saved reports:", error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    
    loadReports()
  }, [])
  
  // Save reports to localStorage whenever they change, with error handling
  useEffect(() => {
    const saveReports = async () => {
      if (reports.length === 0) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }
      
      try {
        // Compress all reports before saving
        const compressedReports: StoredReport[] = []
        
        for (const report of reports) {
          const compressed = await compressReport(report)
          compressedReports.push(compressed)
        }
        
        // Try to save to localStorage
        const serialized = JSON.stringify(compressedReports)
        localStorage.setItem(STORAGE_KEY, serialized)
      } catch (error) {
        // Handle quota exceeded or other errors
        console.error("Failed to save reports to localStorage:", error)
        
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          // If quota exceeded, show error and try to reduce data
          toast({
            title: "Storage limit reached",
            description: "Some historical data might be lost due to storage limitations.",
            variant: "destructive",
          })
          
          // Reduce number of reports and try again
          if (reports.length > 5) {
            setReports(prev => prev.slice(0, 5))
          }
        }
      }
    }
    
    saveReports()
  }, [reports])
  
  const addReport = useCallback((report: Report) => {
    setReports(prevReports => {
      // Check for duplicate - don't add if ID already exists
      if (prevReports.some(r => r.id === report.id)) {
        return prevReports
      }
      return [report, ...prevReports].slice(0, MAX_REPORTS)
    })
  }, [])
  
  const clearHistory = useCallback(() => {
    setReports([])
    localStorage.removeItem(STORAGE_KEY)
    toast({
      title: "History cleared",
      description: "All your skin analysis history has been removed.",
    })
  }, [])
  
  const getReportById = useCallback((id: string) => {
    return reports.find(report => report.id === id)
  }, [reports])
  
  return (
    <HistoryContext.Provider value={{ reports, addReport, clearHistory, getReportById }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}
