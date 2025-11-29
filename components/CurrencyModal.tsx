

import React, { useState, useMemo, useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidCheckIcon } from './icons/LucidCheckIcon';
import { LucidSearchIcon } from './icons/LucidSearchIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';

interface CurrencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    supportedCurrencies: Array<{ code: string; name: string }>;
    selectedCurrency: string;
    onCurrencyChange: (currency: string) => void;
    isLoading: boolean;
    error: string | null;
}

const CurrencyItem: React.FC<{
    onClick: () => void;
    isSelected: boolean;
    currencyCode: string;
    currencyName: string;
}> = ({ onClick, isSelected, currencyCode, currencyName }) => (
    <li
        onClick={onClick}
        className={`px-4 py-3 cursor-pointer rounded-lg transition-colors ${
            isSelected
                ? 'bg-[#E70559]/10'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
        }`}
        role="option"
        aria-selected={isSelected}
    >
        <div className="flex justify-between items-center">
            <div>
                 <p className={`font-semibold uppercase ${isSelected ? 'text-[#E70559]' : 'text-zinc-800 dark:text-white'}`}>
                    {currencyCode}
                </p>
                <p className={`text-xs ${isSelected ? 'text-[#E70559]/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {currencyName}
                </p>
            </div>
            {isSelected && <LucidCheckIcon className="w-5 h-5 text-[#E70559]" />}
        </div>
    </li>
);

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
    isOpen,
    onClose,
    supportedCurrencies,
    selectedCurrency,
    onCurrencyChange,
    isLoading,
    error,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            // Clear search on open
            setSearchQuery('');
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);
    
    const filteredCurrencies = useMemo(() => {
        if (!searchQuery) {
            return supportedCurrencies;
        }
        return supportedCurrencies.filter(c =>
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [supportedCurrencies, searchQuery]);

    const handleSelect = (currency: string) => {
        onCurrencyChange(currency);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="flex-grow flex flex-col items-center justify-center animate-pulse p-4">
                    <div className="w-full h-10 bg-gray-200 dark:bg-zinc-800/50 rounded-md mb-2"></div>
                    <div className="w-full h-10 bg-gray-200 dark:bg-zinc-800/50 rounded-md mb-2"></div>
                    <div className="w-full h-10 bg-gray-200 dark:bg-zinc-800/50 rounded-md mb-2"></div>
                    <div className="w-full h-10 bg-gray-200 dark:bg-zinc-800/50 rounded-md"></div>
                </div>
            );
        }
        if (error) {
             return (
                <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl m-4 p-8 flex flex-col items-center justify-center text-center flex-grow">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Currencies</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">{error}</p>
                </div>
            );
        }
        if (filteredCurrencies.length === 0) {
             return (
                <div className="p-8 flex-grow flex items-center justify-center text-center">
                    <p className="text-sm text-zinc-500 dark:text-gray-400">No currencies found for "{searchQuery}".</p>
                </div>
             );
        }
        return (
             <ul className="space-y-1 p-2">
                {filteredCurrencies.map(c => (
                    <CurrencyItem
                        key={c.code}
                        onClick={() => handleSelect(c.code)}
                        isSelected={selectedCurrency === c.code}
                        currencyCode={c.code}
                        currencyName={c.name}
                    />
                ))}
            </ul>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="currency-modal-title"
        >
            <div
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-sm h-[70vh] max-h-[500px] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <h2 id="currency-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">Select Currency</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close currency selection"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-3 border-b border-gray-200 dark:border-zinc-700/50">
                     <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LucidSearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by code or name..."
                            className="w-full bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                   {renderContent()}
                </div>
            </div>
        </div>
    );
};