import { describe, it, expect } from "vitest";
import {
  isSkinAnalysisResult,
  isNonSkinImageResult,
  isSkinDetectionWarning,
  SkinAnalysisResult,
} from "@/lib/analyze-skin";

describe("Skin Analysis Type Guards", () => {
  it("correctly identifies SkinAnalysisResult", () => {
    const validResult: SkinAnalysisResult = {
      id: "test-uuid-1234",
      condition: "Acne Vulgaris",
      description: "Detected with 85% confidence",
      severity: "Moderate",
      riskScore: 85,
      confidence: 0.85,
      recommendations: ["Keep skin clean"],
      conditionDetails: {
        symptoms: ["Pimples"],
        causes: ["Excess oil"],
        whenToSeeDoctor: "If persistent",
        treatmentOptions: ["Topical gel"],
      },
      preventionTips: ["Wash face twice daily"],
      additionalNotes: "ICD-10: L70.0",
    };

    expect(isSkinAnalysisResult(validResult)).toBe(true);
    expect(isNonSkinImageResult(validResult)).toBe(false);
    expect(isSkinDetectionWarning(validResult)).toBe(false);
  });

  it("correctly identifies NonSkinImageResult", () => {
    const nonSkinResult = {
      isNonSkinImage: true as const,
      message: "This image does not contain human skin and cannot be analyzed.",
    };

    expect(isNonSkinImageResult(nonSkinResult)).toBe(true);
    expect(isSkinAnalysisResult(nonSkinResult as any)).toBe(false);
    expect(isSkinDetectionWarning(nonSkinResult as any)).toBe(false);
  });

  it("correctly identifies SkinDetectionWarning", () => {
    const warningResult = {
      isNonSkinImage: false as const,
      warning: "Poor image quality detected.",
    };

    expect(isSkinDetectionWarning(warningResult)).toBe(true);
    expect(isNonSkinImageResult(warningResult as any)).toBe(false);
    expect(isSkinAnalysisResult(warningResult as any)).toBe(false);
  });
});
