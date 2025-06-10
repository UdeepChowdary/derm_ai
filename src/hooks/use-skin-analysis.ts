import { useState, useCallback, useRef, useEffect } from 'react';
import { SkinAnalysisResult, AnalysisStatus } from '@/src/types';
import { api } from '@/src/lib/api-client';
import { compressImage, captureFromVideo } from '@/src/lib/image-utils';

interface UseSkinAnalysisOptions {
  onAnalysisComplete?: (result: SkinAnalysisResult) => void;
  onError?: (error: Error) => void;
}

export const useSkinAnalysis = (options: UseSkinAnalysisOptions = {}) => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function to abort any ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Function to analyze an image file
  const analyzeImageFile = useCallback(
    async (file: File) => {
      if (status === 'processing') return;

      setStatus('processing');
      setError(null);
      setProgress(10);

      try {
        // Compress the image before sending
        const compressedBlob = await compressImage(file);
        setProgress(30);

        // Create FormData and append the image
        const formData = new FormData();
        formData.append('image', compressedBlob, 'skin_analysis.jpg');

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        // Make the API request
        setProgress(50);
        const response = await api.post<SkinAnalysisResult>(
          '/analyze',
          formData,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setProgress(90);
        
        if (response.success && response.data) {
          const analysisResult = {
            ...response.data,
            timestamp: Date.now(),
            imageUrl: URL.createObjectURL(compressedBlob),
          };
          
          setResult(analysisResult);
          setStatus('completed');
          options.onAnalysisComplete?.(analysisResult);
        } else {
          throw new Error(response.error?.message || 'Failed to analyze image');
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        setStatus('error');
        options.onError?.(error);
      } finally {
        setProgress(100);
        // Small delay before resetting progress
        setTimeout(() => setProgress(0), 500);
      }
    },
    [status, options]
  );

  // Function to analyze an image from a video element
  const analyzeVideoFrame = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (status === 'processing') return;

      setStatus('processing');
      setError(null);
      setProgress(10);

      try {
        // Capture the current frame from the video
        const imageBlob = await captureFromVideo(videoElement);
        setProgress(30);

        // Create FormData and append the image
        const formData = new FormData();
        formData.append('image', imageBlob, 'skin_analysis.jpg');

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        // Make the API request
        setProgress(50);
        const response = await api.post<SkinAnalysisResult>(
          '/analyze',
          formData,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        setProgress(90);
        
        if (response.success && response.data) {
          const analysisResult = {
            ...response.data,
            timestamp: Date.now(),
            imageUrl: URL.createObjectURL(imageBlob),
          };
          
          setResult(analysisResult);
          setStatus('completed');
          options.onAnalysisComplete?.(analysisResult);
        } else {
          throw new Error(response.error?.message || 'Failed to analyze image');
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        setStatus('error');
        options.onError?.(error);
      } finally {
        setProgress(100);
        // Small delay before resetting progress
        setTimeout(() => setProgress(0), 500);
      }
    },
    [status, options]
  );

  // Function to reset the analysis state
  const resetAnalysis = useCallback(() => {
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setStatus('idle');
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    // State
    status,
    result,
    error,
    progress,
    isProcessing: status === 'processing',
    isCompleted: status === 'completed',
    hasError: status === 'error',
    
    // Actions
    analyzeImageFile,
    analyzeVideoFrame,
    resetAnalysis,
  };
};
