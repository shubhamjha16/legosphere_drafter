const API_BASE_URL = 'http://localhost:3001/api';

interface GenerateTextOptions {
    prompt: string;
    userId?: number;
    feature?: string;
}

interface ChatOptions {
    message: string;
    history?: Array<{ role: string; parts: string[] }>;
    userId?: number;
}

interface ApiResponse {
    text: string;
    wordCount: number;
}

export const backendService = {
    async generateText(options: GenerateTextOptions): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: options.prompt,
                    userId: options.userId || 1,
                    feature: options.feature || 'general',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate text from backend');
            }

            const data: ApiResponse = await response.json();
            return data.text;
        } catch (error) {
            console.error('Backend API Error:', error);
            throw error;
        }
    },

    async chat(options: ChatOptions): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: options.message,
                    history: options.history || [],
                    userId: options.userId || 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to chat with backend');
            }

            const data: ApiResponse = await response.json();
            return data.text;
        } catch (error) {
            console.error('Backend Chat Error:', error);
            throw error;
        }
    },

    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Backend Health Check Failed:', error);
            return false;
        }
    },
};
