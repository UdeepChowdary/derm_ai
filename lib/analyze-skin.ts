// Toast notifications removed per user request
// import { toast } from "@/hooks/use-toast"

import { API_KEYS } from "@/config/api-keys"
// Import TensorFlow.js and face detection
import * as tf from '@tensorflow/tfjs-core';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

import '@tensorflow/tfjs-backend-webgl';

if (typeof window !== 'undefined') {
  (window as any).tf = tf;
}

// Initialize face detection model
let faceDetector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

// Flag to track if we've attempted to load the model
let modelLoadAttempted = false;

// Type guard to check if result is SkinAnalysisResult
export function isSkinAnalysisResult(result: AnalysisResult): result is SkinAnalysisResult {
  return !('isNonSkinImage' in result) && 'condition' in result;
}

// Type guard to check if result is NonSkinImageResult
export function isNonSkinImageResult(result: AnalysisResult): result is NonSkinImageResult {
  return 'isNonSkinImage' in result && result.isNonSkinImage === true;
}

// Type guard to check if result is SkinDetectionWarning
export function isSkinDetectionWarning(result: AnalysisResult): result is SkinDetectionWarning {
  return 'isNonSkinImage' in result && result.isNonSkinImage === false;
}

export type SkinAnalysisResult = {
  id: string
  condition: string
  description: string
  severity: 'Low' | 'Moderate' | 'High'
  riskScore: number
  confidence: number
  recommendations: string[]
  conditionDetails: {
    symptoms: string[]
    causes: string[]
    whenToSeeDoctor: string
    treatmentOptions: string[]
  }
  preventionTips: string[]
  additionalNotes: string
  warning?: string
}

export type AutoDermPrediction = {
  name: string
  confidence: number
  icd: string
  readMoreUrl: string
  classificationId: string
}

