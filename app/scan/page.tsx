"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeft, Camera, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { useHistory } from "@/components/history-provider"
import { LoadingLogo } from "@/components/loading-logo"

export default function ScanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addReport } = useHistory()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraState, setCameraState] = useState<"initializing" | "ready" | "error" | "not-supported">("initializing")
  const [isCaptured, setIsCaptured] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)

  // Initialize camera on component mount
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    console.log("Component mounted, preparing camera initialization...")

    // Function to check if video element is ready
    const checkVideoElement = () => {
      if (!mounted) return false

      if (!videoRef.current) {
        console.log("Video element not ready yet, waiting...")
        timeoutId = setTimeout(checkVideoElement, 100)
        return false
      }

      console.log("Video element is ready, initializing camera")
      return true
    }

    const initCamera = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log("Camera not supported")
          setCameraState("not-supported")
          setErrorMessage("Camera not supported on this device or browser.")
          return
        }

        // Ensure video element is available before proceeding
        if (!videoRef.current) {
          console.log("Video element not available, cannot initialize camera")
          setCameraState("error")
          setErrorMessage("Could not initialize video element. Please try again.")
          return
        }

        console.log("Requesting camera access...")

        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        })

        if (!mounted) {
          // Component unmounted during async operation
          console.log("Component unmounted, cleaning up stream")
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        console.log("Camera access granted, setting up video")

        // Set the stream to state for later cleanup
        setStream(mediaStream)

        // Double check video element is still available
        if (!videoRef.current) {
          console.log("Video element no longer available after camera access")
          setCameraState("error")
          setErrorMessage("Video element not available. Please try again.")
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }

        // Connect stream to video element
        videoRef.current.srcObject = mediaStream

        // Force a play attempt to detect any issues
        try {
          await videoRef.current.play()
          console.log("Video playing successfully")
          setCameraState("ready")
        } catch (playErr) {
          console.error("Error playing video:", playErr)
          setCameraState("error")
          setErrorMessage(
            "Could not start video stream: " + (playErr instanceof Error ? playErr.message : String(playErr)),
          )
        }
      } catch (err) {
        if (!mounted) return

        console.error("Camera initialization error:", err)

        // Handle specific error types
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            setCameraState("error")
            setErrorMessage("Camera access denied. Please allow camera access to use this feature.")
            toast({
              title: "Camera Access Denied",
              description: "Please allow camera access in your browser settings.",
              variant: "destructive",
            })
          } else if (err.name === "NotFoundError") {
            setCameraState("error")
            setErrorMessage("No camera found on this device.")
          } else if (err.name === "NotReadableError") {
            setCameraState("error")
            setErrorMessage("Camera is already in use by another application.")
          } else if (err.name === "OverconstrainedError") {
            setCameraState("error")
            setErrorMessage("Camera does not meet the required constraints.")
          } else if (err.name === "AbortError") {
            setCameraState("error")
            setErrorMessage("Camera access was aborted.")
          } else {
            setCameraState("error")
            setErrorMessage(`Camera error: ${err.message}`)
          }
        } else {
          setCameraState("error")
          setErrorMessage("An unexpected error occurred while accessing the camera.")
        }
      }
    }

    // Start the process by checking if video element is ready
    if (checkVideoElement()) {
      // If video element is immediately available, start camera initialization with a small delay
      timeoutId = setTimeout(initCamera, 300)
    }

    // Cleanup function
    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (stream) {
        console.log("Cleaning up camera stream on unmount")
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [toast])

  // Capture image from video stream and automatically start analysis
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || cameraState !== "ready") {
      console.log("Cannot capture: video ref, canvas ref, or camera state issue", {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current,
        cameraState,
      })
      toast({
        title: "Capture Error",
        description: "Camera not ready. Please ensure camera is properly initialized.",
        variant: "destructive",
      })
      return
    }

    console.log("Capturing image from video")

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) {
      console.error("Could not get canvas context")
      toast({
        title: "Capture Error",
        description: "Could not initialize canvas for image capture.",
        variant: "destructive",
      })
      return
    }

    // Ensure video has valid dimensions before capturing
    if (!video.videoWidth || !video.videoHeight) {
      console.error("Video dimensions not available")
      toast({
        title: "Capture Error",
        description: "Could not capture image. Please try again when camera is ready.",
        variant: "destructive",
      })
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    console.log(`Canvas dimensions set to ${canvas.width}x${canvas.height}`)

    // Draw video frame to canvas
    try {
      // Clear canvas first
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      // Ensure video is playing and ready
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        console.log("Image captured successfully")

        // Get image data from canvas
        const imageUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImageUrl(imageUrl)

        // Set captured state
        setIsCaptured(true)

        // Stop camera after capture to save battery/resources
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }

        // Automatically start analysis
        analyzeImage(imageUrl)
      } else {
        toast({
          title: "Capture Error",
          description: "Video not ready. Please wait a moment and try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error capturing image:", err)
      toast({
        title: "Capture Error",
        description: "Could not capture image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Retake photo - restart camera
  const retakePhoto = async () => {
    console.log("Retaking photo, restarting camera")
    setIsCaptured(false)
    setIsAnalyzing(false)
    setCapturedImageUrl(null)
    setCameraState("initializing")

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    try {
      // Request camera access again
      console.log("Requesting camera access for retake")
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      // Set the stream to state for later cleanup
      setStream(mediaStream)

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Force a play attempt
        try {
          await videoRef.current.play()
          console.log("Video playing successfully for retake")
          setCameraState("ready")
        } catch (playErr) {
          console.error("Error playing video for retake:", playErr)
          setCameraState("error")
          setErrorMessage("Could not restart video stream.")
        }
      }
    } catch (err) {
      console.error("Error restarting camera:", err)
      setCameraState("error")
      setErrorMessage("Could not restart camera. Please try again.")
      toast({
        title: "Camera Error",
        description: "Could not restart camera. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Analyze the captured image
  const analyzeImage = (imageUrl: string) => {
    console.log("Analyzing captured image")
    setIsAnalyzing(true)

    try {
      // First ensure we have a valid image URL
      if (!imageUrl) {
        throw new Error("No image data available for analysis");
      }
      
      // Simulate analysis delay (in a real app, this would be an API call)
      setTimeout(() => {
        try {
          console.log("Analysis complete, generating report")

          // Generate mock report data with more realistic content
          const conditions = [
            {
              name: "Contact Dermatitis",
              description:
                "Inflammation caused by contact with a substance that irritates the skin or causes an allergic reaction.",
              severity: "Mild to Moderate",
              recommendations: [
                "Avoid the irritant or allergen",
                "Apply cool, wet compresses",
                "Use over-the-counter anti-itch creams",
                "Take oral antihistamines for itching",
              ],
            },
            {
              name: "Atopic Dermatitis (Eczema)",
              description: "A chronic skin condition characterized by itchy, inflamed skin with red, scaly patches.",
              severity: "Moderate",
              recommendations: [
                "Moisturize skin at least twice daily",
                "Avoid harsh soaps and irritants",
                "Apply prescribed topical corticosteroids",
                "Consider antihistamines for itching",
                "Keep fingernails short to prevent damage from scratching",
              ],
            },
            {
              name: "Psoriasis",
              description:
                "An autoimmune condition causing rapid skin cell growth, resulting in thick, red patches with silvery scales.",
              severity: "Moderate to Severe",
              recommendations: [
                "Use medicated creams or ointments",
                "Consider phototherapy treatment",
                "Keep skin moisturized",
                "Avoid triggers like stress and alcohol",
                "Consult a dermatologist for prescription treatments",
              ],
            },
          ]

          // Select a random condition for the demo
          const selectedCondition = conditions[Math.floor(Math.random() * conditions.length)]

          const reportData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            condition: selectedCondition.name,
            description: selectedCondition.description,
            severity: selectedCondition.severity,
            recommendations: selectedCondition.recommendations,
            imageUrl: imageUrl,
          }

          // Add to history
          addReport(reportData)

          // Navigate to report page
          router.push(`/report/${reportData.id}`)
        } catch (err) {
          console.error("Error generating report:", err)
          setIsAnalyzing(false)
          toast({
            title: "Analysis Error",
            description: "Could not generate report. Please try again.",
            variant: "destructive",
          })
        }
      }, 2000)
    } catch (err) {
      console.error("Error processing image:", err)
      setIsAnalyzing(false)
      toast({
        title: "Analysis Error",
        description: "Could not process image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Retry camera initialization after error
  const retryCamera = () => {
    console.log("Retrying camera initialization")
    setCameraState("initializing")
    setErrorMessage("")

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Reinitialize camera
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      .then((mediaStream) => {
        console.log("Camera retry successful, setting up video")
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream

          // Force a play attempt
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playing successfully after retry")
              setCameraState("ready")
            })
            .catch((err) => {
              console.error("Error playing video after retry:", err)
              setCameraState("error")
              setErrorMessage("Could not start video stream after retry.")
            })
        }
      })
      .catch((err) => {
        console.error("Camera retry error:", err)
        setCameraState("error")
        setErrorMessage("Could not access camera. Please check permissions and try again.")
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please check permissions and try again.",
          variant: "destructive",
        })
      })
  }

  // Redirect to upload page if camera is not supported
  const goToUpload = () => {
    console.log("Redirecting to upload page")
    router.push("/upload")
  }

  // Debug camera state
  useEffect(() => {
    console.log("Camera state changed:", cameraState)
  }, [cameraState])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Skin Scan</h1>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 flex flex-col">
        <Card className="w-full aspect-square overflow-hidden relative mb-4">
          {/* Always render the video element but hide it when not needed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${cameraState !== "ready" || isCaptured ? "hidden" : ""}`}
            onError={(e) => {
              console.error("Video element error:", e)
              setCameraState("error")
              setErrorMessage("Video playback error: " + (e.currentTarget.error?.message || "Unknown error"))
            }}
          />

          {/* Captured image */}
          <div className={`relative w-full h-full ${!isCaptured ? "hidden" : ""}`}>
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <LoadingLogo size="md" />
                <p className="text-white mt-4 animate-pulse">Analyzing skin condition...</p>
              </div>
            )}
          </div>

          {/* Camera initializing */}
          {cameraState === "initializing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
              <LoadingLogo />
              <p className="text-slate-500 dark:text-slate-400 mt-4">Initializing camera...</p>
            </div>
          )}

          {/* Camera error */}
          {cameraState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Camera Error</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{errorMessage}</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button onClick={retryCamera} variant="outline" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Camera
                </Button>
                <Button onClick={goToUpload} className="w-full">
                  Upload Image Instead
                </Button>
              </div>
            </div>
          )}

          {/* Camera not supported */}
          {cameraState === "not-supported" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Camera Not Supported</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Your device or browser doesn't support camera access.
              </p>
              <Button onClick={goToUpload} className="w-full max-w-xs">
                Upload Image Instead
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-auto space-y-4">
          {/* Camera ready but not captured yet */}
          {cameraState === "ready" && !isCaptured && (
            <Button
              className="w-full py-6 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
              onClick={captureImage}
            >
              <Camera className="mr-2 h-5 w-5" />
              Capture Image
            </Button>
          )}

          {/* Image captured and analyzing - show cancel button */}
          {isCaptured && isAnalyzing && (
            <Button variant="outline" className="w-full" onClick={retakePhoto}>
              Cancel Analysis
            </Button>
          )}

          {/* Show upload alternative when initializing */}
          {cameraState === "initializing" && (
            <Button variant="outline" className="w-full" onClick={goToUpload}>
              Upload Image Instead
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
