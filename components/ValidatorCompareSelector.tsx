

import React, { useState, useMemo, useEffect } from 'react';
import type { Validator, SortOrder } from '../types';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidSearchIcon } from './icons/LucidSearchIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { useClickOutside } from '../hooks/useClickOutside';
import { LucidArrowUpDownIcon } from './icons/LucidArrowUpDownIcon';
import { LucidCheckIcon } from './icons/LucidCheckIcon';


const MAX_SELECTION = 5;

interface ValidatorCompareSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    allValidators: Validator[];
    currentlySelected: Validator[];
    onConfirmSelection: (selected: Validator[]) => void;
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

const ValidatorItem: React.FC<{
    validator: Validator;
    onToggle: (address: string) => void;
    isSelected: boolean;
    isDisabled: boolean;
}> = ({ validator, onToggle, isSelected, isDisabled }) => {
    const isJailed = validator.jailed;
    const netApr = validator.apr * (1 - validator.commission / 100);

    return (
        <li
            onClick={!isJailed ? () => onToggle(validator.address) : undefined}
            className={`px-3 py-2.5 rounded-lg transition-colors ${
                isJailed 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-zinc-800/50'
                    : `cursor-pointer ${isSelected ? 'bg-rose-100 dark:bg-rose-500/10' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`
            }`}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                            isSelected
                                ? 'bg-[#E70559] border-[#E70559]'
                                : `bg-gray-200 dark:bg-zinc-700 ${isDisabled ? 'border-gray-300 dark:border-zinc-600' : 'border-gray-400 dark:border-zinc-500'}`
                        }`}
                    >
                        {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                     {validator.logo ? (
                        <img src={validator.logo} alt={`${validator.name} logo`} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex-shrink-0 flex items-center justify-center">
                            {isJailed && <LucidAlertTriangleIcon className="w-5 h-5 text-amber-500" />}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className={`font-semibold truncate ${
                            isJailed ? 'text-gray-500 dark:text-gray-500' : 'text-zinc-800 dark:text-white'
                        }`}>
                            {validator.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Net APR: <span className="font-medium">{netApr.toFixed(2)}%</span>
                        </p>
                    </div>
                </div>
            </div>
        </li>
    );
};


export const ValidatorCompareSelector: React.FC<ValidatorCompareSelectorProps> = ({ isOpen, onClose, allValidators, currentlySelected, onConfirmSelection }) => {
    const [selection, setSelection] = useState<Set<string>>(() => new Set(currentlySelected.map(v => v.address)));
    const [searchQuery, setSearchQuery] = useState('');
    const [localSortOrder, setLocalSortOrder] = useState<SortOrder>('netApr-desc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useClickOutside<HTMLDivElement>(() => setIsSortDropdownOpen(false));

    useEffect(() => {
        if (isOpen) {
            setSelection(new Set(currentlySelected.map(v => v.address)));
            setSearchQuery('');
            setLocalSortOrder('netApr-desc'); // Reset sort on open
        }
    }, [isOpen, currentlySelected]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleToggle = (address: string) => {
        setSelection(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(address)) {
                newSelection.delete(address);
            } else if (newSelection.size < MAX_SELECTION) {
                newSelection.add(address);
            }
            return newSelection;
        });
    };

    const handleConfirm = () => {
        const selectedValidators = allValidators.filter(v => selection.has(v.address));
        onConfirmSelection(selectedValidators);
        onClose();
    };

    const locallySortedValidators = useMemo(() => {
        const validatorsCopy = [...allValidators];
        
        validatorsCopy.sort((a, b) => {
            const netAprA = a.apr * (1 - a.commission / 100);
            const netAprB = b.apr * (1 - b.commission / 100);

            switch (localSortOrder) {
                case 'netApr-asc':
                    if (netAprA !== netAprB) return netAprA - netAprB;
                    return (b.votingPowerChz || 0) - (a.votingPowerChz || 0);
                case 'grossApr-desc':
                    if (b.apr !== a.apr) return b.apr - a.apr;
                    return netAprB - netAprA;
                case 'grossApr-asc':
                    if (a.apr !== b.apr) return a.apr - b.apr;
                    return netAprB - netAprA;
                case 'votingPower-desc':
                    if ((b.votingPowerChz || 0) !== (a.votingPowerChz || 0)) return (b.votingPowerChz || 0) - (a.votingPowerChz || 0);
                    return netAprB - netAprA;
                case 'votingPower-asc':
                    if ((a.votingPowerChz || 0) !== (b.votingPowerChz || 0)) return (a.votingPowerChz || 0) - (b.votingPowerChz || 0);
                    return netAprB - netAprA;
                case 'uptime-desc':
                    if ((b.uptime || 0) !== (a.uptime || 0)) return (b.uptime || 0) - (a.uptime || 0);
                    return netAprB - netAprA;
                case 'uptime-asc':
                    if ((a.uptime || 0) !== (b.uptime || 0)) return (a.uptime || 0) - (b.uptime || 0);
                    return netAprB - netAprA;
                case 'commission-asc':
                    if (a.commission !== b.commission) return a.commission - b.commission;
                    return netAprB - netAprA;
                case 'commission-desc':
                     if (a.commission !== b.commission) return b.commission - a.commission;
                    return netAprB - netAprA;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'netApr-desc':
                default:
                    if (netAprB !== netAprA) return netAprB - netAprA;
                    return (b.votingPowerChz || 0) - (a.votingPowerChz || 0);
            }
        });

        return validatorsCopy;
    }, [allValidators, localSortOrder]);

    const filteredValidators = useMemo(() => {
        const activeValidators = locallySortedValidators.filter(v => !v.jailed);
        if (!searchQuery) return activeValidators;
        return activeValidators.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [locallySortedValidators, searchQuery]);
    
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md h-[80vh] max-h-[600px] flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Select Validators</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            You can select up to {MAX_SELECTION}. ({selection.size}/{MAX_SELECTION})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white" aria-label="Close">
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-3 border-b border-gray-200 dark:border-zinc-700/50 flex items-center gap-2">
                    <div className="relative flex-grow">
                        <LucidSearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full bg-gray-100 dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-900 dark:text-white"
                            autoComplete="off"
                        />
                    </div>
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setIsSortDropdownOpen(prev => !prev)}
                            className="p-2.5 rounded-lg bg-gray-100 dark:bg-zinc-900 text-zinc-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
                            aria-label="Sort validators"
                        >
                            <LucidArrowUpDownIcon className="w-5 h-5" />
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 p-2">
                                <ul className="space-y-1">
                                    {sortOptions.map(option => (
                                        <li key={option.value}>
                                            <button
                                                onClick={() => {
                                                    setLocalSortOrder(option.value);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors ${
                                                    localSortOrder === option.value
                                                        ? 'bg-rose-100 text-[#E70559] dark:bg-rose-500/20'
                                                        : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-gray-200'
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                {localSortOrder === option.value && <LucidCheckIcon className="w-4 h-4" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <ul className="space-y-1 p-2">
                        {filteredValidators.map(v => (
                            <ValidatorItem
                                key={v.address}
                                validator={v}
                                onToggle={handleToggle}
                                isSelected={selection.has(v.address)}
                                isDisabled={selection.size >= MAX_SELECTION && !selection.has(v.address)}
                            />
                        ))}
                    </ul>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors"
                    >
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
};