export type AutoDermResponse = {
  success: boolean
  message: string
  id: string
  predictions: AutoDermPrediction[]
  fitzpatrick: number
  anonymous?: {
    confidence: number
    prediction: boolean
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Constants
const API_URL = process.env.NEXT_PUBLIC_AUTODERM_API_URL || 'https://autoderm.ai/v1/query';
const API_KEY = API_KEYS.AUTODERM_API_KEY;
const MODEL = 'autoderm_v2_2';
const LANGUAGE = 'en';

// Mock data for development when API key is not available
const mockAnalysisResults: SkinAnalysisResult[] = [
  {
    id: generateUUID(),
    condition: "Acne Vulgaris",
    description: "Inflammatory skin condition characterized by pimples, blackheads, and whiteheads.",
    severity: "Moderate",
    riskScore: 65,
    confidence: 0.85,
    recommendations: [
      "Keep the affected area clean",
      "Avoid touching or picking at the pimples",
      "Use non-comedogenic skincare products",
      "Consider consulting a dermatologist"
    ],
    conditionDetails: {
      symptoms: ["Pimples", "Blackheads", "Whiteheads", "Inflammation"],
      causes: ["Hormonal changes", "Bacteria", "Excess oil production"],
      whenToSeeDoctor: "If acne is severe or not responding to treatment",
      treatmentOptions: ["Topical treatments", "Oral medications", "Lifestyle changes"]
    },
    preventionTips: [
      "Maintain good skin hygiene",
      "Use non-comedogenic products",
      "Avoid touching face frequently"
    ],
    additionalNotes: "Common in teenagers and young adults"
  },
  {
    id: generateUUID(),
    condition: "Eczema (Atopic Dermatitis)",
    description: "Chronic inflammatory skin condition causing itchy, red, and cracked skin.",
    severity: "Moderate",
    riskScore: 50,
    confidence: 0.35,
    recommendations: [
      "Moisturize skin frequently with fragrance-free cream",
      "Take short, lukewarm showers",
      "Use gentle, fragrance-free soaps and detergents"
    ],
    conditionDetails: {
      symptoms: ["Dry skin", "Itching", "Red to brownish-gray patches", "Small, raised bumps"],
      causes: ["Genetic factors", "Abnormal immune response", "Environmental triggers", "Skin barrier defects"],
      whenToSeeDoctor: "If the rash is severe, infected, or not responding to over-the-counter treatments",
      treatmentOptions: ["Moisturizers", "Topical corticosteroids", "Antihistamines", "Immunosuppressants"]
    },
    preventionTips: [
      "Moisturize at least twice a day",
      "Identify and avoid triggers that worsen the rash",
      "Take shorter showers or baths",
      "Use a humidifier in dry or cold weather"
    ],
    additionalNotes: "Eczema often occurs in people who also have hay fever or asthma. It's a chronic condition that can be managed with proper treatment."
  },
  {
    id: generateUUID(),
    condition: "Psoriasis",
    description: "Autoimmune condition causing rapid buildup of skin cells, resulting in scaling and inflammation.",
    severity: "High",
    riskScore: 100,
    confidence: 0.88,
    recommendations: [
      "Keep skin moisturized with thick creams",
      "Try over-the-counter coal tar or salicylic acid products",
      "Consider phototherapy under medical supervision"
    ],
    conditionDetails: {
      symptoms: ["Red patches of skin with thick, silvery scales", "Dry, cracked skin that may bleed", "Itching, burning, or soreness"],
      causes: ["Overactive immune system", "Genetic predisposition", "Environmental triggers"],
      whenToSeeDoctor: "If symptoms are severe, widespread, or not improving with treatment",
      treatmentOptions: ["Topical treatments", "Light therapy", "Oral or injected medications", "Biologics"]
    },
    preventionTips: [
      "Keep skin moisturized",
      "Avoid known triggers (stress, smoking, alcohol, skin injuries)",
      "Get regular, moderate sunlight exposure",
      "Maintain a healthy weight and diet"
    ],
    additionalNotes: "Psoriasis is a chronic condition that can go through cycles of flare-ups and remission. It's not contagious but can be hereditary."
  }
];

// Helper function to map confidence score to severity
function mapConfidenceToSeverity(confidence: number): 'Low' | 'Moderate' | 'High' {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Moderate';
  return 'Low';
}

// Helper function to generate recommendations based on condition and severity
function generateDefaultRecommendations(condition: string, severity: 'Low' | 'Moderate' | 'High'): string[] {
  const baseRecommendations = [
    'Keep the affected area clean and dry.',
    'Avoid scratching or picking at the affected area.',
    'Use gentle, fragrance-free skincare products.',
  ];

  const severityRecommendations = {
    Low: [
      'Monitor the condition for any changes.',
      'Consider using over-the-counter treatments as directed.',
    ],
    Moderate: [
      'Schedule a follow-up with a healthcare provider.',
      'Document any changes in the condition.',
      'Consider prescription treatments if recommended.',
    ],
    High: [
      'Seek immediate medical attention if symptoms worsen.',
      'Follow prescribed treatment plan strictly.',
      'Keep detailed records of symptoms and treatment response.',
    ],
  };

  return [...baseRecommendations, ...severityRecommendations[severity]];
}

// Helper function to generate prevention tips based on condition
function generatePreventionTips(condition: string): string[] {
  return [
    'Maintain good skin hygiene.',
    'Use sunscreen with SPF 30 or higher daily.',
    'Stay hydrated and maintain a healthy diet.',
    'Avoid known triggers or irritants.',
    'Regular skin self-examinations.',
  ];
}

// Helper function to determine when to see a doctor based on confidence
function getWhenToSeeDoctor(confidence: number): string {
  if (confidence >= 0.8) {
    return 'Seek medical attention immediately if symptoms worsen or persist.';
  }
  if (confidence >= 0.5) {
    return 'Schedule an appointment with a dermatologist for proper evaluation.';
  }
  return 'Monitor the condition and consult a healthcare provider if symptoms persist.';
}

// Helper function to calculate risk score based on confidence
function getRiskScoreFromConfidence(confidence: number): number {
  return Math.round(confidence * 100);
}

// Special type for non-skin image results
type NonSkinImageResult = {
  isNonSkinImage: true;
  message: string;
};

type SkinDetectionWarning = {
  isNonSkinImage: false;
  warning: string;
};

// Union type for all possible analysis results
export type AnalysisResult = SkinAnalysisResult | NonSkinImageResult | SkinDetectionWarning;

declare global {
  interface Window {
    tf: typeof import('@tensorflow/tfjs');
  }
}

// Initialize face detection model
async function loadFaceDetector() {
  if (faceDetector) {
    console.log('Face detector already loaded');
    return true;
  }
  if (modelLoadAttempted) {
    console.log('Face detector load already attempted, skipping');
    return false;
  }
  
  modelLoadAttempted = true;
  console.log('Attempting to load face detection model...');
  
  try {
    // Set TensorFlow.js backend (WebGL for GPU acceleration)
    await tf.setBackend('webgl');
    console.log('TensorFlow.js backend set to WebGL');
    
    // Load the face landmarks model
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
      runtime: 'tfjs',
      maxFaces: 1,
      refineLandmarks: false
    };
    
    console.log('Creating face detector with config:', detectorConfig);
    faceDetector = await faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );
    
    console.log('Face detection model loaded successfully');
    return true;
  } catch (err) {
    console.error('Failed to load face detection model:', err);
    return false;
  }
}

