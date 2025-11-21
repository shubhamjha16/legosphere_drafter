import React, { useState } from 'react';
import { Search, ArrowLeft, Upload, FileText, X, AlertTriangle, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import { generateText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';
import * as pdfjsLib from 'pdfjs-dist';

// Reuse worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface AnalysisResult {
    grammar: string;
    clarity: string;
    risks: string;
    suggestions: string;
}

const ReviewDraftPage = () => {
    const [draftText, setDraftText] = useState('');
    const [fileName, setFileName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const { deductWords } = useUsage();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') return;

        setFileName(file.name);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
            }

            setDraftText(fullText);
        } catch (error) {
            console.error('Error reading PDF:', error);
            alert('Failed to read PDF');
        }
    };

    const handleAnalyze = async () => {
        if (!draftText.trim()) return;

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const prompt = `
        Act as a senior legal editor. Review the following legal draft and provide a detailed critique.
        
        DRAFT TEXT:
        ${draftText.slice(0, 15000)}... (truncated if too long)

        Provide your analysis in the following JSON format:
        {
          "grammar": "List any grammar, spelling, or punctuation errors found, or state 'No errors found'.",
          "clarity": "Assess the clarity, tone, and readability. Is it professional? Is it too legalese?",
          "risks": "Identify potential legal risks, ambiguities, or missing standard clauses.",
          "suggestions": "Provide specific suggestions for improvement."
        }
        
        Ensure the response is valid JSON.
      `;

            const response = await generateText(prompt);

            // Attempt to parse JSON
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setAnalysis({
                        grammar: parsed.grammar,
                        clarity: parsed.clarity,
                        risks: parsed.risks,
                        suggestions: parsed.suggestions
                    });
                } else {
                    throw new Error("No JSON found");
                }
            } catch (e) {
                // Fallback for non-JSON response
                setAnalysis({
                    grammar: "Could not parse structured analysis.",
                    clarity: "Please review the raw output below.",
                    risks: "",
                    suggestions: response
                });
            }

            const wordCount = response.split(/\s+/).length;
            deductWords(wordCount);

        } catch (error) {
            console.error("Error analyzing draft:", error);
            alert("Failed to analyze draft. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Search className="w-6 h-6 text-primary" />
                            Review & Critique Draft
                        </h1>
                        <p className="text-sm text-gray-500">Get AI-powered feedback on grammar, clarity, and legal risks</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Input Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Your Draft</h2>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors text-gray-600">
                                <Upload className="w-3 h-3" />
                                Upload PDF
                                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                            </label>
                            {fileName && (
                                <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <FileText className="w-3 h-3" /> {fileName}
                                    <button onClick={() => { setFileName(''); setDraftText(''); }}><X className="w-3 h-3 hover:text-red-500" /></button>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                        <textarea
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            placeholder="Paste your legal draft here, or upload a PDF..."
                            className="flex-1 w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm font-mono"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !draftText.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing Draft...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Analyze Draft
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">AI Analysis</h2>
                    </div>

                    {!analysis ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>Paste your draft and click analyze to see the critique here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">

                            {/* Grammar */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Grammar & Syntax
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{analysis.grammar}</p>
                            </div>

                            {/* Clarity */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                    Clarity & Tone
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{analysis.clarity}</p>
                            </div>

                            {/* Risks */}
                            <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                                <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Legal Risks & Red Flags
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{analysis.risks}</p>
                            </div>

                            {/* Suggestions */}
                            <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                                <h3 className="font-semibold text-purple-700 flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    Suggestions for Improvement
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{analysis.suggestions}</p>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewDraftPage;
