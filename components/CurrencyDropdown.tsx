
import React, { useState } from 'react';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon';
import { CheckIcon } from './icons/CheckIcon';
import { useClickOutside } from '../hooks/useClickOutside';

interface CurrencyDropdownProps {
    supportedCurrencies: string[];
    selectedCurrency: string;
    onCurrencyChange: (currency: string) => void;
    isLoading: boolean;
    error: string | null;
}

const DropdownItem: React.FC<{
    onClick: () => void;
    isSelected: boolean;
    currency: string;
}> = ({ onClick, isSelected, currency }) => (
    <li
        onClick={onClick}
        className={`px-3 py-2.5 cursor-pointer rounded-md transition-colors ${
            isSelected
                ? 'bg-[#E70559]/10 text-[#E70559]'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
        }`}
        role="option"
        aria-selected={isSelected}
    >
        <div className="flex justify-between items-center">
            <span className={`font-semibold uppercase ${isSelected ? 'text-[#E70559]' : 'text-zinc-800 dark:text-white'}`}>
                {currency}
            </span>
            {isSelected && <CheckIcon className="w-5 h-5" />}
        </div>
    </li>
);

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
    supportedCurrencies,
    selectedCurrency,
    onCurrencyChange,
    isLoading,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

    const handleSelect = (currency: string) => {
        onCurrencyChange(currency);
        setIsOpen(false);
    };

    const getDisplayName = () => {
        if (isLoading) return "Loading...";
        if (error) return "Error";
        return selectedCurrency.toUpperCase();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading || !!error}
                className="w-full h-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pl-4 pr-10 text-left text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors disabled:bg-gray-200/50 dark:disabled:bg-zinc-800/50 disabled:cursor-not-allowed uppercase"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">{getDisplayName()}</span>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <ChevronUpDownIcon className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && !isLoading && !error && (
                <div
                    className="absolute z-10 mt-2 w-full bg-white dark:bg-[#1D1D1D]/95 border border-gray-200 dark:border-[#333] rounded-xl p-2 shadow-lg backdrop-blur-sm animate-fade-in-up"
                    role="listbox"
                >
                    <ul className="space-y-1 max-h-60 overflow-y-auto">
                        {supportedCurrencies.map(c => (
                            <DropdownItem
                                key={c}
                                onClick={() => handleSelect(c)}
                                isSelected={selectedCurrency === c}
                                currency={c}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};