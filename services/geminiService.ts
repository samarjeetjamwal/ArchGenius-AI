import { GoogleGenAI, Type, Schema, ClientError } from "@google/genai";
import { ARCH_GENIUS_SYSTEM_INSTRUCTION } from "../constants";
import { UserRequirements, GenerationResponse } from "../types";

// Define the schema for the structured output
const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          name: { type: Type.STRING },
          concept: { type: Type.STRING },
          roomSizes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                room: { type: Type.STRING },
                area: { type: Type.STRING },
              },
            },
          },
          totalAreaUsed: { type: Type.STRING },
          layoutDescription: { type: Type.STRING },
          uniqueAspects: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id", "name", "concept", "roomSizes", "totalAreaUsed", "layoutDescription", "uniqueAspects", "pros", "cons"],
      },
    },
  },
  required: ["options"],
};

export const generateFloorPlans = async (requirements: UserRequirements): Promise<GenerationResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from the environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate 4 distinct residential floor plan options based on these requirements:
    - Plot Size/Area: ${requirements.plotSize}
    - Number of Floors: ${requirements.floors}
    - Bedrooms: ${requirements.bedrooms}
    - Bathrooms: ${requirements.bathrooms}
    - Style Preference: ${requirements.style}
    - Specific Requirements: ${requirements.requirements}

    Ensure the response follows the JSON schema strictly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ARCH_GENIUS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: planSchema,
        temperature: 0.7, // Balance creativity and structure
      },
    });

    if (response.text) {
      try {
        return JSON.parse(response.text) as GenerationResponse;
      } catch (e) {
        throw new SyntaxError("The AI generated a response that could not be parsed as valid JSON.");
      }
    } else {
      throw new Error("The AI model returned an empty response.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Differentiate error types for better user feedback
    let errorMessage = "An unexpected error occurred while generating floor plans.";

    if (error instanceof SyntaxError) {
      errorMessage = "Failed to process the design data. Please try again.";
    } else if (error.status === 401 || error.status === 403 || (error.message && error.message.toLowerCase().includes("api key"))) {
      errorMessage = "Authentication failed. Please check if your API Key is valid and active.";
    } else if (error.status === 429 || (error.message && error.message.toLowerCase().includes("quota"))) {
      errorMessage = "Usage limit exceeded. Please try again later.";
    } else if (error.status >= 500) {
      errorMessage = "The AI service is currently experiencing issues. Please try again shortly.";
    } else if (error.message) {
      errorMessage = `Generation failed: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

export const generateVisualization = async (description: string, style: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a specific prompt for the image model emphasizing blueprint aesthetics
    const imagePrompt = `
      Create a high-quality architectural floor plan sketch (top-down 2D blueprint).
      
      Project Parameters:
      - Architectural Style: ${style}
      - Layout Concept: ${description}
      
      Visual Style Requirements:
      - Black ink on white background (blueprint aesthetic).
      - Clean, continuous lines for walls.
      - Standard architectural symbols for doors and windows.
      - 2D orthogonal projection only (no 3D, isometric, or perspective views).
      - Schematic, legible, and professional.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [{ text: imagePrompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: "4:3"
              }
            }
        });

        // Loop through parts to find the image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image was generated by the model.");
    } catch (error: any) {
        console.error("Image Gen Error", error);
        
        let errorMessage = "Failed to generate visualization.";
        if (error.status === 401 || error.status === 403) {
            errorMessage = "Invalid API Key for image generation.";
        } else if (error.status === 429) {
            errorMessage = "Image generation quota exceeded.";
        }
        
        throw new Error(errorMessage);
    }
}
