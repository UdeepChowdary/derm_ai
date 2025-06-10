import { useRef, useEffect } from 'react';
import { Camera, CameraOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { cn } from '@/lib/utils';

interface CameraProps {
  onCapture: (imageData: string) => void;
  className?: string;
  videoClassName?: string;
  facingMode?: 'user' | 'environment';
  showControls?: boolean;
  autoStart?: boolean;
  errorMessage?: string;
}

export function CameraComponent({
  onCapture,
  className,
  videoClassName,
  facingMode = 'environment',
  showControls = true,
  autoStart = true,
  errorMessage: externalErrorMessage,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isActive,
    hasPermission,
    error: cameraError,
    stream,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
  } = useCamera(facingMode);

  // Handle auto-start
  useEffect(() => {
    if (autoStart && !isActive) {
      startCamera().catch(console.error);
    }
  }, [autoStart, isActive, startCamera]);

  // Set the video source when the stream is available
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  const handleCapture = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        onCapture(photo);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleSwitchCamera = async () => {
    try {
      await switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const errorMessage = externalErrorMessage || cameraError;

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <div className="relative w-full overflow-hidden rounded-lg bg-black">
        {isActive && hasPermission ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn('h-full w-full object-cover', videoClassName)}
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-black">
            <CameraOff className="h-12 w-12 text-gray-500" />
          </div>
        )}

        {errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-white">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {showControls && (
        <div className="mt-4 flex w-full items-center justify-center gap-4">
          {isActive ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwitchCamera}
                className="h-12 w-12 rounded-full"
              >
                <RotateCw className="h-6 w-6" />
                <span className="sr-only">Switch camera</span>
              </Button>
              
              <Button
                type="button"
                onClick={handleCapture}
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
              >
                <Camera className="h-6 w-6" />
                <span className="sr-only">Take photo</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="h-12 w-12 rounded-full"
              >
                <CameraOff className="h-6 w-6" />
                <span className="sr-only">Stop camera</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Start Camera
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
