"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ArrowLeft, Calendar, Info, Shield } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useHistory } from "@/components/history-provider"
import { useEffect, useState } from "react"
import { InteractiveLogo } from "@/components/interactive-logo"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

type ReportParams = {
  params: {
    id: string
  }
}

export default function ReportPage({ params }: ReportParams) {
  const router = useRouter()
  const { reports } = useHistory()
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    const foundReport = reports.find((r) => r.id === params.id)
    if (foundReport) {
      console.log("Found report:", foundReport)
      setReport(foundReport)
    } else {
      console.error("Report not found, redirecting to home")
      router.push("/home")
    }
  }, [params.id, reports, router])

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Loading report...</p>
      </div>
    )
  }

  const handleShareReport = async () => {
    try {
      if (!report) {
        throw new Error('No report data available');
      }

      const reportElement = document.getElementById('report-content');
      if (!reportElement) {
        throw new Error('Report content element not found');
      }

      // Show loading state
      const originalButtonText = document.querySelector('.share-button-text');
      if (originalButtonText) {
        originalButtonText.textContent = 'Processing...';
      }

      // Make sure all images are loaded before capturing
      const images = reportElement.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails
        });
      }));

      // Capture the report with improved settings
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow potentially tainted images
        backgroundColor: '#ffffff', // Ensure white background for the canvas
        width: reportElement.scrollWidth, // Capture the full scrollable width of the element
        height: reportElement.scrollHeight, // Capture the full scrollable height of the element
        // Ensure that styles are applied correctly, especially for backgrounds.
        // html2canvas might sometimes miss explicit background colors on the body or html tags
        // if the target element doesn't have its own. The `backgroundColor` option above helps.
        // Also, ensure that the element and its parents are visible and not display:none.
      }).catch(err => {
        console.error('html2canvas error:', err);
        throw new Error(`Failed to capture report: ${err.message}`);
      });
      
      console.log('Report captured successfully, canvas dimensions:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create share options menu
      const shareOptions = [
        { label: 'Download as PDF', action: 'pdf' },
        { label: 'Download as Image', action: 'image' },
      ];

      // Create a more reliable modal dialog for export options
      const selectedOption = await new Promise<string>((resolve) => {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white dark:bg-slate-800 rounded-lg p-4 w-64';
        modal.appendChild(modalContent);
        
        // Add header
        const header = document.createElement('h3');
        header.className = 'text-lg font-semibold mb-4';
        header.textContent = 'Export Report';
        modalContent.appendChild(header);
        
        // Add options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'space-y-2';
        modalContent.appendChild(optionsContainer);
        
        // Add option buttons
        shareOptions.forEach(option => {
          const button = document.createElement('button');
          button.className = 'w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded';
          button.textContent = option.label;
          button.onclick = () => {
            modal.remove();
            resolve(option.action);
          };
          optionsContainer.appendChild(button);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
            resolve('');
          }
        });
        
        // Add modal to document
        document.body.appendChild(modal);
      });
      
      console.log('Selected export option:', selectedOption);

      if (!selectedOption) {
        if (originalButtonText) originalButtonText.textContent = 'Share with Healthcare Provider';
        return;
      }

      if (selectedOption === 'pdf') {
        try {
          console.log('Creating PDF with dimensions:', canvas.width, 'x', canvas.height);
          // Create PDF with proper dimensions
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
            hotfixes: ['px_scaling']
          });
          
          // Calculate optimal dimensions to fit on PDF page
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
          const imgWidth = canvas.width * ratio;
          const imgHeight = canvas.height * ratio;
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;
          
          // Add image to PDF with calculated dimensions
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
          pdf.save(`report-${report.id}.pdf`);
          console.log('PDF saved successfully');
        } catch (pdfError) {
          console.error('Error creating PDF:', pdfError);
          alert('Failed to create PDF. Please try again.');
        }
      } else if (selectedOption === 'image') {
        try {
          // Create download link for image
          const link = document.createElement('a');
          link.download = `report-${report.id}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('Image downloaded successfully');
        } catch (imgError) {
          console.error('Error downloading image:', imgError);
          alert('Failed to download image. Please try again.');
        }
      }

      if (originalButtonText) originalButtonText.textContent = 'Share with Healthcare Provider';
    } catch (error) {
      console.error('Error sharing report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report';
      
      // Use toast notification instead of alert for better UX
      console.error(`Error exporting report: ${errorMessage}`);
      
      // Show a more user-friendly error message
      const errorDetails = error instanceof Error ? error.message : 'Unknown error';
      alert(`Unable to export report: ${errorDetails}\n\nPlease try again or try a different export format.`);
      
      // Always reset the button text
      const originalButtonText = document.querySelector('.share-button-text');
      if (originalButtonText) {
        originalButtonText.textContent = 'Share with Healthcare Provider';
      }
    } finally {
      // Ensure button text is reset even if there's an error in the catch block
      const originalButtonText = document.querySelector('.share-button-text');
      if (originalButtonText && originalButtonText.textContent === 'Processing...') {
        originalButtonText.textContent = 'Share with Healthcare Provider';
      }
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Skin Analysis Report</h1>
      </header>

      <main id="report-content" className="flex-1 container max-w-md mx-auto p-4 pb-20">
        <div className="space-y-6">
          {/* Image */}
          <Card className="overflow-hidden border-teal-100 dark:border-teal-900">
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
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 relative overflow-hidden">
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
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            onClick={handleShareReport}
          >
            <Shield className="mr-2 h-5 w-5" />
            <span className="share-button-text">Share with Healthcare Provider</span>
          </Button>
        </div>
      </main>

      <BottomNavigation currentPath="/report" />
    </div>
  )
}
