// geminiService.ts
import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '../config';

let ai: GoogleGenAI | undefined;

// Use VITE_ prefix for browser environment variables in Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.error("VITE_GEMINI_API_KEY not set. AI features will be disabled.");
}

export function isAiReady(): boolean {
    return !!ai;
}

export function startChat(systemInstruction: string): Chat | null {
    if (!ai) return null;

    return ai.chats.create({
        model: GEMINI_TEXT_MODEL,
        config: {
            systemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        },
    });
}

export async function generateTitle(firstMessage: string, language: string): Promise<string> {
    if (!ai) return "";

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: `Generate a very short, concise title (4-5 words max) in ${language} for the following user query. Be direct, no extra text, no quotation marks. Query: "${firstMessage}"`,
            config: {
                thinkingConfig: { thinkingBudget: 0 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ],
            },
        });

        const title = (response.text ?? "").trim().replace(/["']/g, '');
        const words = title.split(/\s+/);
        return words.length > 5 ? `${words.slice(0, 5).join(' ')}...` : title;
    } catch (error) {
        console.error("Failed to generate title:", error);
        return "";
    }
}

export async function generateDevotional(language: string, dailySeed: string) {
    if (!ai) throw new Error("API key not configured. Cannot generate devotional.");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: `Generate a daily devotional in ${language}. Provide a short Bible reading (include the scripture reference and the full text), a brief reflection on it, and a short prayer. The reading should be inspiring. Use the following seed for uniqueness: "${dailySeed}". Do not mention the seed.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reading: {
                            type: Type.OBJECT,
                            properties: {
                                reference: { type: Type.STRING },
                                text: { type: Type.STRING },
                            },
                            required: ["reference", "text"],
                        },
                        reflection: { type: Type.STRING },
                        prayer: { type: Type.STRING },
                    },
                    required: ["reading", "reflection", "prayer"],
                },
            },
        });

        return JSON.parse((response.text ?? "").trim());
    } catch (e) {
        console.error("Failed to parse devotional JSON:", e);
        throw new Error("Invalid devotional format.");
    }
}

export async function enrichStudyItem(messageContent: string, bibleVersion: string, language: string) {
    if (!ai) throw new Error("API key not configured. Cannot enrich item.");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: `A user saved the following Bible-related message for their study. Enhance it for them in ${language}. 
        Analyze this text: "${messageContent}".
        Provide: keywords (3-5), aiReflection (2-3 sentences), and crossReferences (2-3 verses with reference and full text from ${bibleVersion}). Respond ONLY with valid JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        aiReflection: { type: Type.STRING },
                        crossReferences: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    reference: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                },
                                required: ["reference", "text"],
                            },
                        },
                    },
                    required: ["keywords", "aiReflection", "crossReferences"],
                },
            },
        });

        return JSON.parse((response.text ?? "").trim());
    } catch (e) {
        console.error("Failed to parse study item enrichment JSON:", e);
        throw new Error("Invalid enrichment data.");
    }
}
