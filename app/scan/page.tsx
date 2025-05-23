"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeft, Camera, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { useHistory } from "@/components/history-provider"
import { LoadingLogo } from "@/components/loading-logo"
import { useAccessibility } from "@/components/accessibility-provider"

export default function ScanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addReport } = useHistory()
  const { settings } = useAccessibility()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraState, setCameraState] = useState<"initializing" | "ready" | "error" | "not-supported">("initializing")
  const [isCaptured, setIsCaptured] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)

  // A11y: Announce camera status to screen readers
  useEffect(() => {
    // Create an alert for screen readers when camera state changes
    let message = ""
    switch (cameraState) {
      case "initializing":
        message = "Camera is initializing. Please wait."
        break
      case "ready":
        message = "Camera is ready. You can now take a photo."
        break
      case "error":
        message = `Camera error: ${errorMessage}`
        break
      case "not-supported":
        message = "Camera is not supported on this device."
        break
    }
    
    if (message && settings.screenReaderOptimized) {
      // Create and manage a live region for screen reader announcements
      const liveRegion = document.createElement("div")
      liveRegion.setAttribute("aria-live", "polite")
      liveRegion.setAttribute("aria-atomic", "true")
      liveRegion.className = "sr-only"
      liveRegion.textContent = message
      
      document.body.appendChild(liveRegion)
      
      // Remove after announcement is likely complete
      setTimeout(() => {
        document.body.removeChild(liveRegion)
      }, 3000)
    }
  }, [cameraState, errorMessage, settings.screenReaderOptimized])

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

    // Match canvas size to video dimensions for proper capture
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL("image/jpeg", 0.9)
      setCapturedImageUrl(imageUrl)

      // Pause the video stream
      video.pause()

      setIsCaptured(true)
      
      // A11y: Announce to screen readers that photo was captured
      if (settings.screenReaderOptimized) {
        const liveRegion = document.createElement("div")
        liveRegion.setAttribute("aria-live", "assertive")
        liveRegion.className = "sr-only"
        liveRegion.textContent = "Photo captured successfully. Ready for analysis."
        document.body.appendChild(liveRegion)
        setTimeout(() => document.body.removeChild(liveRegion), 3000)
      }

      // Automatically start analysis after capture
      analyzeImage(imageUrl)
    } catch (err) {
      console.error("Error generating image:", err)
      toast({
        title: "Processing Error",
        description: "Could not process captured image. Please try again.",
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
  const analyzeImage = async (imageUrl: string) => {
    console.log("Analyzing captured image")
    setIsAnalyzing(true)

    try {
      // First ensure we have a valid image URL
      if (!imageUrl) {
        throw new Error("No image data available for analysis");
      }
      
      // Call the backend API for analysis
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageUrl }), // Send image data (base64 string)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const analysisResult = await response.json();
      console.log("Analysis complete, generating report from scan", analysisResult);

      // Map the API response to the report data structure
      const reportData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        condition: analysisResult.condition || 'Unknown Condition',
        description: analysisResult.description || 'No description provided.',
        severity: analysisResult.severity || 'Unknown Severity',
        recommendations: analysisResult.recommendations || [],
        imageUrl: imageUrl, // Use the captured image URL
      };

      // Add to history
      addReport(reportData);

      // Navigate to report page
      router.push(`/report/${reportData.id}`);

    } catch (err) {
      console.error("Error during analysis API call (scan page):", err);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Error",
        description: `Could not analyze image: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    }
  };

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

  // A11y: Add keyboard support for camera controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault() // Prevent scrolling on spacebar
      if (cameraState === "ready" && !isCaptured) {
        captureImage()
      } else if (isCaptured && !isAnalyzing) {
        retakePhoto()
      }
    }
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Skin condition scanner"
    >
      <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-800">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-semibold text-slate-800 dark:text-white">Scan Skin Condition</h1>
      </header>

      <main className="flex-1 container max-w-md mx-auto p-4 flex flex-col">
        <div className="flex flex-col flex-1 justify-center items-center space-y-8">
          {/* Camera viewfinder / captured image */}
          <Card className="relative aspect-square w-full overflow-hidden">
            {/* Video stream for camera */}
            {!isCaptured && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  cameraState !== "ready" ? "opacity-0" : ""
                }`}
                aria-hidden="true"
              />
            )}

            {/* Canvas for capturing (hidden) */}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            {/* Captured image display */}
            {isCaptured && capturedImageUrl && (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={capturedImageUrl}
                  alt="Captured skin condition"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Loading overlay for initialization */}
            {cameraState === "initializing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 z-10">
                <LoadingLogo size="md" />
                <span className="sr-only">Loading camera, please wait</span>
              </div>
            )}

            {/* Error message overlay */}
            {(cameraState === "error" || cameraState === "not-supported") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-800 space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white text-center" id="error-heading">
                  Camera Error
                </h3>
                <p
                  className="text-slate-600 dark:text-slate-300 text-center"
                  id="error-description"
                  aria-describedby="error-heading"
                >
                  {errorMessage}
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={retryCamera}
                    aria-label="Try accessing camera again"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={goToUpload}
                    aria-label="Go to manual image upload page"
                  >
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Loading overlay during analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 z-10">
                <div className="flex flex-col items-center space-y-3">
                  <LoadingLogo size="md" />
                  <p className="text-slate-600 dark:text-slate-300 animate-pulse text-center">
                    Analyzing skin condition...
                  </p>
                  <span className="sr-only" aria-live="polite">
                    Your image is being analyzed. This may take a few moments.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Camera controls */}
          <div className="w-full">
            {!isCaptured && cameraState === "ready" && (
              <Button
                className="w-full py-6 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                onClick={captureImage}
                aria-label="Take a photo of your skin condition"
              >
                <Camera className="h-5 w-5 mr-2" aria-hidden="true" />
                Capture Image
              </Button>
            )}

            {isCaptured && !isAnalyzing && (
              <Button
                variant="outline"
                className="w-full py-6"
                onClick={retakePhoto}
                aria-label="Retake the photo"
              >
                <RefreshCw className="h-5 w-5 mr-2" aria-hidden="true" />
                Retake Photo
              </Button>
            )}

            {/* Accessibility guidance */}
            {!isCaptured && cameraState === "ready" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Press Space or Enter key to capture when focused.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