// Enhanced texture analysis for human skin detection
function analyzeTexture(imageData: ImageData): number {
  const data = imageData.data;
  let textureScore = 0;
  let sampleCount = 0;
  let patternConsistency = 0;
  let edgeCount = 0;
  
  // Sample pixels in a grid pattern
  for (let y = 0; y < imageData.height; y += 10) {
    for (let x = 0; x < imageData.width; x += 10) {
      const idx = (y * imageData.width + x) * 4;
      
      // Skip transparent pixels
      if (data[idx + 3] === 0) continue;
      
      // Calculate local variance and edge detection
      let localVariance = 0;
      let neighborCount = 0;
      let localEdges = 0;
      
      // Check 8 surrounding pixels
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
            const nidx = (ny * imageData.width + nx) * 4;
            
            // Skip transparent pixels
            if (data[nidx + 3] === 0) continue;
            
            // Calculate color difference
            const diff = Math.abs(data[idx] - data[nidx]) +
                        Math.abs(data[idx + 1] - data[nidx + 1]) +
                        Math.abs(data[idx + 2] - data[nidx + 2]);
            
            localVariance += diff;
            neighborCount++;

            // Edge detection
            if (diff > 50) { // Threshold for edge detection
              localEdges++;
            }
          }
        }
      }
      
      if (neighborCount > 0) {
        textureScore += localVariance / neighborCount;
        edgeCount += localEdges;
        sampleCount++;
      }
    }
  }
  
  // Calculate pattern consistency
  const edgeDensity = edgeCount / sampleCount;
  const textureVariance = textureScore / sampleCount / 255;
  
  // Human skin typically has:
  // 1. Moderate edge density (not too high like fur, not too low like smooth surfaces)
  // 2. Consistent texture variance
  // 3. No repeating patterns like fur or scales
  const isHumanSkinPattern = 
    edgeDensity > 0.1 && edgeDensity < 0.4 && // Edge density range for human skin
    textureVariance > 0.1 && textureVariance < 0.3; // Texture variance range for human skin
  
  return isHumanSkinPattern ? 1.0 : 0.0;
}

