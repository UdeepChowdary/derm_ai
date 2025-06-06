"use client"

import React, { useState } from "react"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Camera, 
  SunIcon, 
  LampDesk, 
  Focus, 
  HelpCircle, 
  Info, 
  Check, 
  AlertTriangle, 
  X
} from "lucide-react"

interface ImageQualityResult {
  score: number
  brightness: number
  contrast: number
  focus: number
  resolution: number
  issues: string[]
  recommendations: string[]
}

export function ImageCaptureGuide({ 
  onClose 
}: { 
  onClose?: () => void 
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <HelpCircle className="h-4 w-4" />
          <span>Photo Tips</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Take Good Skin Photos</DialogTitle>
          <DialogDescription>
            Follow these guidelines to get the most accurate analysis
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="lighting">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="lighting">Lighting</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lighting" className="space-y-4">
            <div className="space-y-2">
              <h3 className="flex items-center font-medium text-sm">
                <SunIcon className="h-4 w-4 mr-2 text-amber-500" />
                Natural Light is Best
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Take photos in natural daylight whenever possible. Position yourself near a window but avoid direct sunlight.
              </p>
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <NextImage 
                  src="/images/natural-light-example.jpg" 
                  alt="Natural lighting example"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center font-medium text-sm">
                <LampDesk className="h-4 w-4 mr-2 text-blue-500" />
                If Using Artificial Light
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use diffused, white lighting that evenly illuminates your skin without creating harsh shadows. Avoid yellow-tinted lights.
              </p>
              <div className="flex space-x-2">
                <div className="flex-1 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 p-2 rounded-md">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Good</p>
                  <p className="text-xs">White, diffused lighting</p>
                </div>
                <div className="flex-1 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-2 rounded-md">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Avoid</p>
                  <p className="text-xs">Yellow, harsh, or uneven lighting</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="position" className="space-y-4">
            <div className="space-y-2">
              <h3 className="flex items-center font-medium text-sm">
                <Focus className="h-4 w-4 mr-2 text-indigo-500" />
                Distance & Focus
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Hold your camera 6-12 inches (15-30cm) from the skin. Make sure the affected area is in focus and clearly visible.
              </p>
              
              <div className="flex flex-col space-y-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Recommended Distance</p>
                  <div className="relative h-8 w-full">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="absolute top-0 left-1/4 h-full flex flex-col items-center justify-between">
                      <span className="text-xs text-teal-600 dark:text-teal-400">Too Close</span>
                      <div className="h-2 w-2 bg-teal-500 rounded-full relative top-[calc(50%-4px)]"></div>
                    </div>
                    <div className="absolute top-0 left-1/2 h-full flex flex-col items-center justify-between">
                      <span className="text-xs text-green-600 dark:text-green-400">Ideal</span>
                      <div className="h-4 w-4 bg-green-500 rounded-full relative top-[calc(50%-8px)]"></div>
                    </div>
                    <div className="absolute top-0 left-3/4 h-full flex flex-col items-center justify-between">
                      <span className="text-xs text-amber-600 dark:text-amber-400">Too Far</span>
                      <div className="h-2 w-2 bg-amber-500 rounded-full relative top-[calc(50%-4px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="flex items-center font-medium text-sm">
                <Camera className="h-4 w-4 mr-2 text-rose-500" />
                Angle & Framing
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Position the camera perpendicular to the skin surface. Include the affected area plus some surrounding healthy skin for comparison.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 p-2 rounded-md">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Good Angle</p>
                  <div className="flex justify-center">
                    <div className="relative h-8 w-8">
                      <div className="absolute top-0 left-0 w-8 h-8 border-2 border-slate-300 dark:border-slate-600 rounded-md"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-green-500 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-2 rounded-md">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Poor Angle</p>
                  <div className="flex justify-center">
                    <div className="relative h-8 w-8">
                      <div className="absolute top-0 left-0 w-8 h-8 border-2 border-slate-300 dark:border-slate-600 rounded-md"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-6 h-1 bg-red-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Good Example
                    </Badge>
                  </div>
                  <div className="relative h-40 w-full rounded-md overflow-hidden mb-2">
                    <NextImage 
                      src="/images/good-skin-photo-example.jpg" 
                      alt="Good skin photo example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li className="flex items-start">
                      <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Well-lit with even, natural lighting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>In focus, clear details visible</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Includes affected area and some surrounding skin</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                      <X className="h-3 w-3 mr-1" />
                      Poor Example
                    </Badge>
                  </div>
                  <div className="relative h-40 w-full rounded-md overflow-hidden mb-2">
                    <NextImage 
                      src="/images/poor-skin-photo-example.jpg" 
                      alt="Poor skin photo example"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li className="flex items-start">
                      <X className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Poor lighting, shadows obscure details</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Blurry, out of focus</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Angle makes proper assessment difficult</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogClose asChild>
          <Button onClick={onClose} className="w-full mt-4">
            Got it
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

// Function to analyze image quality
export function analyzeImageQuality(imageData: string): Promise<ImageQualityResult> {
  return new Promise((resolve) => {
    // Use the browser's built-in Image constructor, not Next.js Image
    const img = new globalThis.Image();
    img.onload = () => {
      // Create canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({
          score: 70, // Default reasonable score
          brightness: 70,
          contrast: 70,
          focus: 70,
          resolution: 70,
          issues: ["Unable to analyze image quality"],
          recommendations: ["Ensure good lighting and clear focus"]
        });
        return;
      }
      
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze brightness
      let totalBrightness = 0;
      let pixelsAnalyzed = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness using perceived luminance formula
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        totalBrightness += brightness;
        pixelsAnalyzed++;
      }
      
      // Average brightness (0-255)
      const avgBrightness = totalBrightness / pixelsAnalyzed;
      
      // Normalize to 0-100 score
      const brightnessScore = Math.min(100, Math.max(0, 
        avgBrightness < 80 ? (avgBrightness / 80) * 70 : 
        avgBrightness > 200 ? 100 - ((avgBrightness - 200) / 55) * 30 : 
        70 + ((avgBrightness - 80) / 120) * 30
      ));
      
      // Simple contrast estimation
      let minBrightness = 255;
      let maxBrightness = 0;
      const sampleSize = Math.min(10000, pixelsAnalyzed);
      const sampleStep = Math.floor(data.length / 4 / sampleSize) * 4;
      
      for (let i = 0; i < data.length; i += sampleStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
      }
      
      const contrastRange = maxBrightness - minBrightness;
      // Normalize to 0-100 score
      const contrastScore = Math.min(100, Math.max(0, 
        contrastRange < 50 ? (contrastRange / 50) * 50 : 
        contrastRange > 220 ? 100 - ((contrastRange - 220) / 35) * 20 : 
        50 + ((contrastRange - 50) / 170) * 50
      ));
      
      // Resolution assessment
      const resolutionScore = Math.min(100, Math.max(0,
        canvas.width < 400 || canvas.height < 400 ? 40 : 
        canvas.width < 800 || canvas.height < 800 ? 60 : 
        canvas.width < 1200 || canvas.height < 1200 ? 80 : 100
      ));
      
      // Focus estimation (this is a simple approximation)
      // We use edge detection to estimate focus
      const edgeData = ctx.createImageData(canvas.width, canvas.height);
      const edgePixels = edgeData.data;
      let edgeSum = 0;
      
      // Simple edge detection
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const pos = (y * canvas.width + x) * 4;
          const posUp = ((y - 1) * canvas.width + x) * 4;
          const posDown = ((y + 1) * canvas.width + x) * 4;
          const posLeft = (y * canvas.width + (x - 1)) * 4;
          const posRight = (y * canvas.width + (x + 1)) * 4;
          
          // Calculate differences
          const diffY = Math.abs(data[posUp] - data[posDown]) + 
                       Math.abs(data[posUp + 1] - data[posDown + 1]) + 
                       Math.abs(data[posUp + 2] - data[posDown + 2]);
                       
          const diffX = Math.abs(data[posLeft] - data[posRight]) + 
                       Math.abs(data[posLeft + 1] - data[posRight + 1]) + 
                       Math.abs(data[posLeft + 2] - data[posRight + 2]);
          
          const diff = (diffX + diffY) / 6; // Average difference (0-255)
          edgeSum += diff;
        }
      }
      
      const avgEdge = edgeSum / ((canvas.width - 2) * (canvas.height - 2));
      
      // Normalize focus score
      const focusScore = Math.min(100, Math.max(0, 
        avgEdge < 5 ? (avgEdge / 5) * 50 : 
        avgEdge > 30 ? 100 - ((avgEdge - 30) / 30) * 30 : 
        50 + ((avgEdge - 5) / 25) * 50
      ));
      
      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        brightnessScore * 0.3 + 
        contrastScore * 0.2 + 
        focusScore * 0.3 + 
        resolutionScore * 0.2
      );
      
      // Identify issues and recommendations
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      if (brightnessScore < 50) {
        issues.push(avgBrightness < 80 ? "Image is too dark" : "Image is too bright");
        recommendations.push(avgBrightness < 80 ? 
          "Take photo in better lighting conditions" : 
          "Avoid direct light or flash that causes overexposure");
      }
      
      if (contrastScore < 50) {
        issues.push("Image has poor contrast");
        recommendations.push("Ensure there is sufficient lighting difference between the affected area and surrounding skin");
      }
      
      if (focusScore < 50) {
        issues.push("Image is not in clear focus");
        recommendations.push("Hold the camera steady and ensure the skin condition is in focus before taking the photo");
      }
      
      if (resolutionScore < 50) {
        issues.push("Image resolution is too low");
        recommendations.push("Use a higher-resolution camera setting or position the camera closer to the skin");
      }
      
      // If no specific issues, but score is still not great
      if (issues.length === 0 && overallScore < 70) {
        issues.push("Image quality could be improved");
        recommendations.push("Try using natural daylight and ensure the camera is steady and focused");
      }
      
      // If everything looks good
      if (issues.length === 0) {
        issues.push("No major quality issues detected");
        recommendations.push("Image quality is suitable for analysis");
      }
      
      resolve({
        score: overallScore,
        brightness: Math.round(brightnessScore),
        contrast: Math.round(contrastScore),
        focus: Math.round(focusScore),
        resolution: Math.round(resolutionScore),
        issues,
        recommendations
      });
    };
    
    img.src = imageData;
  });
}

