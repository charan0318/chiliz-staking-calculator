



import React, { useState, useMemo, useEffect } from 'react';
import { ChilizIcon } from './icons/ChilizIcon';
import { PRESET_REWARD_TARGETS } from '../constants';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidTargetIcon } from './icons/LucidTargetIcon';
import { LucidXIcon } from './icons/LucidXIcon';
import type { Validator } from '../types';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';

interface DelegationCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    averageApr: number;
    chzPrice: number;
    selectedCurrency: string;
    selectedValidator: Validator | null;
    onShowInfo: (title: string, content: React.ReactNode) => void;
    appLogoUrl: string | null;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const periods: { value: Period, label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const formatNumber = (num: number, maximumFractionDigits: number = 2, minimumFractionDigits?: number): string => {
    return num.toLocaleString('en-US', {
        maximumFractionDigits,
        minimumFractionDigits: minimumFractionDigits || maximumFractionDigits,
    });
};

const formatCurrency = (amount: number, currency: string): string => {
    try {
        return amount.toLocaleString(undefined, {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } catch (e) {
        return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
    }
};

export const DelegationCalculator: React.FC<DelegationCalculatorProps> = ({
    isOpen, onClose, averageApr, chzPrice, selectedCurrency, selectedValidator, onShowInfo, appLogoUrl
}) => {
    const [targetAmount, setTargetAmount] = useState<string>('');
    const [targetPeriod, setTargetPeriod] = useState<Period | null>('monthly');

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

    const handleAmountChange = (value: string) => {
        if (/^\d*\.?\d*$/.test(value)) {
            setTargetAmount(value);
        }
    };
    
    const handlePresetClick = (amount: number) => {
        if (parseFloat(targetAmount) === amount) {
            setTargetAmount('');
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        } else {
            setTargetAmount(amount.toString());
        }
    };

    const handleTimeframeClick = (period: Period) => {
        // If the clicked period is already selected, deselect it. Otherwise, select it.
        if (targetPeriod === period) {
            setTargetPeriod(null);
            // When deselecting, blur the currently focused element to remove the focus ring.
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        } else {
            setTargetPeriod(period);
        }
    };

    const currentApr = useMemo(() => {
        if (selectedValidator) {
            return selectedValidator.jailed ? 0 : selectedValidator.apr * (1 - selectedValidator.commission / 100);
        }
        return averageApr;
    }, [selectedValidator, averageApr]);

    const calculationResult = useMemo(() => {
        const amount = parseFloat(targetAmount);

        if (isNaN(amount) || amount <= 0 || isNaN(chzPrice) || chzPrice <= 0 || currentApr <= 0 || !targetPeriod) {
            return null;
        }

        let annualTargetChz = amount;
        if (targetPeriod === 'daily') annualTargetChz *= 365;
        if (targetPeriod === 'weekly') annualTargetChz *= 52;
        if (targetPeriod === 'monthly') annualTargetChz *= 12;

        const requiredStake = annualTargetChz / (currentApr / 100);
        
        return {
            requiredStakeChz: requiredStake,
            requiredStakeFiat: requiredStake * chzPrice,
        };
    }, [targetAmount, targetPeriod, chzPrice, currentApr]);
    
    if (!isOpen) {
        return null;
    }

    return (
         <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delegation-calculator-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2">
                        <LucidTargetIcon className="w-5 h-5 text-gray-400" />
                        <h2 id="delegation-calculator-title" className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Delegation Calculator</h2>
                        <button
                            type="button"
                            onClick={() => onShowInfo(
                                'About the Delegation Calculator',
                                'This tool helps you estimate how much CHZ you need to stake to reach a specific reward target. The calculation is based on the selected validator\'s Net APR, or the network average if no validator is chosen. It should be used as a planning guide, as actual rewards can vary.'
                            )}
                            aria-label="More information about the delegation calculator"
                            className="group p-1 -m-1"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                        </button>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close delegation calculator"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="targetAmount" className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                                CHZ Reward Target
                            </label>
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                {appLogoUrl ? (
                                    <img src={appLogoUrl} alt="CHZ Logo" className="h-5 w-5 rounded-full object-cover" />
                                ) : (
                                    <ChilizIcon className="h-5 w-5 text-[#E70559]" />
                                )}
                            </div>
                            <input
                                type="text"
                                id="targetAmount"
                                name="targetAmount"
                                inputMode="decimal"
                                value={targetAmount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                placeholder="e.g., 1000"
                                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pr-4 text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors pl-10"
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {PRESET_REWARD_TARGETS.map((amount) => {
                                const isSelected = parseFloat(targetAmount) === amount;
                                return (
                                    <button
                                        key={amount}
                                        onClick={() => handlePresetClick(amount)}
                                        className={`py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559] border-2 ${
                                            isSelected
                                                ? 'bg-gray-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold border-[#E70559]'
                                                : 'bg-gray-200 dark:bg-zinc-800/60 text-zinc-700 dark:text-gray-300 font-semibold border-transparent hover:bg-gray-300 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {amount}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-gray-300 mb-2">
                            Timeframe
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {periods.map(period => {
                                const isSelected = targetPeriod === period.value;
                                return (
                                    <button
                                        key={period.value}
                                        onClick={() => handleTimeframeClick(period.value)}
                                        className={`py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559] border-2 ${
                                            isSelected
                                                ? 'bg-gray-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold border-[#E70559]'
                                                : 'bg-gray-200 dark:bg-zinc-800/60 text-zinc-700 dark:text-gray-300 font-semibold border-transparent hover:bg-gray-300 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {period.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="bg-gray-100 dark:bg-zinc-900/50 rounded-lg p-4 text-center min-h-[156px] flex flex-col justify-center">
                            {selectedValidator?.jailed ? (
                                <div className="flex flex-col items-center justify-center text-amber-700 dark:text-amber-300 space-y-2">
                                    <LucidAlertTriangleIcon className="w-10 h-10 text-amber-500" />
                                    <h3 className="font-bold text-amber-800 dark:text-amber-200">Validator Jailed</h3>
                                    <p className="text-sm">Jailed validators do not earn rewards, so no calculation is possible.</p>
                                </div>
                            ) : calculationResult ? (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">You need to stake approximately:</p>
                                    <p className="text-xl sm:text-2xl font-bold text-[#E70559] my-1.5">
                                        {formatNumber(calculationResult.requiredStakeChz, 0)} CHZ
                                    </p>
                                    <p className="text-sm text-zinc-700 dark:text-gray-300">
                                        ({formatCurrency(calculationResult.requiredStakeFiat, selectedCurrency)})
                                    </p>
                                     <p className="text-xs text-zinc-500 dark:text-gray-400 bg-rose-50 dark:bg-[#E70559]/10 border border-rose-200 dark:border-[#E70559]/20 p-2 rounded-lg mt-3 text-center">
                                        Based on {selectedValidator ? (
                                            <>
                                                <span className="font-semibold text-zinc-800 dark:text-white">{selectedValidator.name}'s</span> Net APR of <span className="font-bold text-[#E70559]">{currentApr.toFixed(2)}%</span>.
                                            </>
                                        ) : (
                                            <>
                                                an average Net APR of <span className="font-bold text-[#E70559]">{currentApr.toFixed(2)}%</span>.
                                            </>
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <LucidInfoIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-3" />
                                    <h3 className="font-semibold text-zinc-700 dark:text-gray-300">Enter a Reward Target</h3>
                                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">Fill in the fields above to see your required stake.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};