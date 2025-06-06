"use client"

import React from "react"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InfoIcon, AlertTriangle, ThumbsUp } from "lucide-react"

interface ConditionDetailsProps {
  condition: string
  description: string
  severity: string
  risk: number // 0-100
}

// Detailed information about common skin conditions
const conditionDetails: Record<string, { 
  fullName: string,
  description: string,
  causes: string[],
  prevention: string[],
  riskFactors: string[]
}> = {
  "acne": {
    fullName: "Acne Vulgaris",
    description: "A chronic inflammatory skin condition characterized by blackheads, whiteheads, pimples, and deeper lumps that occur on the face, neck, chest, back, shoulders, and upper arms.",
    causes: [
      "Excess oil (sebum) production",
      "Hair follicles clogged by oil and dead skin cells",
      "Bacteria (Propionibacterium acnes)",
      "Inflammation",
      "Hormonal changes, especially during puberty"
    ],

    prevention: [
      "Gentle daily cleansing",
      "Use of non-comedogenic products",
      "Regular exfoliation",
      "Avoiding touching or picking at skin"
    ],
    riskFactors: [
      "Hormonal changes",
      "Family history",
      "Greasy or oily substances on the skin",
      "Friction or pressure on the skin",
      "Stress"
    ]
  },
  "eczema": {
    fullName: "Atopic Dermatitis (Eczema)",
    description: "A chronic skin condition characterized by itchy, inflamed skin that appears as a red rash, often on the face, inside the elbows, behind the knees, and on the hands and feet.",
    causes: [
      "Genetic factors",
      "Immune system dysfunction",
      "Environmental triggers",
      "Skin barrier dysfunction"
    ],

    prevention: [
      "Moisturizing regularly",
      "Identifying and avoiding triggers",
      "Taking shorter, cooler showers",
      "Using gentle, fragrance-free soaps",
      "Wearing soft, breathable fabrics"
    ],
    riskFactors: [
      "Family history of eczema, allergies, or asthma",
      "Living in urban areas or places with low humidity",
      "Exposure to certain fabrics, soaps, or allergens"
    ]
  },
  "psoriasis": {
    fullName: "Psoriasis",
    description: "A chronic autoimmune condition that causes the rapid buildup of skin cells, resulting in scaling on the skin's surface. Inflamed, red patches with silvery-white scales typically appear on the elbows, knees, scalp, and lower back.",
    causes: [
      "Immune system dysfunction",
      "Genetic predisposition",
      "Environmental triggers"
    ],

    prevention: [
      "Avoiding triggers like stress and certain medications",
      "Moisturizing regularly",
      "Avoiding skin injuries",
      "Limiting alcohol consumption",
      "Maintaining a healthy lifestyle"
    ],
    riskFactors: [
      "Family history",
      "Stress",
      "Obesity",
      "Smoking",
      "Certain medications",
      "Infections (especially streptococcal)"
    ]
  },
  "rosacea": {
    fullName: "Rosacea",
    description: "A chronic inflammatory skin condition primarily affecting the face, characterized by redness, visible blood vessels, and sometimes small, red, pus-filled bumps.",
    causes: [
      "Blood vessel abnormalities",
      "Demodex folliculorum mites",
      "Genetic factors",
      "Environmental factors"
    ],

    prevention: [
      "Avoiding triggers like spicy foods, alcohol, and extreme temperatures",
      "Using gentle skincare products",
      "Wearing sunscreen daily",
      "Managing stress"
    ],
    riskFactors: [
      "Fair skin, particularly those of Celtic or Scandinavian ancestry",
      "Family history",
      "Age between 30 and 50",
      "History of sun damage"
    ]
  },
  "melanoma": {
    fullName: "Melanoma",
    description: "The most serious type of skin cancer that develops in the cells (melanocytes) that produce melanin. Melanomas can form on any skin surface but often develop from existing moles.",
    causes: [
      "Ultraviolet (UV) radiation exposure",
      "Genetic factors",
      "Multiple or unusual moles",
      "Weakened immune system"
    ],

    prevention: [
      "Limiting UV exposure",
      "Using sunscreen year-round",
      "Wearing protective clothing",
      "Avoiding tanning beds",
      "Regular skin self-examinations",
      "Professional skin checks"
    ],
    riskFactors: [
      "Fair skin",
      "History of sunburn",
      "Excessive UV exposure",
      "Living closer to the equator or at a higher elevation",
      "Family or personal history of melanoma",
      "Weakened immune system",
      "Many moles or unusual moles"
    ]
  }
}

