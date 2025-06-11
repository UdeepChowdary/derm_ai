"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNavigation } from "@/components/bottom-navigation"
import { 
  ArrowLeft, 
  Calendar, 
  Info, 
  Shield, 
  TrendingUp, 
  FileText, 
  Activity 
} from "lucide-react"
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
import { ConditionDetails } from "@/components/condition-details"

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
  const [previousReports, setPreviousReports] = useState<any[]>([])
  const reportRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return;
    
    // Check if reports are loaded
    if (reports.length === 0) {
      console.log("Reports not loaded yet")
      return
    }
    
    const foundReport = reports.find((r) => r.id === id)
    
    if (foundReport) {
      console.log("Found report:", foundReport)
      setReport(foundReport)
      
      // Find previous reports for the same condition (for trend analysis)
      const condition = foundReport.condition.toLowerCase()
      const previousRelatedReports = reports
        .filter(r => 
          r.id !== id && 
          r.condition?.toLowerCase()?.includes(condition) &&
          new Date(r.date) < new Date(foundReport.date)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setPreviousReports(previousRelatedReports)
      setIsLoading(false)
    } else {
      console.error("Report not found in reports:", { id, reports })
      // Only redirect if we're sure the report doesn't exist
      const timer = setTimeout(() => {
        if (reports.length > 0) { // Only redirect if we've actually loaded reports
          console.log("Report not found after loading, redirecting to home")
          router.push("/home")
        }
      }, 1000) // Give it a second to make sure reports are loaded
      
      return () => clearTimeout(timer)
    }
  }, [id, reports, router])

  if (isLoading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="mb-4">
          <InteractiveLogo size="lg" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {reports.length === 0 ? 'Loading your reports...' : 'Loading report details...'}
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/home')}
          className="mt-4"
        >
          Back to Home
        </Button>
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
      // Hide the share button during export by setting a class
      const buttonContainer = document.getElementById('share-button-container')
      if (buttonContainer) {
        buttonContainer.style.display = 'none'
      }

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

      // Restore the share button after export
      if (buttonContainer) {
        buttonContainer.style.display = 'block'
      }

      toast({
        title: "Report shared successfully",
        description: `Your report has been saved as a ${format.toUpperCase()} file.`,
      });
    } catch (error) {
      console.error('Error sharing report:', error)
      
      // Restore the share button in case of error
      const errorButtonContainer = document.getElementById('share-button-container')
      if (errorButtonContainer) {
        errorButtonContainer.style.display = 'block'
      }

      toast({
        title: "Error sharing report",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }

  // Calculate risk score (0-100) based on severity
  const calculateRiskScore = (severityString: string) => {
    const severityMap: Record<string, number> = {
      "Mild": 25,
      "Moderate": 50,
      "Severe": 75,
      "Critical": 100
    };
    
    return severityMap[report.severity] || 50;
  };
  
  // Get color class based on severity level
  const getSeverityColor = (severityString: string) => {
    const colorMap: Record<string, string> = {
      "Mild": "bg-green-500",
      "Moderate": "bg-yellow-500",
      "Severe": "bg-orange-500",
      "Critical": "bg-red-500"
    };
    
    return colorMap[report.severity] || "bg-yellow-500";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-[color:hsl(var(--border))] dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Skin Analysis Report</h1>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          {/* Only displaying Overview tab */}
          <TabsList className="grid grid-cols-1 mb-4">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6" ref={reportRef}>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-teal-600 dark:text-teal-400 text-xl">{report.condition}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">{report.description}</p>
                    {report.confidence && (
                      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>Confidence: </span>
                        <span className="font-medium">{(report.confidence * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Severity Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700 dark:text-slate-200 text-lg">Severity Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                        <span>Critical</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getSeverityColor(report.severity)} transition-all duration-500`} 
                          style={{ width: `${report.riskScore}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full ${getSeverityColor(report.severity)} mr-2`}></div>
                          <p className="text-slate-600 dark:text-slate-300 font-medium">
                            {report.severity} Severity
                          </p>
                        </div>
                        <span className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 px-3 py-1 rounded-full">
                          Risk Score: {report.riskScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Condition Details */}
                  {report.conditionDetails && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200 text-lg">Condition Details</h4>
                      <div className="space-y-4">
                        {report.conditionDetails.symptoms && report.conditionDetails.symptoms.length > 0 && (
                          <div>
                            <h5 className="font-medium text-slate-600 dark:text-slate-300 mb-1">Common Symptoms:</h5>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                              {report.conditionDetails.symptoms.map((symptom: string, i: number) => (
                                <li key={i}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {report.conditionDetails.causes && report.conditionDetails.causes.length > 0 && (
                          <div>
                            <h5 className="font-medium text-slate-600 dark:text-slate-300 mb-1">Possible Causes:</h5>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                              {report.conditionDetails.causes.map((cause: string, i: number) => (
                                <li key={i}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {report.conditionDetails.whenToSeeDoctor && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h5 className="font-medium text-amber-700 dark:text-amber-300 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              When to see a doctor:
                            </h5>
                            <p className="mt-1 text-amber-700 dark:text-amber-300/90">
                              {report.conditionDetails.whenToSeeDoctor}
                            </p>
                          </div>
                        )}
                        
                        {report.conditionDetails.treatmentOptions && report.conditionDetails.treatmentOptions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-slate-600 dark:text-slate-300 mb-1">Treatment Options:</h5>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                              {report.conditionDetails.treatmentOptions.map((treatment: string, i: number) => (
                                <li key={i}>{treatment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <Card>
              <CardHeader className="pb-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Recommended Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Recommendations */}
                  <div>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 text-lg">Immediate Steps</h3>
                    <ul className="space-y-3">
                      {report.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start group">
                          <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-3 mt-0.5 flex-shrink-0 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/70 transition-colors">
                            {index + 1}
                          </div>
                          <span className="text-slate-600 dark:text-slate-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention Tips */}
                  {report.preventionTips && report.preventionTips.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 text-lg">Prevention Tips</h3>
                      <ul className="space-y-2">
                        {report.preventionTips.map((tip: string, index: number) => (
                          <li key={`prevent-${index}`} className="flex items-start">
                            <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            </div>
                            <span className="text-slate-600 dark:text-slate-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {report.additionalNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Additional Information
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300/90">
                        {report.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
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
          </TabsContent>
          
          {/* Details and Trends tabs have been removed */}
        </Tabs>
        
        {/* Share Button - outside the reportRef div so it won't be included in exports */}
        <div id="share-button-container" className="mt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                <Share2 className="mr-2 h-5 w-5" />
                Share with Healthcare Provider
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setActiveTab("overview");
                setTimeout(() => shareReport('image'), 300);
              }}>
                Share as Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setActiveTab("overview");
                setTimeout(() => shareReport('pdf'), 300);
              }}>
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
