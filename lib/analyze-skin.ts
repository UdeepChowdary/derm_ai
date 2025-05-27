// Toast notifications removed per user request
// import { toast } from "@/hooks/use-toast"

export type SkinAnalysisResult = {
  id: string
  condition: string
  description: string
  severity: string
  recommendations: string[]
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const API_KEY = process.env.NEXT_PUBLIC_AUTODERM_API_KEY
const API_URL = 'https://autoderm.ai/v1/query'

// Mock data for development when API key is not available
const mockAnalysisResults: SkinAnalysisResult[] = [
  {
    id: generateUUID(),
    condition: "Acne Vulgaris",
    description: "Inflammatory skin condition characterized by pimples, blackheads, and whiteheads.",
    severity: "Moderate",
    recommendations: [
      "Cleanse face twice daily with a gentle cleanser",
      "Use non-comedogenic products",
      "Consider over-the-counter treatments with benzoyl peroxide or salicylic acid",
      "Avoid picking or squeezing pimples",
      "Consult a dermatologist for prescription options"
    ]
  },
  {
    id: generateUUID(),
    condition: "Eczema (Atopic Dermatitis)",
    description: "Chronic inflammatory skin condition causing dry, itchy, and red skin.",
    severity: "Mild",
    recommendations: [
      "Moisturize skin frequently with fragrance-free cream",
      "Take short, lukewarm showers",
      "Use gentle, fragrance-free soaps and detergents",
      "Apply prescribed topical corticosteroids as directed",
      "Identify and avoid triggers that worsen symptoms"
    ]
  },
  {
    id: generateUUID(),
    condition: "Psoriasis",
    description: "Autoimmune condition causing rapid skin cell growth leading to thick, scaly patches.",
    severity: "Moderate",
    recommendations: [
      "Keep skin moisturized with thick creams",
      "Try over-the-counter coal tar or salicylic acid products",
      "Consider phototherapy under medical supervision",
      "Manage stress through relaxation techniques",
      "Discuss systemic treatments with your dermatologist"
    ]
  }
];

export async function analyzeSkinImage(imageData: string): Promise<SkinAnalysisResult> {
  try {
    if (!API_KEY) {
      console.warn('API key is not configured, using mock data for development');
      
      // Toast notification removed per user request
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a random mock result
      return mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
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

    // Create form data
    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')
    formData.append('model', 'autoderm_v2_2')
    formData.append('language', 'en')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY || '',
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status}`, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Autoderm API response:', result); // Log the full API response
    
    if (!result.success || !result.predictions || result.predictions.length === 0) {
      throw new Error('No predictions received from API')
    }

    // Use the top prediction
    const topPrediction = result.predictions[0]
    return {
      id: generateUUID(),
      condition: topPrediction.name,
      description: topPrediction.description || 'No description available',
      severity: topPrediction.severity || 'Unknown',
      recommendations: topPrediction.recommendations || []
    }
  } catch (error) {
    console.error('Skin analysis failed:', error)
    // Toast notification removed per user request
    throw error
  }
}