// Helper function to detect if an image contains animal-like features
async function containsAnimalFeatures(imageData: string): Promise<boolean> {
  console.log('Starting animal feature detection...');
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      console.log('Image loaded for animal detection, dimensions:', img.width, 'x', img.height);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        console.error('Failed to create canvas context for animal detection');
        return resolve(false);
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Analyze color distribution for animal-like patterns
        let greenDominance = 0;
        let brownGrayDominance = 0;
        let totalPixels = 0;
        
        console.log('Analyzing pixel colors for animal features...');
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Skip transparent pixels
          if (data[i + 3] < 100) continue;
          
          totalPixels++;
          
          // Check for green dominance (common in nature/animal backgrounds)
          if (g > r * 1.2 && g > b * 1.2) greenDominance++;
          
          // Check for brown/gray tones (common in animal fur)
          const isBrownGray = (r > 50 && r < 200) && 
                           (Math.abs(r - g) < 30) && 
                           (Math.abs(g - b) < 30);
          if (isBrownGray) brownGrayDominance++;
        }
        
        // Calculate percentages
        const greenPercent = (greenDominance / totalPixels) * 100;
        const brownGrayPercent = (brownGrayDominance / totalPixels) * 100;
        
        console.log('Animal detection results:', {
          greenPercent: greenPercent.toFixed(1) + '%',
          brownGrayPercent: brownGrayPercent.toFixed(1) + '%',
          totalPixels
        });
        
        // If either green or brown/gray dominates, it might be an animal
        const isLikelyAnimal = greenPercent > 30 || brownGrayPercent > 60;
        console.log('Animal detection conclusion:', isLikelyAnimal ? 'Likely animal' : 'Not likely animal');
        return resolve(isLikelyAnimal);
        
      } catch (error) {
        console.error('Error in animal detection:', error);
        return resolve(false);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image for animal detection:', error);
      resolve(false);
    };
    img.src = imageData;
  });
}

// Enhanced skin detection function
async function isHumanSkinImage(imageData: string): Promise<boolean> {
  try {
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.document) {
      console.warn('Not in browser environment, using basic skin detection');
      return false;
    }
    
    // Load face detector if not already loaded
    const detectorReady = await loadFaceDetector();
    if (!detectorReady) {
      console.warn('Face detector not available, using basic skin detection');
      return await basicSkinDetection(imageData);
    }

    // Convert base64 to image element
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageData;
    });

    // Check image dimensions
    if (img.width < 100 || img.height < 100) {
      console.warn('Image too small for reliable analysis');
      return false;
    }

    // Create canvas for face detection
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Face detector should already be loaded at this point
    if (!faceDetector) {
      console.warn('Face detector not available, falling back to basic detection');
      return await basicSkinDetection(imageData);
    }
    
    // Convert canvas to tensor
    const tensor = tf.browser.fromPixels(canvas);
    try {
      // Detect faces using TensorFlow.js
      const faces = await faceDetector.estimateFaces(tensor);
      
      // If faces are detected, perform additional verification
      if (faces.length > 0) {
        console.log(`${faces.length} face(s) detected, verifying...`);
        
        // Additional checks for human face verification
        const face = faces[0];
        let isHumanLike = false;
        
        // Check 1: Face landmarks (if available)
        if (face.keypoints) {
          // Robust feature presence checks
          const keyNames = face.keypoints.map((kp: faceLandmarksDetection.Keypoint) => kp.name?.toLowerCase() || '');
          const eyeCount = keyNames.filter((n: string) => n.includes('eye')).length;
          const hasEyes = eyeCount >= 2;            // both eyes ideally
          const hasNose = keyNames.some((n: string) => n.includes('nose'));
          const hasMouth = keyNames.some((n: string) => n.includes('mouth') || n.includes('lip'));

          // Consider human-like if at least two of the three primary features are present,
          // or both eyes are detected (common for most photo angles)
          const featureScore = (hasEyes ? 1 : 0) + (hasNose ? 1 : 0) + (hasMouth ? 1 : 0);
          isHumanLike = featureScore >= 2 || hasEyes;
          console.log(`Face features - Eyes: ${hasEyes}, Nose: ${hasNose}, Mouth: ${hasMouth}, Score: ${featureScore}`);

          if (!isHumanLike) {
            console.log('Facial landmark verification uncertain, but proceeding with additional skin checks.');
          }
        }
        
        // Check 2: Face proportions (if bounding box is available)
        if (face.box) {
          const { width, height } = face.box;
          const aspectRatio = width / height;
          
          // Human faces typically have aspect ratio between 0.6 and 0.8
          isHumanLike = aspectRatio > 0.5 && aspectRatio < 0.9; // Slightly more lenient ratio
          console.log(`Face aspect ratio: ${aspectRatio.toFixed(2)}`);
          
          if (!isHumanLike) {
            console.log('Face bounding box:', face.box);
            console.log('Face proportions not human-like, falling back to basic detection');
            return await basicSkinDetection(imageData);
          }
        }
        
        // Final verification: Run through basic skin detection as an additional check
        console.log('Running additional skin verification...');
        const basicSkinCheck = await basicSkinDetection(imageData);
        
        if (!basicSkinCheck) {
          console.log('Basic skin detection failed, rejecting image.');
          return false;
        }
        
        console.log('Human face and skin verified');
        return true;
      }
      
      // Fall back to basic color detection if no face is detected
      console.log('No face detected, running animal check before color analysis');
      const animalCheck = await containsAnimalFeatures(imageData);
      if (animalCheck) {
        console.log('Animal features detected, rejecting image');
        return false;
      }
      return await basicSkinDetection(imageData);
      
    } catch (error) {
      console.error('Error during face detection:', error);
      return await basicSkinDetection(imageData);
    } finally {
      // Clean up tensor in all cases
      tensor.dispose();
    }
  } catch (error) {
    console.error('Unexpected error in isHumanSkinImage:', error);
    return false; // Default to false on error
  }
}

