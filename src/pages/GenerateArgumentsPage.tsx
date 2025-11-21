import React, { useState } from 'react';
import { Scale, Send, ArrowLeft, Copy, Check, FileText, Upload, X } from 'lucide-react';
import { generateText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';
import * as pdfjsLib from 'pdfjs-dist';

// Reuse worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const GenerateArgumentsPage = () => {
    const [caseDescription, setCaseDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [argumentsResult, setArgumentsResult] = useState<{ for: string; against: string } | null>(null);
    const [fileName, setFileName] = useState('');
    const { deductWords } = useUsage();
    const [copiedState, setCopiedState] = useState<'for' | 'against' | null>(null);

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

            setCaseDescription(prev => prev + (prev ? '\n\n' : '') + `[Content from ${file.name}]:\n${fullText}`);
        } catch (error) {
            console.error('Error reading PDF:', error);
            alert('Failed to read PDF');
        }
    };

    const handleGenerate = async () => {
        if (!caseDescription.trim()) return;

        setIsGenerating(true);
        setArgumentsResult(null);

        try {
            const prompt = `
        Act as a highly experienced lawyer. Based on the following case description/facts, generate a comprehensive list of legal arguments FOR and AGAINST the primary party involved.
        
        Case Description:
        ${caseDescription}

        Format the response exactly as a JSON object with two keys: "argumentsFor" and "argumentsAgainst".
        Each key should contain a markdown string with bullet points of the arguments.
        
        Example format:
        {
          "argumentsFor": "- Argument 1\\n- Argument 2",
          "argumentsAgainst": "- Counter-argument 1\\n- Counter-argument 2"
        }
      `;

            const response = await generateText(prompt);

            // Basic parsing of the response to try and extract JSON
            // This is a bit fragile with LLMs, but good for a demo
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setArgumentsResult({
                    for: parsed.argumentsFor,
                    against: parsed.argumentsAgainst
                });
            } else {
                // Fallback if not JSON
                setArgumentsResult({
                    for: response,
                    against: "Could not separate arguments. See 'Arguments For' for full text."
                });
            }

            const wordCount = response.split(/\s+/).length;
            deductWords(wordCount);

        } catch (error) {
            console.error("Error generating arguments:", error);
            alert("Failed to generate arguments. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, side: 'for' | 'against') => {
        navigator.clipboard.writeText(text);
        setCopiedState(side);
        setTimeout(() => setCopiedState(null), 2000);
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
                            <Scale className="w-6 h-6 text-primary" />
                            Generate Arguments
                        </h1>
                        <p className="text-sm text-gray-500">Analyze your case and generate balanced legal arguments</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Input Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Case Details</h2>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors text-gray-600">
                                <Upload className="w-3 h-3" />
                                Upload PDF
                                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                            </label>
                            {fileName && (
                                <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <FileText className="w-3 h-3" /> {fileName}
                                    <button onClick={() => { setFileName(''); setCaseDescription(''); }}><X className="w-3 h-3 hover:text-red-500" /></button>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                        <textarea
                            value={caseDescription}
                            onChange={(e) => setCaseDescription(e.target.value)}
                            placeholder="Describe the facts of the case here, or upload a PDF..."
                            className="flex-1 w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !caseDescription.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Scale className="w-4 h-4" />
                                        Generate Arguments
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Generated Arguments</h2>
                    </div>

                    {!argumentsResult ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <Scale className="w-12 h-12 mb-4 opacity-20" />
                            <p>Enter case details and click generate to see legal arguments here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Arguments For */}
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-green-800 flex items-center gap-2">
                                        <Check className="w-4 h-4" /> Arguments FOR
                                    </h3>
                                    <button
                                        onClick={() => copyToClipboard(argumentsResult.for, 'for')}
                                        className="text-green-600 hover:text-green-800 p-1 rounded"
                                    >
                                        {copiedState === 'for' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="prose prose-sm prose-green max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-green-900">{argumentsResult.for}</pre>
                                </div>
                            </div>

                            {/* Arguments Against */}
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                        <X className="w-4 h-4" /> Arguments AGAINST
                                    </h3>
                                    <button
                                        onClick={() => copyToClipboard(argumentsResult.against, 'against')}
                                        className="text-red-600 hover:text-red-800 p-1 rounded"
                                    >
                                        {copiedState === 'against' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="prose prose-sm prose-red max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-red-900">{argumentsResult.against}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateArgumentsPage;
