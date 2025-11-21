import React, { createContext, useContext, useState, useEffect } from 'react';

interface UsageContextType {
    totalWords: number;
    usedWords: number;
    remainingWords: number;
    deductWords: (count: number) => void;
    percentage: number;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const totalWords = 10000000; // 10 Million words plan

    // Initialize from localStorage or default
    const [usedWords, setUsedWords] = useState(() => {
        const saved = localStorage.getItem('usedWords');
        return saved ? parseInt(saved, 10) : 1508174;
    });

    useEffect(() => {
        localStorage.setItem('usedWords', usedWords.toString());
    }, [usedWords]);

    const deductWords = (count: number) => {
        setUsedWords(prev => Math.min(prev + count, totalWords));
    };

    const remainingWords = totalWords - usedWords;
    const percentage = (remainingWords / totalWords) * 100;

    return (
        <UsageContext.Provider value={{ totalWords, usedWords, remainingWords, deductWords, percentage }}>
            {children}
        </UsageContext.Provider>
    );
};

export const useUsage = () => {
    const context = useContext(UsageContext);
    if (context === undefined) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
};
