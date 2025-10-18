

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure this file has access to process.env.API_KEY.
// In a real Vite/Create-React-App setup, this is typically `import.meta.env.VITE_API_KEY` or `process.env.REACT_APP_API_KEY`.
// For this environment, we'll assume `process.env.API_KEY` is directly available.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI. Gemini features will be disabled.", error);
  }
} else {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!ai) {
        return text; // Return original text if API is not configured
    }

    if (!text || !targetLanguage || targetLanguage === 'en') {
        return text;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}. Return only the translated text, without any additional explanations, labels, or quotation marks.\n\nText to translate: "${text}"`,
            config: {
                temperature: 0.2,
                maxOutputTokens: 2000,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        return text; // Return original text on error
    }
};