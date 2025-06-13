// Toast notifications removed per user request
// import { toast } from "@/hooks/use-toast"

import { API_KEYS } from "@/config/api-keys"
// Import TensorFlow.js and face detection
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

// Declare global tf for browser
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
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical'
  riskScore: number
  recommendations: string[]
  confidence?: number
  conditionDetails?: {
    symptoms?: string[]
    causes?: string[]
    whenToSeeDoctor?: string
    treatmentOptions?: string[]
  }
  preventionTips?: string[]
  additionalNotes?: string
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

// API Configuration
const API_KEY = API_KEYS.AUTODERM_API_KEY
const API_URL = 'https://3ffac3c3-29f5-593b-8179-73e8f7d133ca/v1/query'
const MODEL = 'autoderm_v2_2' // Using the latest model as per documentation
const LANGUAGE = 'en' // Default language as per documentation

// Mock data for development when API key is not available
const mockAnalysisResults: SkinAnalysisResult[] = [
  {
    id: generateUUID(),
    condition: "Acne Vulgaris",
    description: "Inflammatory skin condition characterized by pimples, blackheads, and whiteheads.",
    severity: "Severe",
    riskScore: 75,
    confidence: 0.65,
    recommendations: [
      "Cleanse face twice daily with a gentle cleanser",
      "Use non-comedogenic products",
      "Consider over-the-counter treatments with benzoyl peroxide or salicylic acid"
    ],
    conditionDetails: {
      symptoms: ["Pimples", "Blackheads", "Whiteheads", "Oily skin", "Redness"],
      causes: ["Excess oil production", "Clogged hair follicles", "Bacteria", "Hormonal changes"],
      whenToSeeDoctor: "If over-the-counter treatments don't improve condition within 4-6 weeks",
      treatmentOptions: ["Topical retinoids", "Antibiotics", "Hormonal therapy", "Light therapy"]
    },
    preventionTips: [
      "Wash your face twice daily and after sweating",
      "Use oil-free, non-comedogenic products",
      "Avoid touching your face frequently",
      "Keep hair clean and off your face"
    ],
    additionalNotes: "Acne is most common in teenagers but can occur at any age. Stress and diet may worsen symptoms for some individuals."
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
    severity: "Critical",
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
function mapConfidenceToSeverity(confidence: number): SkinAnalysisResult['severity'] {
  if (confidence >= 0.75) return 'Critical';
  if (confidence >= 0.5) return 'Severe';
  if (confidence >= 0.25) return 'Moderate';
  return 'Mild';
}

// Helper function to generate recommendations based on condition and severity
function generateDefaultRecommendations(condition: string, severity: SkinAnalysisResult['severity']): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations based on severity
  switch(severity) {
    case 'Mild':
      recommendations.push('Monitor the condition for any changes');
      recommendations.push('Use gentle skincare products');
      recommendations.push('Keep the area clean and moisturized');
      break;
    case 'Moderate':
      recommendations.push('Consider over-the-counter treatments');
      recommendations.push('Avoid known irritants');
      recommendations.push('Schedule a follow-up if no improvement in 1-2 weeks');
      break;
    case 'Severe':
    case 'Critical':
      recommendations.push('Consult a dermatologist as soon as possible');
      recommendations.push('Avoid scratching or irritating the affected area');
      recommendations.push('Follow up with a healthcare provider for treatment options');
      break;
  }
  
  // Add condition-specific recommendations
  if (condition.toLowerCase().includes('acne')) {
    recommendations.push('Use non-comedogenic products');
    recommendations.push('Avoid picking or squeezing lesions');
  } else if (condition.toLowerCase().includes('eczema')) {
    recommendations.push('Apply fragrance-free moisturizer regularly');
    recommendations.push('Avoid hot showers and harsh soaps');
  }
  
  return recommendations;
}

// Helper function to generate prevention tips based on condition
function generatePreventionTips(condition: string): string[] {
  const tips: string[] = [];
  
  // General skin care tips
  tips.push('Use broad-spectrum sunscreen with SPF 30+ daily');
  tips.push('Keep your skin well-moisturized');
  tips.push('Stay hydrated by drinking plenty of water');
  
  // Condition-specific prevention tips
  if (condition.toLowerCase().includes('acne')) {
    tips.push('Wash your face twice daily with a gentle cleanser');
    tips.push('Avoid touching your face with unwashed hands');
    tips.push('Clean items that touch your face (phones, pillowcases, etc.) regularly');
  } else if (condition.toLowerCase().includes('eczema')) {
    tips.push('Identify and avoid triggers that cause flare-ups');
    tips.push('Use a humidifier in dry environments');
    tips.push('Wear soft, breathable fabrics like cotton');
  } else if (condition.toLowerCase().includes('psoriasis')) {
    tips.push('Manage stress through relaxation techniques');
    tips.push('Avoid smoking and limit alcohol consumption');
    tips.push('Get regular, moderate sunlight exposure');
  }
  
  return tips;
}

// Helper function to determine when to see a doctor based on confidence
function getWhenToSeeDoctor(confidence: number): string {
  if (confidence >= 0.7) {
    return 'As soon as possible, preferably within 1-2 days';
  } else if (confidence >= 0.4) {
    return 'Within 1-2 weeks if condition persists or worsens';
  } else {
    return 'If condition worsens or does not improve with basic care';
  }
}

// Helper function to calculate risk score based on severity
function calculateRiskScore(severity: string): number {
  const severityMap: Record<string, number> = {
    'Mild': 25,
    'Moderate': 50,
    'Severe': 75,
    'Critical': 100
  };
  
  return severityMap[severity] || 50;
}

// Helper function to get risk score directly from confidence
function getRiskScoreFromConfidence(confidence: number): number {
  if (confidence >= 0.75) return 100;    // Critical
  if (confidence >= 0.5) return 75;      // Severe
  if (confidence >= 0.25) return 50;     // Moderate
  return 25;                             // Mild
}

// Special type for non-skin image results
type NonSkinImageResult = {
  isNonSkinImage: true;
  message: string;
};

type SkinDetectionWarning = {
  isNonSkinImage: false;
  message: string;
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
  if (faceDetector) return true;
  if (modelLoadAttempted) return false; // Don't try to load multiple times
  
  modelLoadAttempted = true;
  
  try {
    // Set TensorFlow.js backend (WebGL for GPU acceleration)
    await tf.setBackend('webgl');
    
    // Load the face landmarks model
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
      runtime: 'tfjs',
      maxFaces: 1,
      refineLandmarks: false
    };
    
    faceDetector = await faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );
    
    console.log('Face detection model loaded successfully');
    return true;
  } catch (err) {
    console.error('Failed to load face detection model, falling back to color detection:', err);
    return false;
  }
}

