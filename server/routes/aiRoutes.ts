import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Gemini lazily to ensure env vars are loaded
const getModel = () => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing in environment variables');
        return null;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Helper to log usage
const logUsage = async (userId: number, feature: string, words: number) => {
    try {
        await prisma.usageLog.create({
            data: {
                userId,
                feature,
                wordsUsed: words,
            },
        });

        await prisma.user.update({
            where: { id: userId },
            data: { usedWords: { increment: words } },
        });
    } catch (error) {
        console.error('Failed to log usage:', error);
    }
};

// Generate Text Endpoint
router.post('/generate', async (req, res) => {
    try {
        const { prompt, userId = 1, feature = 'drafting' } = req.body; // Default userId 1 for now

        const model = getModel();
        if (!model) {
            return res.status(500).json({ error: 'Server missing API Key configuration' });
        }

        console.log('📝 Generating text for prompt:', prompt.substring(0, 50) + '...');
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log('✅ Generated text successfully, length:', text.length);

        // Log usage (approximate word count)
        const wordCount = text.split(/\s+/).length;
        // TEMPORARILY DISABLED for debugging
        // await logUsage(userId, feature, wordCount);

        res.json({ text, wordCount });
    } catch (error: any) {
        console.error('❌ AI Generation Error:', error.message || error);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to generate text', details: error.message });
    }
});

// Chat Endpoint (Simple)
router.post('/chat', async (req, res) => {
    try {
        const { message, history, userId = 1 } = req.body;

        const model = getModel();
        if (!model) {
            return res.status(500).json({ error: 'Server missing API Key configuration' });
        }

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        const wordCount = text.split(/\s+/).length;
        await logUsage(userId, 'chat', wordCount);

        res.json({ text, wordCount });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

export default router;
