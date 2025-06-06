/**
 * Compresses an image file while maintaining aspect ratio
 * @param file The image file to compress
 * @param maxWidth Maximum width of the output image
 * @param maxHeight Maximum height of the output image
 * @param quality Image quality (0.1 - 1.0)
 * @returns A promise that resolves to a Blob of the compressed image
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw white background for transparent PNGs
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            resolve(blob);
          },
          file.type || 'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL to a Blob
 * @param dataURL The data URL to convert
 * @returns A promise that resolves to a Blob
 */
export const dataURLtoBlob = (dataURL: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => resolve(blob))
      .catch(error => reject(error));
  });
};

/**
 * Converts a Blob to a base64 string
 * @param blob The Blob to convert
 * @returns A promise that resolves to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Takes a photo from a video element
 * @param videoElement The video element to capture from
 * @param quality Image quality (0.1 - 1.0)
 * @returns A promise that resolves to a Blob of the captured image
 */
export const captureFromVideo = (
  videoElement: HTMLVideoElement,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw the current frame from the video
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to capture image'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
};
