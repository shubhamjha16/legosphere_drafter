import { GoogleGenerativeAI } from "@google/generative-ai";
import { backendService } from "./backendService";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set in .env file");
}
console.log("DEBUG: API_KEY loaded:", API_KEY ? "YES - " + API_KEY.substring(0, 5) : "NO");

const genAI = new GoogleGenerativeAI(API_KEY || "dummy-key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Flag to determine if backend is available
let useBackend = true;

export const generateText = async (prompt: string, feature?: string): Promise<string> => {
    // Try backend first if enabled
    if (useBackend) {
        try {
            const text = await backendService.generateText({ prompt, feature });
            return text;
        } catch (error) {
            console.warn('Backend unavailable, falling back to direct Gemini API:', error);
            // Don't disable backend permanently, just for this call if needed, 
            // but for now we want to keep trying backend as it's the primary source.
            // If we want to fallback:
            // useBackend = false; 
        }
    }

    // Fallback to direct Gemini API
    if (!API_KEY) {
        // Mock response if no key
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`[MOCK RESPONSE] This is a simulated response because the API key is missing. \n\nPrompt: ${prompt}`);
            }, 1000);
        });
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating text:", error);
        throw error;
    }
};

export const streamText = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    feature?: string
): Promise<void> => {
    // Backend doesn't support streaming yet, use direct API
    if (!API_KEY) {
        // Mock streaming if no key
        const mockText = `[MOCK RESPONSE] This is a simulated streaming response because the API key is missing.\n\nPrompt: ${prompt}`;
        for (let i = 0; i < mockText.length; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            onChunk(mockText.slice(i, i + 10));
        }
        return;
    }

    try {
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            onChunk(chunkText);
        }
    } catch (error) {
        console.error("Error streaming text:", error);
        throw error;
    }
};

export const generateLegalFlow = async (text: string): Promise<{ nodes: any[], edges: any[] }> => {
    const prompt = `
    Analyze the following legal case facts or text and break it down into a logical flowchart.
    
    Return ONLY a JSON object with this structure:
    {
      "nodes": [
        { "id": "1", "label": "Event A" },
        { "id": "2", "label": "Legal Consequence B" }
      ],
      "edges": [
        { "id": "e1-2", "source": "1", "target": "2" }
      ]
    }

    Rules:
    1. Nodes should represent key events, facts, or legal questions.
    2. Edges should represent causality or logical flow.
    3. Keep labels concise (max 5-7 words).
    4. Create a linear or branching flow as appropriate.

    Text to Analyze:
    ${text}
    `;

    try {
        // Use the unified generateText function which handles backend routing
        const textResponse = await generateText(prompt, 'legal-flow');

        // Clean up markdown code blocks if present
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating flow:", error);
        // Return dummy data on failure
        return {
            nodes: [{ id: '1', label: 'Error generating flow' }],
            edges: []
        };
    }
};

export const analyzeNodeLaw = async (nodeLabel: string, sourceCountry: string, targetCountry: string): Promise<{ domestic: string[], foreign: string[], reasoning: string }> => {
    const prompt = `
    Analyze the following legal concept/event: "${nodeLabel}"

    1. Identify relevant laws/statutes in ${sourceCountry} (Domestic).
    2. Identify equivalent laws/statutes in ${targetCountry} (Foreign).
    3. Provide a brief reasoning comparing the two.

    Return ONLY a JSON object:
    {
      "domestic": ["Section X of Act Y"],
      "foreign": ["Section A of Act B"],
      "reasoning": "Brief comparison..."
    }
    `;

    try {
        // Use the unified generateText function which handles backend routing
        const textResponse = await generateText(prompt, 'law-analysis');

        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error analyzing law:", error);
        return {
            domestic: ["Analysis failed"],
            foreign: ["Analysis failed"],
            reasoning: "Could not generate analysis."
        };
    }
};
