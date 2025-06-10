import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraState } from '@/src/types';

export const useCamera = (facingMode: 'user' | 'environment' = 'environment') => {
  const [state, setState] = useState<CameraState>({
    isActive: false,
    hasPermission: null,
    error: null,
    stream: null,
  });
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function to stop the camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
    }));
  }, []);

  // Start the camera
  const startCamera = useCallback(async () => {
    // If camera is already active, do nothing
    if (state.isActive) return;

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      setState({
        isActive: true,
        hasPermission: true,
        error: null,
        stream,
      });

      // Return cleanup function
      return () => {
        stopCamera();
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Failed to access camera';
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access was denied';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints could not be satisfied';
        }
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        hasPermission: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  }, [facingMode, state.isActive, stopCamera]);

  // Toggle camera on/off
  const toggleCamera = useCallback(async () => {
    if (state.isActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [startCamera, state.isActive, stopCamera]);

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    if (!state.isActive) return;
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    
    try {
      await startCamera();
      return newFacingMode;
    } catch (error) {
      console.error('Failed to switch camera:', error);
      throw error;
    }
  }, [facingMode, startCamera, state.isActive, stopCamera]);

  // Take a photo from the camera stream
  const takePhoto = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!state.stream) {
        resolve(null);
        return;
      }

      // Create a video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = state.stream;
      video.onloadedmetadata = () => {
        video.play();
        
        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw the current video frame to the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(imageDataUrl);
        } else {
          resolve(null);
        }
      };
      
      video.onerror = () => {
        console.error('Error capturing photo');
        resolve(null);
      };
    });
  }, [state.stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    ...state,
    startCamera,
    stopCamera,
    toggleCamera,
    switchCamera,
    takePhoto,
  };
};
