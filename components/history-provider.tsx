"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Report = {
  id: string
  date: string
  condition: string
  description: string
  severity: string
  recommendations: string[]
  imageUrl: string
}

type HistoryContextType = {
  reports: Report[]
  addReport: (report: Report) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])

  // Load reports from localStorage on initial render
  useEffect(() => {
    const savedReports = localStorage.getItem("dermascan-reports")
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports))
      } catch (error) {
        console.error("Failed to parse saved reports:", error)
        localStorage.removeItem("dermascan-reports")
      }
    }
  }, [])

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dermascan-reports", JSON.stringify(reports))
  }, [reports])

  const MAX_REPORTS = 10;
  const addReport = (report: Report) => {
    setReports((prevReports) => [report, ...prevReports].slice(0, MAX_REPORTS))
  }

  const clearHistory = () => {
    setReports([])
  }

  return <HistoryContext.Provider value={{ reports, addReport, clearHistory }}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}
