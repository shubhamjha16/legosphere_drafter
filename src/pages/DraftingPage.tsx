import React, { useState } from 'react';
import Editor from '../components/Editor';
import { Sparkles, Send, Bot, X, Upload, PenLine, ChevronDown } from 'lucide-react';
import { generateText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';

type DraftingStep = 'selection' | 'details' | 'editor';

const DraftingPage = () => {
    const [step, setStep] = useState<DraftingStep>('selection');
    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAiPanel, setShowAiPanel] = useState(true);
    const [language, setLanguage] = useState('English');
    const [isDeepThinking, setIsDeepThinking] = useState(false);
    const { deductWords } = useUsage();

    const handleAiGenerate = async (initialPrompt?: string) => {
        const promptToUse = initialPrompt || prompt;
        if (!promptToUse.trim()) return;

        setIsGenerating(true);
        try {
            const systemPrompt = `
            You are a senior legal associate. Your task is to draft a legal document based on the user's request.
            
            CRITICAL INSTRUCTIONS:
            1. CITATIONS: You must STRICTLY follow the Bluebook citation format for all case law, statutes, and regulations.
            2. TONE: Use formal, precise legal language. Avoid conversational filler.
            3. FORMATTING: Use clear headings, numbered lists, and proper paragraph structure.
            4. ACCURACY: If you cite a case, ensure it is real. If you are unsure about a specific case, mark it as [VERIFY CITATION].
            
            User Request: ${promptToUse}
            `;

            const generatedText = await generateText(systemPrompt, 'drafting');
            setContent(prev => prev + '\n\n' + generatedText);

            const wordCount = generatedText.trim().split(/\s+/).length;
            deductWords(wordCount);

            setPrompt('');
        } catch (error) {
            console.error("Failed to generate:", error);
            alert('Failed to generate text. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStartDrafting = () => {
        setStep('editor');
        handleAiGenerate(prompt);
    };

    if (step === 'selection') {
        return (
            <div className="h-[calc(100vh-2rem)] flex items-center justify-center bg-gray-50/50">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full relative">
                    <button onClick={() => window.history.back()} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Start drafting by</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={() => setStep('details')} // For now both go to details, or upload could go elsewhere
                            className="p-6 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Uploading reference documents</h3>
                            <p className="text-sm text-gray-500">Upload existing documents to use as reference for your draft</p>
                        </button>

                        <button
                            onClick={() => setStep('details')}
                            className="p-6 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <PenLine className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Typing facts of the matter</h3>
                            <p className="text-sm text-gray-500">Start fresh by providing the facts and details of your case</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'details') {
        return (
            <div className="h-[calc(100vh-2rem)] flex items-center justify-center bg-gray-50/50">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full relative">
                    <button onClick={() => setStep('selection')} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <PenLine className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Please tell us more about what you want to draft</h2>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">Do include which legal document you want to draft and the facts of the case</p>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. My client has been charged with Section 6 POCSO and rape charges. The FIR no. is 94 of 2023 and it is alleged that he committed rape of a minor girl in 2017 but he was not in India at that time. I need to draft a petition for quashing the FIR in Delhi high court..."
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-40 text-sm mb-2"
                    />

                    <p className="text-xs text-gray-400 mb-6">Weak Prompt: Add more context for higher quality drafts.</p>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Draft in</label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isDeepThinking}
                                onChange={(e) => setIsDeepThinking(e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">Deep thinking (more accurate draft generation but takes longer)</span>
                        </label>
                    </div>

                    <div className="flex justify-between items-center">
                        <button onClick={() => setStep('selection')} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleStartDrafting}
                            disabled={!prompt.trim()}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-6">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Untitled Draft</h1>
                    <button
                        onClick={() => setShowAiPanel(!showAiPanel)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showAiPanel ? 'bg-gray-100 text-gray-900' : 'bg-primary text-white'}`}
                    >
                        <Bot className="w-4 h-4" />
                        {showAiPanel ? 'Hide AI Assistant' : 'Show AI Assistant'}
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <Editor content={content} onChange={setContent} />
                </div>
            </div>

            {/* AI Assistant Panel */}
            {showAiPanel && (
                <div className="w-96 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Assistant</span>
                        </div>
                        <button onClick={() => setShowAiPanel(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                            <p className="font-medium mb-1">Drafting Mode</p>
                            <p>Tell me what you want to write, and I'll generate it directly in your document.</p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what to write..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAiGenerate();
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleAiGenerate()}
                                disabled={isGenerating || !prompt.trim()}
                                className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftingPage;
