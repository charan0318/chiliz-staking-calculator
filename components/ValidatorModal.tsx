

import React, { useState, useMemo, useEffect } from 'react';
import type { Validator } from '../types';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidCheckIcon } from './icons/LucidCheckIcon';
import { LucidSearchIcon } from './icons/LucidSearchIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';

interface ValidatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    validators: Validator[];
    selectedValidator: Validator | null;
    onValidatorChange: (validatorAddress: string) => void;
    averageApr: number;
    bestValidatorAddress: string | null;
    hasInteractedWithValidator: boolean;
    appLogoUrl: string | null;
}

const ValidatorItem: React.FC<{
    onClick: () => void;
    isSelected: boolean;
    validator: Validator;
    netApr: number;
    isTopPick?: boolean;
    isAverage?: boolean;
}> = ({ onClick, isSelected, validator, netApr, isTopPick = false, isAverage = false }) => (
    <li
        onClick={!validator.jailed ? onClick : undefined}
        className={`px-3 py-2.5 rounded-lg transition-colors ${
            validator.jailed 
                ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-zinc-800/50'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer'
        }`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={validator.jailed}
    >
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
                {validator.logo ? (
                    <img src={validator.logo} alt={`${validator.name} logo`} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        validator.jailed ? 'bg-amber-100 dark:bg-amber-900/20' : 
                        isAverage ? 'bg-gray-200 dark:bg-zinc-700' :
                        'bg-gray-200 dark:bg-zinc-700'
                    }`}>
                         {validator.jailed && <LucidAlertTriangleIcon className="w-5 h-5 text-amber-500" />}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className={`font-semibold truncate ${
                            validator.jailed ? 'text-gray-500 dark:text-gray-500' :
                            isSelected ? 'text-[#E70559]' : 'text-zinc-800 dark:text-white'
                        }`}>
                            {validator.name}
                        </p>
                        {validator.jailed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex-shrink-0">
                                <LucidAlertTriangleIcon className="w-3 h-3" />
                                Jailed
                            </span>
                        ) : isTopPick && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700/50 flex-shrink-0">
                                <LucidSparklesIcon className="w-3 h-3" />
                                Top Pick
                            </span>
                        )}
                    </div>
                    {netApr !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            APR: <span className="font-medium">{validator.apr.toFixed(2)}%</span> / Net: <span className="font-medium">{netApr.toFixed(2)}%</span>
                        </p>
                    )}
                </div>
            </div>
            {isSelected && !validator.jailed && <LucidCheckIcon className="w-5 h-5 text-[#E70559]" />}
        </div>
    </li>
);

export const ValidatorModal: React.FC<ValidatorModalProps> = ({
    isOpen, onClose, validators, selectedValidator, onValidatorChange, averageApr, bestValidatorAddress, hasInteractedWithValidator, appLogoUrl
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
            setSearchQuery('');
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    const filteredValidators = useMemo(() => {
        if (!searchQuery) {
            return validators;
        }
        return validators.filter(v =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [validators, searchQuery]);

    const handleSelect = (validatorAddress: string) => {
        onValidatorChange(validatorAddress);
        onClose();
    };

    if (!isOpen) {
        return null;
    }
    
    const showAverage = !searchQuery || 'average net apr'.includes(searchQuery.toLowerCase());
    const showNoResults = !showAverage && filteredValidators.length === 0;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="validator-modal-title"
        >
            <div
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-sm h-[70vh] max-h-[500px] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <h2 id="validator-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">Select Validator</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close validator selection"
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
                            placeholder="Search by validator name..."
                            className="w-full bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {showNoResults ? (
                        <div className="p-8 flex-grow flex items-center justify-center text-center">
                            <p className="text-sm text-zinc-500 dark:text-gray-400">No validators found for "{searchQuery}".</p>
                        </div>
                    ) : (
                        <ul className="space-y-1 p-2">
                             {showAverage && (
                                <ValidatorItem
                                    onClick={() => handleSelect("")}
                                    isSelected={hasInteractedWithValidator && !selectedValidator}
                                    validator={{ name: "Average Net APR", apr: averageApr, jailed: false, address: '', commission: 0, logo: appLogoUrl || undefined }}
                                    netApr={averageApr}
                                    isAverage={true}
                                />
                             )}
                            {filteredValidators.map(v => {
                                const netApr = v.apr * (1 - (v.commission / 100));
                                return (
                                    <ValidatorItem
                                        key={v.address}
                                        onClick={() => handleSelect(v.address)}
                                        isSelected={selectedValidator?.address === v.address}
                                        validator={v}
                                        netApr={netApr}
                                        isTopPick={v.address === bestValidatorAddress}
                                    />
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};