// Enhanced basic skin detection with improved human/animal differentiation
async function basicSkinDetection(imageData: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if running in browser environment
    if (typeof document === 'undefined') {
      console.warn('Not in browser environment, cannot perform skin detection');
      return resolve(false);
    }

    const img = new Image();
    
    img.onerror = () => {
      console.error('Error loading image for skin detection');
      return resolve(false);
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        console.warn('Could not create canvas context');
        return resolve(false);
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      try {
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate brightness and color statistics
        let minLum = 255, maxLum = 0;
        let totalR = 0, totalG = 0, totalB = 0;
        let validPixels = 0;
        const lums = [];
        
        // First pass: Calculate luminance and basic stats
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) continue;
          
          const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          lums.push(lum);
          minLum = Math.min(minLum, lum);
          maxLum = Math.max(maxLum, lum);
          
          totalR += r;
          totalG += g;
          totalB += b;
          validPixels++;
        }
        
        const avgR = totalR / validPixels;
        const avgG = totalG / validPixels;
        const avgB = totalB / validPixels;
        const avgLum = lums.reduce((a, b) => a + b, 0) / validPixels;
        
        // Edge Detection Pass (for fur/feather detection)
        let edgePixels = 0;
        const edgeThreshold = 30;
        
        // Simple Sobel edge detection
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        const sampleStep = 4;
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 1; y < height - 1; y += sampleStep) {
          for (let x = 1; x < width - 1; x += sampleStep) {
            const idx = (y * width + x) * 4;
            
            let gx = 0, gy = 0;
            for (let ky = -1, ki = 0; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++, ki++) {
                const kidx = ((y + ky) * width + (x + kx)) * 4;
                const lum = 0.299 * data[kidx] + 0.587 * data[kidx + 1] + 0.114 * data[kidx + 2];
                gx += lum * sobelX[ki];
                gy += lum * sobelY[ki];
              }
            }
            
            const gradient = Math.sqrt(gx * gx + gy * gy);
            if (gradient > edgeThreshold) {
              edgePixels++;
            }
          }
        }
        
        const edgeDensity = edgePixels / ((width * height) / (sampleStep * sampleStep));
        console.log(`Edge density: ${(edgeDensity * 100).toFixed(1)}%`);
        
        // Preliminary skin color check
        let preliminarySkinPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const y = 0.299 * r + 0.587 * g + 0.114 * b;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

          if (y > 80 && cb > 85 && cb < 135 && cr > 135 && cr < 180) {
            preliminarySkinPixels++;
          }
        }
        const preliminarySkinPercentage = (preliminarySkinPixels / (data.length / 4)) * 100;
        console.log(`Preliminary skin color percentage: ${preliminarySkinPercentage.toFixed(1)}%`);

        // Adaptive edge threshold based on skin color presence
        const adaptiveEdgeThreshold = preliminarySkinPercentage > 5 ? 0.50 : 0.25;
        console.log(`Adaptive edge threshold: ${(adaptiveEdgeThreshold * 100).toFixed(1)}%`);

        // Early acceptance for high skin color percentage
        if (preliminarySkinPercentage > 50 && edgeDensity <= adaptiveEdgeThreshold) {
          console.log('High skin color percentage and acceptable edge density; accepting despite texture.');
          return resolve(true);
        }

        // Reject if edge density is too high (likely fur/feathers)
        if (edgeDensity > adaptiveEdgeThreshold) {
          console.log(`High edge density detected (${(edgeDensity * 100).toFixed(1)}% > ${(adaptiveEdgeThreshold * 100).toFixed(1)}%), likely animal fur/feathers`);
          return resolve(false);
        }
        
        // Calculate dynamic thresholds
        const lumRange = maxLum - minLum;
        const lumThreshold = minLum + (lumRange * 0.2);
        const highlightThreshold = minLum + (lumRange * 0.8);
        const brightnessFactor = Math.min(1.5, Math.max(0.7, avgLum / 128));
        
        // Initialize detection variables
        let skinPixels = 0;
        let textureVariance = 0;
        let previousLum = lums[0] || 0;
        const totalPixels = canvas.width * canvas.height;
        
        // Second pass: Enhanced skin detection
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) continue;
          
          const lum = lums[i >> 2];
          
          if (lum < lumThreshold || lum > highlightThreshold) continue;
          
          // Convert to YCbCr color space
          const y = 0.299 * r + 0.587 * g + 0.114 * b;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          
          // Dynamic color bounds based on brightness
          const cbMin = 80 + (1 - brightnessFactor) * 10;
          const cbMax = 140 + (1 - brightnessFactor) * 10;
          const crMin = 125 - (1 - brightnessFactor) * 10;
          const crMax = 180 + (1 - brightnessFactor) * 10;
          
          // Enhanced skin detection with strict color ratios
          const isSkin = (y > 80 && y < 240) &&
                        (cb > cbMin && cb < cbMax) &&
                        (cr > crMin && cr < crMax) &&
                        (r > 70 && g > 45 && b > 25) &&
                        (r > g && r > b) &&
                        (Math.abs(r - g) > 15) &&
                        (r / (g + 1) > 1.05) &&
                        (r / (g + 1) < 2.5) &&
                        (r / (b + 1) > 1.1) &&
                        (r / (b + 1) < 3.0);
          
          if (isSkin) {
            skinPixels++;
            
            // Texture analysis
            const lumChange = Math.abs(lum - previousLum);
            if (lumChange > 15) {
              textureVariance++;
            }
          }
          
          previousLum = lum;
        }
        
        // Early acceptance for high preliminary skin percentage
        if (preliminarySkinPercentage > 50 && edgeDensity < adaptiveEdgeThreshold) {
          console.log('High preliminary skin percentage with acceptable texture — accepting image as human skin.');
          return resolve(true);
        }
        
        // Calculate final metrics
        const skinPercentage = (skinPixels / totalPixels) * 100;
        const textureScore = (textureVariance / skinPixels) * 100 || 0;
        
        console.log(`Skin detection: ${skinPercentage.toFixed(1)}% skin-like pixels`);
        console.log(`Texture variance: ${textureScore.toFixed(1)}%`);
        
        // Adaptive thresholds based on image characteristics
        const isCloseUp = totalPixels < 300000;
        let minSkinThreshold = isCloseUp ? 3 : 15;
        const maxTextureScore = isCloseUp ? 25 : 40;
        
        // Adjust for green-tinted images
        if (avgG > avgR * 1.1) {
          minSkinThreshold += 5;
        }
        
        // Final decision
        const isSkin = skinPercentage > minSkinThreshold && 
                      textureScore < maxTextureScore;
                      
        console.log(`Skin detection result: ${isSkin ? 'Human skin detected' : 'No human skin detected'}`);
        
        resolve(isSkin);
      } catch (error) {
        console.error('Error in skin detection:', error);
        resolve(false);
      }
    };
    
    img.src = imageData;
  });
}

