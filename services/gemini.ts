
import { GoogleGenAI, Type } from "@google/genai";
import { AIPersonality } from "../types";

// Get API key from environment or fallback to prompt
const getApiKey = () => {
  // For development, you can set this in your browser's localStorage
  // localStorage.setItem('GEMINI_API_KEY', 'your-api-key-here')
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem('GEMINI_API_KEY');
    if (!key) {
      console.warn('Gemini API key not found. Set it using: localStorage.setItem("GEMINI_API_KEY", "your-key")');
    }
    return key || '';
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Uses Gemini with Google Maps grounding to turn coordinates into a real address.
 */
export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the exact address or most recognizable landmark at coordinates ${lat}, ${lng}? 
      Respond with ONLY the name and address in a short, professional format.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    
    // Extract address from text or grounding metadata if available
    return response.text || "Synchronized Node";
  } catch (error) {
    console.error("Reverse Geocoding failed:", error);
    return "Unknown Navigation Node";
  }
};

/**
 * Searches for real places using Google Maps grounding.
 */
export const searchPlaces = async (query: string, currentLat?: number, currentLng?: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find real locations matching "${query}" near my current position. 
      Return the results as a JSON array of objects with properties: name, address, lat, lng.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: currentLat && currentLng ? {
            latLng: { latitude: currentLat, longitude: currentLng }
          } : undefined
        }
        // responseMimeType and responseSchema are prohibited when using the googleMaps tool.
      },
    });
    
    // Extract JSON from response text as grounding metadata and results are returned as text/markdown
    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e);
      }
    }
    return [];
  } catch (error) {
    console.error("Place search failed:", error);
    return [];
  }
};

export const generateAIResponse = async (
  prompt: string,
  personality: AIPersonality,
  context: string = ""
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 16384,
        },
        systemInstruction: `You are Mufambi "Pro", an elite AI ride-hailing companion with advanced reasoning capabilities. 
        
        PERSONALITY PROFILE:
        - Current persona: ${personality}.
        - Role: Not just a chatbot, but a proactive travel concierge.
        
        BEHAVIORAL CONSTRAINTS:
        - Reason deeply about the user's intent. If they seem stressed, proactively suggest a calming playlist or a quieter route.
        - Mirror the user's mood intelligently. If they are in "Quiet" mode, don't just be brief—be invisible unless necessary.
        - Provide high-quality, verified travel insights.
        
        CONTEXT DATA:
        ${context}
        
        If the user asks for anything complex (math, logic, travel planning), use your thinking budget to ensure 100% accuracy.`,
        temperature: 0.7,
        topP: 0.9,
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("AI reasoning failed, falling back to basic:", error);
    try {
      const fallback = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      return fallback.text;
    } catch {
      return "I'm currently recalibrating my neural pathways. I'll be back to full intelligence in just a second!";
    }
  }
};

export const getBuddySuggestions = async (userMood: string, rideStatus: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Suggest 3 fictional travel buddies for a Mufambi user who is currently feeling "${userMood}" and has a ride status of "${rideStatus}". 
      
      MATCHING LOGIC:
      - If status is SEARCHING, suggest patient or reassuring buddies.
      - If status is IN_PROGRESS, suggest conversational or entertainment-focused buddies.
      - If mood is TIRED, suggest quiet, low-energy companions.
      - If mood is EXCITED, suggest high-energy, adventurous matches.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The name of the buddy' },
              vibe: { type: Type.STRING, description: 'The personality/vibe of the buddy' },
              matchReason: { type: Type.STRING, description: "Why they are a good match for the user's mood and current ride phase" },
              commonInterests: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Common interests with the user' }
            },
            required: ["name", "vibe", "matchReason", "commonInterests"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to get buddy suggestions:", error);
    return [
      { name: "Tendai", vibe: "Chill", matchReason: "Fellow quiet traveler", commonInterests: ["Lofi", "Books"] },
      { name: "Lisa", vibe: "Eco-warrior", matchReason: "Passionate about carbon offsetting", commonInterests: ["Nature", "Cycling"] }
    ];
  }
};

export const getTrivia = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "Tell me a sophisticated, obscure, and fascinating fact about world transportation or urban history.",
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        systemInstruction: "You are a world-class historian and urban planner. Provide one mind-blowing transportation fact.",
      },
    });
    return response.text || "The London Underground was the world's first underground railway, opening in 1863.";
  } catch {
    return "The London Underground was the world's first underground railway, opening in 1863.";
  }
};
