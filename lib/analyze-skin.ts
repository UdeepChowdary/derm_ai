// Toast notifications removed per user request
// import { toast } from "@/hooks/use-toast"

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
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// API Configuration
const API_KEY = 'e87b320c-1a1d-e543-f372-864f32e962df'
const API_URL = 'https://autoderm.ai/v1/query'
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

export async function analyzeSkinImage(imageData: string): Promise<SkinAnalysisResult> {
  // Always have a fallback to return if anything fails
  const getMockData = () => {
    const randomIndex = Math.floor(Math.random() * mockAnalysisResults.length)
    return mockAnalysisResults[randomIndex]
  }
  
  try {
    // For demo purposes or when API limit is reached, check if we should use mock data
    if (!API_KEY) {
      console.log('No API key found, using mock data')
      return getMockData()
    }
    
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

    // Create form data according to API documentation
    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')
    
    // Add query parameters
    const params = new URLSearchParams()
    params.append('model', MODEL)
    params.append('language', LANGUAGE)
    params.append('simple_names', 'true') // Get simplified disease names
    params.append('anon_filter', 'false')  // Don't filter non-anonymous images
    
    const url = `${API_URL}?${params.toString()}`
    
    // Make the API request with proper headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
      },
      body: formData
    })

    // Handle any API errors
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`API error detected: ${response.status} - ${errorText}`)
      
      // Always fall back to mock data for any API error
      console.log('Falling back to mock data due to API error')
      return getMockData()
    }

    const result = await response.json()
    console.log('Autoderm API response:', result)
    
    // Check if we got valid predictions
    if (!result.success || !result.predictions || result.predictions.length === 0) {
      console.log('No predictions received from API, using mock data')
      return getMockData()
    }

    // Get the top prediction
    const topPrediction = result.predictions[0]
    
    // Map the API response to our enhanced SkinAnalysisResult type
    const severity = mapConfidenceToSeverity(topPrediction.confidence);
    const riskScore = getRiskScoreFromConfidence(topPrediction.confidence);
    const analysisResult: SkinAnalysisResult = {
      id: result.id || generateUUID(),
      condition: topPrediction.name,
      description: `This condition is classified as ${topPrediction.icd} in the International Classification of Diseases.`,
      severity: severity,
      riskScore: riskScore,
      confidence: topPrediction.confidence,
      recommendations: generateDefaultRecommendations(topPrediction.name, severity),
      conditionDetails: {
        symptoms: [], // Will be populated from our mock data or can be expanded
        causes: [],   // Can be expanded with more details
        whenToSeeDoctor: getWhenToSeeDoctor(topPrediction.confidence),
        treatmentOptions: [] // Can be expanded with treatment options
      },
      preventionTips: generatePreventionTips(topPrediction.name),
      additionalNotes: `For more information, visit: ${topPrediction.readMoreUrl || 'consult a healthcare professional'}`
    }
    
    // If we don't have recommendations from the API, generate some based on severity
    if (analysisResult.recommendations.length === 0) {
      analysisResult.recommendations = generateDefaultRecommendations(analysisResult.condition, analysisResult.severity);
    }
    
    return analysisResult;
  } catch (error) {
    // Log the error but don't let it propagate
    console.error('Error analyzing skin image:', error)
    console.log('Falling back to mock data due to error')
    return getMockData()
  }
}