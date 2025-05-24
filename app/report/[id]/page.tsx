"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ArrowLeft, Calendar, Info, Shield } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useHistory } from "@/components/history-provider"
import { useEffect, useState, useRef } from "react"
import { InteractiveLogo } from "@/components/interactive-logo"
import { toast } from "@/components/ui/use-toast"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2 } from "lucide-react"
import React from "react"

type ReportParams = {
  params: Promise<{ id: string }>
}

export default function ReportPage({ params }: ReportParams) {
  // Unwrap params promise for Next.js App Router
  const unwrappedParams = React.use(params) as { id: string }
  const id = unwrappedParams?.id
  const router = useRouter()
  const { reports } = useHistory()
  const [report, setReport] = useState<any>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return;
    const foundReport = reports.find((r) => r.id === id)
    if (foundReport) {
      console.log("Found report:", foundReport)
      setReport(foundReport)
    } else {
      console.error("Report not found, redirecting to home")
      router.push("/home")
    }
  }, [id, reports, router])

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Loading report...</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const shareReport = async (format: 'image' | 'pdf') => {
    if (!reportRef.current) return

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      if (format === 'image') {
        // Share as image
        const imageData = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = imageData
        link.download = `derm-report-${report.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Share as PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        })
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save(`derm-report-${report.id}.pdf`)
      }

      toast({
        title: "Success",
        description: `Report shared as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error sharing report:', error)
      toast({
        title: "Error",
        description: "Failed to share report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-[color:hsl(var(--border))] dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Skin Analysis Report</h1>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="space-y-6" ref={reportRef}>
          {/* Image */}
          <Card className="overflow-hidden border-[color:hsl(var(--border))] dark:border-teal-900">
            <div className="relative w-full aspect-square">
              <Image
                src={report.imageUrl || "/placeholder.svg"}
                alt="Skin condition"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>

          {/* Date */}
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(report.date)}</span>
          </div>

          {/* Diagnosis */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Diagnosis</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-teal-600 dark:text-teal-400 text-lg">{report.condition}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{report.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 dark:text-slate-200">Severity</h4>
                  <p className="text-slate-600 dark:text-slate-300">{report.severity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Recommendations</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-slate-600 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer with interactive logo watermark */}
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-[color:hsl(var(--border))] dark:border-amber-900/50 relative overflow-hidden">
            <div className="absolute right-4 bottom-4 opacity-5 flex items-center justify-center">
              <InteractiveLogo size="lg" />
            </div>
            <CardContent className="p-4 relative z-10">
              <div className="flex">
                <Info className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This report is generated by AI and is not a definitive diagnosis. Please consult with a healthcare
                  professional for proper medical advice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Share Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                <Share2 className="mr-2 h-5 w-5" />
                Share with Healthcare Provider
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => shareReport('image')}>
                Share as Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareReport('pdf')}>
                Share as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </main>

      <BottomNavigation currentPath="/report" />
    </div>
  )
}
