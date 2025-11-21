import React from 'react';
import { FileText, Search, Upload, MessageSquare, Scale, FileCheck, GitGraph } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const draftCards = [
        {
            icon: FileText,
            title: 'AI Legal Drafting',
            description: 'Start by drafting and do legal research side by side.',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/draft',
        },
        {
            icon: FileText,
            title: 'Empty Document',
            description: 'Start with an empty document without a prompt.',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            path: '/draft',
        },
        {
            icon: Search,
            title: 'Review Your Draft',
            description: 'Upload your own draft and Legosphere Drafter will improve grammar, check for errors etc.',
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            path: '/review-draft',
        },
        {
            icon: GitGraph,
            title: 'Legal Logic Flowchart',
            description: 'Visualize case logic and compare cross-jurisdictional laws.',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            path: '/case-flow',
        },
    ];

    const researchCards = [
        {
            icon: Search,
            title: 'AI Legal Research',
            description: 'Do accurate legal research by talking to our AI. Get sources and cases for each answer.',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/research',
        },
        {
            icon: FileText,
            title: 'Legal Memo',
            description: 'Prepare comprehensive Legal Memo with citations',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/legal-memo',
        },
        {
            icon: MessageSquare,
            title: 'Chat with PDF',
            description: 'Upload a PDF and prepare list of dates, summarise it, ask questions about it etc.',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/chat-pdf',
        },
        {
            icon: Scale,
            title: 'Generate Arguments',
            description: 'Tell Legosphere Drafter about the case or upload a PDF and generate arguments for your case.',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/generate-arguments',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hi, KHAGESH!</h1>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileText className="w-5 h-5" />
                    <span>Legosphere Drafter</span>
                </div>
            </div>

            {/* Draft Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Draft</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {draftCards.map((card, index) => (
                        <Link
                            to={card.path}
                            key={index}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group block"
                        >
                            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Research Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Research</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {researchCards.map((card, index) => (
                        <Link
                            to={card.path}
                            key={index}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group block"
                        >
                            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* How to use Section */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">How to use Legosphere Drafter</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'AI Legal Drafting by Typing', color: 'bg-[#1e1b4b]' },
                        { title: 'AI Legal Research', color: 'bg-[#1e1b4b]' },
                        { title: 'Prepare Legal Memos', color: 'bg-[#1e1b4b]' },
                    ].map((item, index) => (
                        <div key={index} className={`relative h-48 rounded-xl overflow-hidden ${item.color} group cursor-pointer`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                </div>
                                <h3 className="font-semibold">{item.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