// Generic information for conditions not in our database
const genericDetails = {
  fullName: "Skin Condition",
  description: "A skin condition identified by our AI system. Further professional evaluation is recommended.",
  causes: [
    "Various factors including genetics, environment, and lifestyle",
    "Specific triggers unique to this condition",
    "Possible immune system factors"
  ],

  prevention: [
    "Maintain good skin hygiene",
    "Use gentle, non-irritating skin products",
    "Protect skin from excessive sun exposure",
    "Stay hydrated and maintain a balanced diet"
  ],
  riskFactors: [
    "Family history of skin conditions",
    "Environmental exposures",
    "Immune system factors",
    "Previous skin issues"
  ]
}

// Helper function to get severity details
const getSeverityDetails = (severity: string) => {
  const severityMap: Record<string, {
    level: number,
    color: string,
    icon: React.ReactNode,
    description: string
  }> = {
    "Mild": {
      level: 25,
      color: "bg-green-500",
      icon: <ThumbsUp className="h-4 w-4" />,
      description: "Minimal symptoms with little impact on daily activities. Often manageable with over-the-counter treatments and good skin care practices."
    },
    "Moderate": {
      level: 50,
      color: "bg-amber-500",
      icon: <InfoIcon className="h-4 w-4" />,
      description: "Noticeable symptoms that may cause discomfort. May require prescription treatments and lifestyle adjustments."
    },
    "Severe": {
      level: 75,
      color: "bg-red-500",
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Significant symptoms that impact quality of life. Requires medical attention and possibly systemic treatments or specialized care."
    },
    "Critical": {
      level: 100,
      color: "bg-purple-700",
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Extensive symptoms requiring immediate medical attention. May indicate a serious underlying condition or risk of complications."
    }
  }

  // Default to moderate if severity not found
  return severityMap[severity] || severityMap["Moderate"]
}

export function ConditionDetails({ condition, description, severity, risk }: ConditionDetailsProps) {
  // Convert condition to lowercase and remove any special characters for matching
  const normalizedCondition = condition.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Find matching condition or use generic information
  const details = Object.keys(conditionDetails).find(key => 
    normalizedCondition.includes(key)
  ) 
    ? conditionDetails[Object.keys(conditionDetails).find(key => 
        normalizedCondition.includes(key)
      ) as string] 
    : genericDetails

  const severityDetails = getSeverityDetails(severity)

  return (
    <div className="space-y-4">
      {/* Severity indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="font-medium text-slate-700 dark:text-slate-200">Severity Level: </span>
            <Badge className={`ml-2 ${severityDetails.color.replace('bg-', 'bg-opacity-80 text-white bg-')}`}>
              <span className="flex items-center">
                {severityDetails.icon}
                <span className="ml-1">{severity}</span>
              </span>
            </Badge>
          </div>
          <span className="text-sm text-slate-500">{severityDetails.level}%</span>
        </div>
        <Progress value={severityDetails.level} className="h-2" />
        <p className="text-sm text-slate-500 mt-2">{severityDetails.description}</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="detailed-description">
          <AccordionTrigger className="text-left font-medium">
            About {details.fullName}
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 dark:text-slate-300">
            {details.description}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="causes">
          <AccordionTrigger className="text-left font-medium">
            Common Causes
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              {details.causes.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        

        
        <AccordionItem value="prevention">
          <AccordionTrigger className="text-left font-medium">
            Prevention Tips
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              {details.prevention.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="risk-factors">
          <AccordionTrigger className="text-left font-medium">
            Risk Factors
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              {details.riskFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <InfoIcon className="inline h-4 w-4 mr-1" />
          This information is provided for educational purposes and should not replace professional medical advice.
        </p>
      </div>
    </div>
  )
}
