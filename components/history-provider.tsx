"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { get, set, del } from "idb-keyval"

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

type HistoryContextType = {
  reports: Report[]
  addReport: (report: Report) => void
  clearHistory: () => void
  getReportById: (id: string) => Report | undefined
}

const STORAGE_KEY = "dermascan-reports"
const MAX_REPORTS = 50 // Increased limit since we are using IndexedDB

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load reports from IndexedDB on initial render
  useEffect(() => {
    const loadReports = async () => {
      try {
        // Backward compatibility: migrate existing localStorage data to IDB
        const legacyReports = localStorage.getItem(STORAGE_KEY)
        let loadedReports: Report[] = []
        
        if (legacyReports) {
          const parsed = JSON.parse(legacyReports)
          loadedReports = parsed.map((r: any) => ({
            ...r,
            imageUrl: r.thumbnailUrl || r.imageUrl || ''
          }))
          // Save to IndexedDB and clear the legacy limit
          await set(STORAGE_KEY, loadedReports)
          localStorage.removeItem(STORAGE_KEY)
        } else {
          const idbReports = await get<Report[]>(STORAGE_KEY)
          if (idbReports) {
            loadedReports = idbReports
          }
        }
        
        setReports(loadedReports)
      } catch (error) {
        console.error("Failed to load saved reports:", error)
      } finally {
        setIsLoaded(true)
      }
    }
    
    loadReports()
  }, [])
  
  // Save reports to IndexedDB whenever they change
  useEffect(() => {
    if (!isLoaded) return // Prevent overwriting IDB with empty state before initial load
    
    const saveReports = async () => {
      if (reports.length === 0) {
        await del(STORAGE_KEY)
        return
      }
      
      try {
        await set(STORAGE_KEY, reports)
      } catch (error) {
        console.error("Failed to save reports to IndexedDB:", error)
        toast({
          title: "Storage error",
          description: "Failed to save your report data.",
          variant: "destructive",
        })
      }
    }
    
    saveReports()
  }, [reports, isLoaded])
  
  const addReport = useCallback((report: Report) => {
    setReports(prevReports => {
      if (prevReports.some(r => r.id === report.id)) {
        return prevReports
      }
      return [report, ...prevReports].slice(0, MAX_REPORTS)
    })
  }, [])
  
  const clearHistory = useCallback(async () => {
    setReports([])
    await del(STORAGE_KEY)
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
