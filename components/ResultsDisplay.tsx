

import React, { useState, useEffect, useRef } from 'react';
import type { Rewards, RewardPeriod } from '../types';
import { LucidInfoIcon } from './icons/LucidInfoIcon';

interface ResultsDisplayProps {
    rewards: Rewards | null;
    stakedAmount: number;
    chzPrice: number;
    selectedCurrency: string;
}

const formatNumber = (num: number, maximumFractionDigits: number = 2, minimumFractionDigits?: number): string => {
    return num.toLocaleString('en-US', {
        maximumFractionDigits,
        minimumFractionDigits: minimumFractionDigits || maximumFractionDigits,
    });
};

const formatCurrency = (amount: number, currency: string): string => {
    try {
        return amount.toLocaleString(undefined, { // 'undefined' uses the browser's default locale
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } catch (e) {
        // Fallback for invalid currency codes
        console.error(`Invalid currency code: ${currency}`, e);
        return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
    }
};

// Custom hook for animating number changes smoothly from a previous value to a new one.
const useAnimatedValue = (endValue: number, duration = 400) => {
    const [currentValue, setCurrentValue] = useState(endValue);
    const valueRef = useRef(endValue);
    // FIX: Initialize useRef with a value (null) as it expects one argument.
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = valueRef.current;

        // No need to animate if the value hasn't changed meaningfully
        if (Math.abs(startValue - endValue) < 0.0001) {
            setCurrentValue(endValue);
            return;
        }

        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out quad function for a smoother slowdown effect
            const easePercentage = percentage * (2 - percentage);

            const nextValue = startValue + (endValue - startValue) * easePercentage;
            setCurrentValue(nextValue);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentValue(endValue);
                valueRef.current = endValue;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            // On cleanup/re-run, update the ref to the latest target value
            // This ensures the next animation starts from the correct point
            valueRef.current = endValue;
        };
    }, [endValue, duration]);

    return currentValue;
};


const AnimatedRewardRow: React.FC<{ label: string; period: RewardPeriod; currency: string }> = ({ label, period, currency }) => {
    const animatedChz = useAnimatedValue(period.chz);
    const animatedFiat = useAnimatedValue(period.fiatValue);
    
    return (
        <div className="flex justify-between items-baseline py-3 border-b border-gray-200/80 dark:border-zinc-700/50 last:border-b-0">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <div className="text-right">
                <p className="font-semibold text-zinc-800 dark:text-white">{formatNumber(animatedChz, 4)} CHZ</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(animatedFiat, currency)}</p>
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ rewards, stakedAmount, chzPrice, selectedCurrency }) => {
    if (!rewards) {
        return (
            <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
                <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                <h3 className="font-semibold text-zinc-700 dark:text-gray-300">Awaiting Input</h3>
                <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">Enter a staking amount and select a validator to see your potential rewards.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1D1D1D]/80 border border-gray-200 dark:border-[#333] rounded-xl p-5 backdrop-blur-sm">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Estimated Rewards</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    For <span className="font-bold text-[#E70559]">{formatNumber(stakedAmount, 0)} CHZ</span> staked
                    <span className="block sm:inline"> (<span className="text-zinc-700 dark:text-gray-300">{formatCurrency(stakedAmount * chzPrice, selectedCurrency)}</span>)</span>
                </p>
            </div>
            <div className="flex flex-col">
                <AnimatedRewardRow label="Daily" period={rewards.daily} currency={selectedCurrency} />
                <AnimatedRewardRow label="Weekly" period={rewards.weekly} currency={selectedCurrency} />
                <AnimatedRewardRow label="Monthly" period={rewards.monthly} currency={selectedCurrency} />
                <AnimatedRewardRow label="Yearly" period={rewards.yearly} currency={selectedCurrency} />
            </div>
        </div>
    );
};
