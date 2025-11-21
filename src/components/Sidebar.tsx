import React from 'react';
import { Home, Plus, Search, Clock, LogOut, Zap, FileText, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUsage } from '../context/UsageContext';

const Sidebar = () => {
    const location = useLocation();
    const { usedWords, totalWords, percentage } = useUsage();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        K
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">KHAGESH</h3>
                        <p className="text-xs text-gray-500 truncate">Free Plan</p>
                    </div>
                </div>

                {/* AI Limit Progress */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">AI Limit</span>
                        <span className="text-xs text-gray-500">{usedWords.toLocaleString()} / {totalWords.toLocaleString()} Words</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <Link to="/buy-words" className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        <Zap className="w-3 h-3" />
                        Buy More Words
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                <Link
                    to="/"
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/') ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <Link
                    to="/draft"
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/draft') ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Plus className="w-4 h-4" />
                    New
                </Link>
                <div className="pt-4 pb-2 px-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</p>
                </div>
                {[
                    { title: 'Contract Review', date: '2h ago', icon: FileText },
                    { title: 'Legal Research', date: '5h ago', icon: Search },
                    { title: 'Client Memo', date: '1d ago', icon: MessageSquare },
                ].map((item, index) => (
                    <button
                        key={index}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg group text-left"
                    >
                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.date}</p>
                        </div>
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Clock className="w-4 h-4" />
                    History
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
