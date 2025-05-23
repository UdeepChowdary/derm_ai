"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useHistory } from "@/components/history-provider"
import Image from "next/image"
import { LoadingLogo } from "@/components/loading-logo"
import { ConsentModal } from '@/components/consent-modal';
import clinicalData from '@/../app/clinical-data/condition-mappings.json';

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addReport } = useHistory()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const processFile = (file?: File) => {
    if (!file) return

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please choose a JPEG, PNG, or WEBP image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please choose an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const { toast } = useToast();
  const [consentResolver, setConsentResolver] = useState<((value: boolean) => void) | null>(null);
  const [hasGivenConsent, setHasGivenConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage for consent status on mount
    const consentStatus = localStorage.getItem('derm_ai_consent');
    if (consentStatus === 'granted') {
      setHasGivenConsent(true);
    } else if (consentStatus === 'denied') {
      setHasGivenConsent(false);
    } else {
      setHasGivenConsent(null); // Show modal if no status found
    }
  }, []);

  const handleConsent = (allowed: boolean) => {
    setHasGivenConsent(allowed);
    localStorage.setItem('derm_ai_consent', allowed ? 'granted' : 'denied');
    if (consentResolver) {
      consentResolver(allowed);
      setConsentResolver(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    // Check consent status before proceeding
    if (hasGivenConsent === null) {
      // If consent status is unknown, wait for the modal interaction
      const consentGranted = await new Promise<boolean>(resolve => {
        setConsentResolver(() => resolve);
      });
      if (!consentGranted) {
        toast({ title: "Analysis canceled", description: "You must consent to continue." });
        return;
      }
    } else if (hasGivenConsent === false) {
      // If consent was previously denied
      toast({ title: "Analysis canceled", description: "You must consent to continue." });
      return;
    }

    setIsAnalyzing(true);
    // Integrated clinical data mapping
    recommendations: clinicalData.mappings
      .find(m => m.autodermClass === primaryPrediction?.class)
      ?.recommendations || autodermResult.recommendations,
  clinicalData: clinicalData.mappings
    .find(m => m.autodermClass === primaryPrediction?.class)
    ?.recommendations || autodermResult.recommendations,
  // Replace the existing ConsentModal rendering logic with this:
  {hasGivenConsent === null && <ConsentModal onConsent={handleConsent} />}
{consentResolver && <ConsentModal onConsent={allowed => {
  consentResolver(allowed);
  setConsentResolver(null);
}} />}

    console.log("Analysis complete, generating report", analysisResult);

    // Map the API response to the report data structure
    let mappedClinicalData = null;
    let mappedRecommendations = analysisResult.recommendations || [];

    try {
      const primaryPrediction = analysisResult.predictions?.[0];
      if (primaryPrediction?.class) {
        mappedClinicalData = clinicalData.mappings.find(
          (m) => m.autodermClass === primaryPrediction.class
        );
        if (mappedClinicalData?.recommendations) {
          mappedRecommendations = mappedClinicalData.recommendations;
        }
      }
    } catch (mappingError) {
      console.error("Error during clinical data mapping:", mappingError);
      toast({
        title: "Mapping Error",
        description: "Could not map clinical data. Using default recommendations.",
        variant: "warning",
      });
    }

    const reportData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      condition: analysisResult.condition || 'Unknown Condition',
      description: analysisResult.description || 'No description provided.',
      severity: analysisResult.severity || 'Unknown Severity',
      recommendations: mappedRecommendations,
      imageUrl: selectedImage,
      clinicalData: mappedClinicalData, // Include mapped clinical data
    };

    // Add to history
    addReport(reportData);
    setIsAnalyzing(false);
  };
{hasGivenConsent === null && <ConsentModal onConsent={handleConsent} />}
{consentResolver && <ConsentModal onConsent={allowed => {
  consentResolver(allowed);
  setConsentResolver(null);
}} />}
