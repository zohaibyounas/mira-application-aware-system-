
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ApplicationType } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are a Senior Embedded Safety Engineer at Mira Elektronikentwicklung.
Your role is to analyze incomplete system descriptions and identify missing requirements, assumptions, and risks.
You must be rigorous, skeptical, and safety-focused.

Follow this 7-step internal logic:
1. Extract structured data (MCU, voltage, interfaces).
2. Classify as BMS, Motor Control, or Generic Embedded.
3. Identify gaps based on domain standards (e.g., ISO 26262, IEC 61508).
4. For each gap/assumption, provide:
   - title: Short name of the issue.
   - explanation: Deep technical context of what is missing/unclear.
   - implication: The safety or cost risk of leaving this unaddressed.
5. Generate DRAFT artifacts: Safety Plan Skeleton, FMEA Table, Hardware Concepts, and Code Patterns.

IMPORTANT CONSTRAINTS:
- NEVER provide production-ready designs.
- Artifacts must be DELIBERATELY INCOMPLETE.
- Every output must emphasize the NEED for human engineering review.
- Code snippets must be non-compilable patterns.

Return your response in a strictly structured JSON format.`;

const GAP_DETAIL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    implication: { type: Type.STRING },
  },
  required: ["title", "explanation", "implication"],
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    profile: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        extractedEntities: {
          type: Type.OBJECT,
          properties: {
            voltages: { type: Type.ARRAY, items: { type: Type.STRING } },
            mcu: { type: Type.ARRAY, items: { type: Type.STRING } },
            interfaces: { type: Type.ARRAY, items: { type: Type.STRING } },
            safetyKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      required: ["type", "extractedEntities"],
    },
    gaps: {
      type: Type.OBJECT,
      properties: {
        missingTopics: { type: Type.ARRAY, items: GAP_DETAIL_SCHEMA },
        vagueSpecifications: { type: Type.ARRAY, items: GAP_DETAIL_SCHEMA },
        dangerousAssumptions: { type: Type.ARRAY, items: GAP_DETAIL_SCHEMA },
      },
      required: ["missingTopics", "vagueSpecifications", "dangerousAssumptions"],
    },
    artifacts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          content: { type: Type.STRING },
          disclaimer: { type: Type.STRING },
        },
        required: ["title", "type", "content", "disclaimer"],
      },
    },
  },
  required: ["profile", "gaps", "artifacts"],
};

export const analyzeSystemDescription = async (userInput: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this system description: "${userInput}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text || '{}';
    const result = JSON.parse(text) as any;
    
    let type = ApplicationType.GENERIC_EMBEDDED;
    if (result.profile.type.toLowerCase().includes('bms')) type = ApplicationType.BMS;
    else if (result.profile.type.toLowerCase().includes('motor')) type = ApplicationType.MOTOR_CONTROL;

    return {
      ...result,
      profile: {
        ...result.profile,
        type
      }
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
