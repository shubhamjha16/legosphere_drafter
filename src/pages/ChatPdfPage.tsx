import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, FileText, X, Paperclip } from 'lucide-react';
import { streamText } from '../services/aiService';
import { useUsage } from '../context/UsageContext';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - using CDN for simplicity in this environment to avoid build config issues
// In a production app, you'd likely bundle the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const ChatPdfPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Upload a PDF document to start chatting with it. I can summarize it, answer questions, or extract specific details.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { deductWords } = useUsage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractTextFromPdf = async (file: File) => {
    setIsProcessing(true);
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

      setPdfText(fullText);
      setFileName(file.name);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: `I've finished reading **${file.name}**. You can now ask me questions about it!`,
      }]);

    } catch (error) {
      console.error('Error extracting PDF text:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: 'Sorry, I failed to read the PDF. Please try another file.',
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      extractTextFromPdf(file);
    }
  };

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
      content: '',
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Construct prompt with PDF context
      const promptWithContext = pdfText
        ? `Context from PDF document (${fileName}):\n${pdfText.slice(0, 30000)}...\n\nUser Question: ${userMessage.content}`
        : userMessage.content;

      let fullText = '';
      await streamText(promptWithContext, (chunk) => {
        fullText += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: fullText }
              : msg
          )
        );
      });

      const wordCount = fullText.trim().split(/\s+/).length;
      deductWords(wordCount);

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: "I apologize, but I encountered an error while processing your request." }
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
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Chat with PDF</h1>
            <p className="text-xs text-gray-500">{fileName ? `Reading: ${fileName}` : 'No PDF uploaded'}</p>
          </div>
        </div>

        {!fileName && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Reading PDF...' : 'Upload PDF'}
          </button>
        )}

        {fileName && (
          <button
            onClick={() => {
              setFileName('');
              setPdfText('');
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'PDF removed. Upload another one if you like.' }]);
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf"
          className="hidden"
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-red-50 text-red-600'
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
            placeholder={fileName ? "Ask a question about the PDF..." : "Upload a PDF first..."}
            disabled={!fileName}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-[52px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !input.trim() || !fileName}
            className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  );
};

export default ChatPdfPage;