interface ImageQualityAssessmentProps {
  imageData: string;
  onQualityCheck: (result: ImageQualityResult) => void;
}

export function ImageQualityAssessment({ imageData, onQualityCheck }: ImageQualityAssessmentProps) {
  const [isAssessing, setIsAssessing] = useState(false);
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  
  const checkImageQuality = async () => {
    setIsAssessing(true);
    try {
      const result = await analyzeImageQuality(imageData);
      setQualityResult(result);
      onQualityCheck(result);
    } catch (error) {
      console.error("Error analyzing image quality:", error);
    } finally {
      setIsAssessing(false);
    }
  };
  
  React.useEffect(() => {
    if (imageData) {
      checkImageQuality();
    }
  }, [imageData]);
  
  if (!qualityResult || isAssessing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-sm text-slate-500">Assessing image quality...</span>
      </div>
    );
  }
  
  // Determine quality level
  const getQualityLevel = (score: number) => {
    if (score >= 80) return { label: "Good", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-950" };
    if (score >= 60) return { label: "Acceptable", color: "text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-950" };
    return { label: "Poor", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-950" };
  };
  
  const overallQuality = getQualityLevel(qualityResult.score);
  
  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-md ${overallQuality.bgColor}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={`font-medium ${overallQuality.color}`}>
            Image Quality: {overallQuality.label}
          </h3>
          <span className="text-sm font-medium">{qualityResult.score}%</span>
        </div>
        <Progress value={qualityResult.score} className="h-2" />
      </div>
      
      {qualityResult.score < 70 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            Issues Detected
          </h4>
          <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
            {qualityResult.issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <X className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
          
          <h4 className="text-sm font-medium flex items-center mt-3">
            <Info className="h-4 w-4 text-blue-500 mr-1" />
            Recommendations
          </h4>
          <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
            {qualityResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Brightness</span>
            <span>{qualityResult.brightness}%</span>
          </div>
          <Progress value={qualityResult.brightness} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Contrast</span>
            <span>{qualityResult.contrast}%</span>
          </div>
          <Progress value={qualityResult.contrast} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Focus</span>
            <span>{qualityResult.focus}%</span>
          </div>
          <Progress value={qualityResult.focus} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Resolution</span>
            <span>{qualityResult.resolution}%</span>
          </div>
          <Progress value={qualityResult.resolution} className="h-1" />
        </div>
      </div>
    </div>
  );
}
