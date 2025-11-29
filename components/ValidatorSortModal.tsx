

import React, { useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidCheckIcon } from './icons/LucidCheckIcon';
import type { SortOrder } from '../types';

interface ValidatorSortModalProps {
    isOpen: boolean;
    onClose: () => void;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
}

const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'netApr-desc', label: 'Net APR (High-Low)' },
    { value: 'netApr-asc', label: 'Net APR (Low-High)' },
    { value: 'grossApr-desc', label: 'Gross APR (High-Low)' },
    { value: 'grossApr-asc', label: 'Gross APR (Low-High)' },
    { value: 'votingPower-desc', label: 'Voting Power (High-Low)' },
    { value: 'votingPower-asc', label: 'Voting Power (Low-High)' },
    { value: 'commission-asc', label: 'Commission (Low-High)' },
    { value: 'commission-desc', label: 'Commission (High-Low)' },
    { value: 'uptime-desc', label: 'Uptime (High-Low)' },
    { value: 'uptime-asc', label: 'Uptime (Low-High)' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
];

export const ValidatorSortModal: React.FC<ValidatorSortModalProps> = ({
    isOpen,
    onClose,
    sortOrder,
    onSortChange,
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleSelect = (order: SortOrder) => {
        onSortChange(order);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sort-modal-title"
        >
            <div
                className="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-sm max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                    <h2 id="sort-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">Sort By</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close sort options"
                    >
                        <LucidXIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto">
                    <ul className="space-y-2.5">
                        {sortOptions.map(option => {
                            const isSelected = sortOrder === option.value;
                            return (
                                <li key={option.value}>
                                    <button
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full flex justify-between items-center text-left px-4 py-3 cursor-pointer rounded-lg transition-colors text-base font-semibold shadow-sm ${
                                            isSelected
                                                ? 'bg-rose-100 text-[#E70559] dark:bg-rose-500/20 dark:text-rose-200'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                        }`}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <LucidCheckIcon className="w-5 h-5 text-[#E70559] dark:text-rose-200" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};