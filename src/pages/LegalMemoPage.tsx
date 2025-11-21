import React, { useState } from 'react';
import { FileText, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { generateText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';

const LegalMemoPage = () => {
    const [formData, setFormData] = useState({
        to: '',
        from: '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        facts: '',
        issue: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMemo, setGeneratedMemo] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const { deductWords } = useUsage();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!formData.facts.trim() || !formData.issue.trim()) return;

        setIsGenerating(true);
        setGeneratedMemo('');

        try {
            const prompt = `
        Act as a senior legal associate. Write a formal Legal Memorandum based on the following details:

        TO: ${formData.to || '[Recipient Name]'}
        FROM: ${formData.from || '[Your Name]'}
        DATE: ${formData.date}
        SUBJECT: ${formData.subject || '[Subject]'}

        FACTS:
        ${formData.facts}

        LEGAL ISSUE/QUESTION PRESENTED:
        ${formData.issue}

        Please structure the response strictly as a formal Legal Memo with the following sections:
        1. QUESTION PRESENTED
        2. BRIEF ANSWER
        3. STATEMENT OF FACTS
        4. DISCUSSION
        5. CONCLUSION

        Use professional legal tone. 
        
        CRITICAL CITATION RULES:
        1. STRICTLY follow The Bluebook: A Uniform System of Citation.
        2. Cite relevant CASE LAW and STATUTES to support every legal argument.
        3. Format citations correctly (e.g., *Miranda v. Arizona*, 384 U.S. 436 (1966)).
        4. If a specific jurisdiction is not provided, cite general common law principles or famous precedent, but note the jurisdiction.
      `;

            const response = await generateText(prompt);
            setGeneratedMemo(response);

            const wordCount = response.split(/\s+/).length;
            deductWords(wordCount);

        } catch (error) {
            console.error("Error generating memo:", error);
            alert("Failed to generate memo. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedMemo);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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
                            <FileText className="w-6 h-6 text-primary" />
                            Legal Memo Generator
                        </h1>
                        <p className="text-sm text-gray-500">Create professional, structured legal memoranda in seconds</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Input Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Memo Details</h2>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                                <input
                                    type="text"
                                    name="to"
                                    value={formData.to}
                                    onChange={handleInputChange}
                                    placeholder="Senior Partner"
                                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                                <input
                                    type="text"
                                    name="from"
                                    value={formData.from}
                                    onChange={handleInputChange}
                                    placeholder="Associate"
                                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="Re: Smith v. Jones"
                                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Statement of Facts</label>
                            <textarea
                                name="facts"
                                value={formData.facts}
                                onChange={handleInputChange}
                                placeholder="Describe the relevant facts of the case..."
                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-32 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Legal Issue / Question Presented</label>
                            <textarea
                                name="issue"
                                value={formData.issue}
                                onChange={handleInputChange}
                                placeholder="What is the specific legal question to be answered?"
                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24 text-sm"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !formData.facts.trim() || !formData.issue.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Drafting Memo...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Legal Memo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Generated Memo</h2>
                        {generatedMemo && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors bg-white border border-gray-200 px-2 py-1 rounded-md"
                            >
                                {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {isCopied ? 'Copied' : 'Copy Text'}
                            </button>
                        )}
                    </div>

                    {!generatedMemo ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p>Fill in the details and click generate to see your Legal Memo here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            <div className="prose prose-sm max-w-none font-serif">
                                <div className="mb-8 pb-4 border-b border-gray-100">
                                    <p className="mb-1"><span className="font-bold uppercase tracking-wider text-xs text-gray-500">To:</span> {formData.to}</p>
                                    <p className="mb-1"><span className="font-bold uppercase tracking-wider text-xs text-gray-500">From:</span> {formData.from}</p>
                                    <p className="mb-1"><span className="font-bold uppercase tracking-wider text-xs text-gray-500">Date:</span> {formData.date}</p>
                                    <p className="mb-1"><span className="font-bold uppercase tracking-wider text-xs text-gray-500">Subject:</span> {formData.subject}</p>
                                </div>
                                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                    {generatedMemo}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalMemoPage;