// Main function to analyze skin images
export async function analyzeSkinImage(imageData: string): Promise<AnalysisResult> {
  console.log('Starting skin image analysis...');
  
  // If no API key is provided, return mock data
  if (!API_KEYS.AUTODERM_API_KEY) {
    console.warn('No API key provided');
    return {
      isNonSkinImage: true,
      message: 'API key is not configured. Please contact support.'
    };
  }

  let warningMessage: string | undefined;

  try {
    console.log('Performing initial skin verification...');
    
    // First, perform a comprehensive check for human skin
    const isHumanSkin = await isHumanSkinImage(imageData);
    console.log('Initial skin verification result:', isHumanSkin);
    
    if (!isHumanSkin) {
      console.warn('Image failed skin verification');
      return {
        isNonSkinImage: true,
        message: 'This image does not contain human skin and cannot be analyzed.'
      } as NonSkinImageResult;
    }

    // If it is human skin, then do a basic skin check without being too strict
    console.log('Running basic skin detection for warning purposes...');
    const basicSkinCheck = await basicSkinDetection(imageData);
    console.log('Basic skin check result:', basicSkinCheck);
    
    if (!basicSkinCheck) {
      console.warn('Basic skin check failed, but proceeding with analysis for warning');
      warningMessage = 'The image quality may be poor or the skin may not be clearly visible. Analysis results may be less accurate.';
    }
    
    console.log('Proceeding with API analysis...');
    
    // Convert base64 to blob
    const parts = imageData.split(';');
    const mimeType = parts[0].split(':')[1];
    const base64 = parts[1].split(',')[1];
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');

    // Add query parameters
    const params = new URLSearchParams();
    params.append('model', MODEL);
    params.append('language', LANGUAGE);
    params.append('simple_names', 'true');
    params.append('anon_filter', 'false');

    console.log('Making API request...');
    // Make API request
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // If image is not of skin, return specific error
      if (response.status === 400 && errorText.includes('not of skin')) {
        console.warn('API reported non-skin image');
        return {
          isNonSkinImage: true,
          message: 'This image does not contain human skin and cannot be analyzed.'
        };
      }
      
      // If API limit is reached, fall back to mock data
      if (response.status === 429 || (errorText && errorText.includes('API_LIMIT_REACHED'))) {
        console.warn('API limit reached, using mock data');
        const mockResult = mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
        return {
          ...mockResult,
          id: generateUUID(),
          message: 'API limit reached. Showing sample analysis.'
        };
      }
      
      // For other API errors, return generic error
      console.warn('API error, using mock data');
      const mockResult = mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
      return {
        ...mockResult,
        id: generateUUID(),
        message: 'Using sample analysis due to API error.'
      };
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (!data.success) {
      // Handle non-skin image case
      if (data.message && (data.message.includes('not of skin') || data.message.includes('no skin'))) {
        console.warn('API reported non-skin image:', data.message);
        return {
          isNonSkinImage: true,
          message: 'This image does not contain human skin and cannot be analyzed.'
        };
      }
      
      // Handle other unsuccessful responses
      console.warn('API returned unsuccessful response:', data.message);
      return {
        isNonSkinImage: true,
        message: 'Unable to analyze the image. Please try again with a clearer photo.'
      };
    }

    // Get the top prediction
    const topPrediction = data.predictions[0];
    console.log('Top prediction:', topPrediction);

    // Map the API response to our SkinAnalysisResult format
    const result: SkinAnalysisResult = {
      id: data.id,
      condition: topPrediction.name,
      description: `Detected with ${(topPrediction.confidence * 100).toFixed(1)}% confidence`,
      severity: mapConfidenceToSeverity(topPrediction.confidence),
      riskScore: getRiskScoreFromConfidence(topPrediction.confidence),
      confidence: topPrediction.confidence,
      recommendations: generateDefaultRecommendations(
        topPrediction.name,
        mapConfidenceToSeverity(topPrediction.confidence)
      ),
      conditionDetails: {
        symptoms: [],
        causes: [],
        whenToSeeDoctor: getWhenToSeeDoctor(topPrediction.confidence),
        treatmentOptions: [],
      },
      preventionTips: generatePreventionTips(topPrediction.name),
      additionalNotes: `ICD Code: ${topPrediction.icd}. For more information, visit: ${topPrediction.readMoreUrl}`,
      warning: warningMessage,
    };

    console.log('Analysis complete:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing skin image:', error);
    return {
      isNonSkinImage: true,
      message: 'An error occurred while analyzing the image. Please try again.'
    };
  }
}