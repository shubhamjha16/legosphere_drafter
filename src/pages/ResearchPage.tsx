import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { generateText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

const ResearchPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Hello! I am your AI legal research assistant. How can I help you today? You can ask me about case law, statutes, or legal concepts.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { deductWords } = useUsage();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsGenerating(true);

        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
            id: aiMessageId,
            role: 'ai',
            content: 'Thinking...',
        };

        setMessages(prev => [...prev, aiMessage]);

        try {
            const fullText = await generateText(userMessage.content, 'research');

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: fullText }
                        : msg
                )
            );

            const wordCount = fullText.trim().split(/\s+/).length;
            deductWords(wordCount);

        } catch (error) {
            console.error("Error generating response:", error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: "I apologize, but I encountered an error while processing your request. Please try again." }
                        : msg
                )
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-semibold text-gray-900">AI Legal Research</h1>
                    <p className="text-xs text-gray-500">Powered by Gemini 1.5 Flash</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-primary/10 text-primary'
                                }`}
                        >
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-none'
                                : 'bg-gray-50 text-gray-900 rounded-tl-none'
                                }`}
                        >
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                {msg.content || (isGenerating && msg.role === 'ai' ? <span className="animate-pulse">Thinking...</span> : '')}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative max-w-4xl mx-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a legal question..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-[52px] max-h-32"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">
                    AI can make mistakes. Please verify important legal information.
                </p>
            </div>
        </div>
    );
};

export default ResearchPage;