// Helper function to detect if an image contains animal-like features
async function containsAnimalFeatures(imageData: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(false);

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
        
        console.log(`Animal detection - Green: ${greenPercent.toFixed(1)}%, Brown/Gray: ${brownGrayPercent.toFixed(1)}%`);
        
        // If either green or brown/gray dominates, it might be an animal
        const isLikelyAnimal = greenPercent > 30 || brownGrayPercent > 60;
        return resolve(isLikelyAnimal);
        
      } catch (error) {
        console.error('Error in animal detection:', error);
        return resolve(false);
      }
    };
    
    img.onerror = () => resolve(false);
    img.src = imageData;
  });
}

async function isHumanSkinImage(imageData: string): Promise<boolean> {
  try {
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.document) {
      console.warn('Not in browser environment, using basic skin detection');
      return false; // Default to false in non-browser environments
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

    // Check image dimensions (too small images might not be reliable)
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
          const keyNames = face.keypoints.map(kp => kp.name?.toLowerCase() || '');
          const eyeCount = keyNames.filter(n => n.includes('eye')).length;
          const hasEyes = eyeCount >= 2;            // both eyes ideally
          const hasNose = keyNames.some(n => n.includes('nose'));
          const hasMouth = keyNames.some(n => n.includes('mouth') || n.includes('lip'));

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
          console.log('Basic skin detection failed, but facial verification sufficient — accepting image.');
          // Proceed even if color/texture check is uncertain since facial landmarks passed
          return true;
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

// Enhanced skin detection with improved human/animal differentiation
async function basicSkinDetection(imageData: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if running in browser environment
    if (typeof document === 'undefined') {
      console.warn('Not in browser environment, cannot perform skin detection');
      return resolve(false); // Default to false in non-browser environments
    }

    const img = new Image();
    
    // Set up error handling for image loading
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

      // Set canvas dimensions with aspect ratio and max dimension
      const maxDimension = 800;
      let width = img.width;
      let height = img.height;
      
      // Check for minimum dimensions
      
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
        const edgeThreshold = 30; // Threshold for edge detection
        
        // Simple Sobel edge detection (simplified for performance)
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        
        // Sample points for edge detection (check every 4th pixel for performance)
        const sampleStep = 4;
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 1; y < height - 1; y += sampleStep) {
          for (let x = 1; x < width - 1; x += sampleStep) {
            const idx = (y * width + x) * 4;
            
            // Get 3x3 neighborhood
            let gx = 0, gy = 0;
            for (let ky = -1, ki = 0; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++, ki++) {
                const kidx = ((y + ky) * width + (x + kx)) * 4;
                const lum = 0.299 * data[kidx] + 0.587 * data[kidx + 1] + 0.114 * data[kidx + 2];
                gx += lum * sobelX[ki];
                gy += lum * sobelY[ki];
              }
            }
            
            // Calculate gradient magnitude
            const gradient = Math.sqrt(gx * gx + gy * gy);
            if (gradient > edgeThreshold) {
              edgePixels++;
            }
          }
        }
        
        // Calculate edge density (edges per pixel sampled)
        const edgeDensity = edgePixels / ((width * height) / (sampleStep * sampleStep));
        console.log(`Edge density: ${(edgeDensity * 100).toFixed(1)}%`);
        
        // Adapt edge density threshold based on skin color presence
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

        // If there's a good amount of skin color, be more tolerant of high edge density.
        // Diseased skin can be both textured (high edge) and have skin tones.
        // Raise the adaptive edge threshold to better accommodate normal facial texture
        // while still filtering out highly textured animal fur/feathers.
        const adaptiveEdgeThreshold = preliminarySkinPercentage > 5 ? 0.40 : 0.25;
        console.log(`Adaptive edge threshold: ${(adaptiveEdgeThreshold * 100).toFixed(1)}%`);

        // If there is a very high proportion of skin-colored pixels, allow higher texture (edge density)
        // Diseased or inflamed skin (e.g., eczema, psoriasis) often has flaking/cracks that increase edge count.
        // Accept images with >50% skin color as long as edge density is not extreme (>65%).
        if (preliminarySkinPercentage > 50 && edgeDensity <= 0.65) {
          console.log('High skin color percentage and acceptable edge density; accepting despite texture.');
          return resolve(true);
        }

        // If edge density is too high, likely fur/feathers
        if (edgeDensity > adaptiveEdgeThreshold) {
          console.log(`High edge density detected (${(edgeDensity * 100).toFixed(1)}% > ${(adaptiveEdgeThreshold * 100).toFixed(1)}%), likely animal fur/feathers`);
          return resolve(false);
        }
        
        // Calculate dynamic thresholds based on image content
        const lumRange = maxLum - minLum;
        const lumThreshold = minLum + (lumRange * 0.2);
        const highlightThreshold = minLum + (lumRange * 0.8);
        const brightnessFactor = Math.min(1.5, Math.max(0.7, avgLum / 128));
        
        // Initialize detection variables
        let skinPixels = 0;
        let textureVariance = 0;
        let previousLum = lums[0] || 0;
        const totalPixels = canvas.width * canvas.height;
        
        // Second pass: Detect skin and analyze texture
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) continue;
          
          const lum = lums[i >> 2];
          
          // Skip extreme dark/light pixels
          if (lum < lumThreshold || lum > highlightThreshold) continue;
          
          // Convert to YCbCr color space
          const y = 0.299 * r + 0.587 * g + 0.114 * b;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          
          // Relaxed skin color bounds to improve recognition under varied lighting
          const cbMin = 80 + (1 - brightnessFactor) * 10;
          const cbMax = 140 + (1 - brightnessFactor) * 10;
          const crMin = 125 - (1 - brightnessFactor) * 10;
          const crMax = 180 + (1 - brightnessFactor) * 10;
          
          // Enhanced skin detection with stricter color ratios
          const isSkin = (y > 80 && y < 240) &&
                        (cb > cbMin && cb < cbMax) &&
                        (cr > crMin && cr < crMax) &&
                        (r > 70 && g > 45 && b > 25) &&
                        (r > g && r > b) &&
                        (Math.abs(r - g) > 15) &&
                        (r / (g + 1) > 1.05) && // Red should be dominant but not too much
                        (r / (g + 1) < 2.5) &&
                        (r / (b + 1) > 1.1) &&
                        (r / (b + 1) < 3.0);
          
          if (isSkin) {
            skinPixels++;
            
            // Simple texture analysis - detect rapid luminance changes (fur)
            const lumChange = Math.abs(lum - previousLum);
            if (lumChange > 15) { // Threshold for texture detection
              textureVariance++;
            }
          }
          
          previousLum = lum;
        }
        
        // Early acceptance: if preliminary skin percentage is already high (>20%)
        // and edge density is within threshold, skip stricter checks.
        if (preliminarySkinPercentage > 20 && edgeDensity < adaptiveEdgeThreshold) {
          console.log('High preliminary skin percentage with acceptable texture — accepting image as human skin.');
          return resolve(true);
        }
        
        // Calculate metrics
        const skinPercentage = (skinPixels / totalPixels) * 100;
        const textureScore = (textureVariance / skinPixels) * 100 || 0;
        
        console.log(`Skin detection: ${skinPercentage.toFixed(1)}% skin-like pixels`);
        console.log(`Texture variance: ${textureScore.toFixed(1)}%`);
        
        // Adaptive thresholds
        const isCloseUp = totalPixels < 300000;
        let minSkinThreshold = isCloseUp ? 3 : 8; // Much lower threshold for close-up webcam images
        const maxTextureScore = isCloseUp ? 25 : 40; // Higher tolerance for full body
        
        // Adjust thresholds based on overall image characteristics
        if (avgG > avgR * 1.1) {
          // Green-tinted images are more likely to be nature/animal
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
    console.log('Starting image analysis...');
    
    // First, perform a comprehensive check for human skin
    const isHumanSkin = await isHumanSkinImage(imageData);
    if (!isHumanSkin) {
      console.warn('Image is not human skin, rejecting analysis.');
      return {
        isNonSkinImage: true,
        message: 'This image does not contain human skin and cannot be analyzed.'
      } as NonSkinImageResult;
    }

    // If it is human skin, then do a basic skin check without being too strict
    console.log('Running basic skin detection for warning purposes...');
    const basicSkinCheck = await basicSkinDetection(imageData);
    
    if (!basicSkinCheck) {
      console.warn('Basic skin check failed, but proceeding with analysis for warning.');
      warningMessage = 'The image quality may be poor or the skin may not be clearly visible. Analysis results may be less accurate.';
    }
    
    console.log('Image appears to contain skin, proceeding with analysis');
  } catch (error) {
    console.error('Error during initial skin analysis, proceeding with caution:', error);
    // Continue with analysis even if initial detection fails, but with a warning
    warningMessage = 'An error occurred during initial skin detection. Analysis results may be less accurate.';
  }

  try {
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
        console.warn('Non-skin image detected');
        return {
          isNonSkinImage: true,
          message: 'This image does not contain human skin and cannot be analyzed.'
        };
      }
      
      // If API limit is reached, fall back to mock data
      if (response.status === 429 || (errorText && errorText.includes('API_LIMIT_REACHED'))) {
        console.warn('API limit reached, falling back to mock data');
        const mockResult = mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
        return {
          ...mockResult,
          id: generateUUID(),
          message: 'API limit reached. Showing sample analysis.'
        };
      }
      
      // For other API errors, return generic error
      console.warn('API error, falling back to mock data');
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
        console.warn('Non-skin image detected:', data.message);
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

    return result;
  } catch (error) {
    console.error('Error analyzing skin image:', error);
    // Return error for any other failures
    return {
      isNonSkinImage: true,
      message: 'An error occurred while analyzing the image. Please try again.'
    };
  }
}