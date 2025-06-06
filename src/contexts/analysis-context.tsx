'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SkinAnalysisResult, AnalysisStatus } from '@/src/types';
import { useSkinAnalysis } from '@/hooks/use-skin-analysis';

interface AnalysisContextType {
  // State
  status: AnalysisStatus;
  result: SkinAnalysisResult | null;
  error: Error | null;
  progress: number;
  isProcessing: boolean;
  isCompleted: boolean;
  hasError: boolean;
  
  // Actions
  analyzeImage: (file: File) => Promise<void>;
  analyzeFromCamera: (imageData: string) => Promise<void>;
  resetAnalysis: () => void;
  setResult: (result: SkinAnalysisResult | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
  onAnalysisComplete?: (result: SkinAnalysisResult) => void;
  onError?: (error: Error) => void;
}

export function AnalysisProvider({ 
  children, 
  onAnalysisComplete, 
  onError 
}: AnalysisProviderProps) {
  const [manualResult, setManualResult] = useState<SkinAnalysisResult | null>(null);
  
  const handleAnalysisComplete = useCallback((result: SkinAnalysisResult) => {
    setManualResult(result);
    onAnalysisComplete?.(result);
  }, [onAnalysisComplete]);
  
  const handleError = useCallback((error: Error) => {
    console.error('Analysis error:', error);
    onError?.(error);
  }, [onError]);

  const {
    status,
    result: analysisResult,
    error,
    progress,
    isProcessing,
    isCompleted,
    hasError,
    analyzeImageFile,
    analyzeVideoFrame,
    resetAnalysis: resetAnalysisState,
  } = useSkinAnalysis({
    onAnalysisComplete: handleAnalysisComplete,
    onError: handleError,
  });

  // Use the result from the hook or the manually set result
  const result = manualResult || analysisResult;

  // Handle analyzing from a camera capture (data URL)
  const analyzeFromCamera = useCallback(async (imageData: string) => {
    try {
      // Convert data URL to Blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create a file from the Blob
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      
      // Analyze the image file
      await analyzeImageFile(file);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process camera capture');
      handleError(error);
    }
  }, [analyzeImageFile, handleError]);

  // Reset the analysis state
  const resetAnalysis = useCallback(() => {
    resetAnalysisState();
    setManualResult(null);
  }, [resetAnalysisState]);

  // Set a manual result (useful for loading saved analyses)
  const setResult = useCallback((newResult: SkinAnalysisResult | null) => {
    setManualResult(newResult);
  }, []);

  const value = {
    status,
    result,
    error,
    progress,
    isProcessing,
    isCompleted,
    hasError,
    analyzeImage: analyzeImageFile,
    analyzeFromCamera,
    resetAnalysis,
    setResult,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
