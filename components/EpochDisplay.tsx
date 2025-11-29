

import React from 'react';
import type { EpochInfo } from '../types';
import { LucidClockIcon } from './icons/LucidClockIcon';
import { LucidCalendarIcon } from './icons/LucidCalendarIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';

interface EpochDisplayProps {
    epochInfo: EpochInfo | null;
    isLoading: boolean;
    error: string | null;
    onShowInfo: (title: string, content: React.ReactNode) => void;
}

const formatDate = (date: Date): string => {
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

export const EpochDisplay: React.FC<EpochDisplayProps> = ({ epochInfo, isLoading, error, onShowInfo }) => {
    
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#1D1D1D]/80 border border-gray-200 dark:border-[#333] rounded-xl p-5 backdrop-blur-sm animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
                <div className="h-2.5 bg-gray-200 dark:bg-zinc-700 rounded-full w-full mb-3"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/5"></div>
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/5"></div>
                </div>
            </div>
        );
    }
    
    // For a non-critical feature, it's better to hide it on error than to show an error message.
    if (error || !epochInfo) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-[#1D1D1D]/80 border border-gray-200 dark:border-[#333] rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-2">
                <h3 className="text-md font-bold text-zinc-900 dark:text-white">
                    Current Epoch <span className="text-[#E70559]">#{epochInfo.number}</span>
                </h3>
                <button
                    type="button"
                    onClick={() => onShowInfo(
                        'About Staking Epochs',
                        'An epoch is a fixed period of time on the Chiliz Chain during which validators are responsible for creating blocks. At the end of each epoch, staking rewards are calculated and distributed to delegators. This app simulates a 24-hour epoch for estimation purposes.'
                    )}
                    aria-label="More information about staking epochs"
                    className="group p-1 -m-1"
                >
                    <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                </button>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 mb-3" title={`${epochInfo.progressPercent.toFixed(1)}% complete`}>
                <div 
                    className="bg-[#E70559] h-2.5 rounded-full transition-width duration-500" 
                    style={{ width: `${epochInfo.progressPercent}%` }}
                    role="progressbar"
                    aria-valuenow={epochInfo.progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 dark:text-gray-400 gap-1.5">
                <div className="flex items-center gap-1.5">
                    <LucidCalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Starts: {formatDate(epochInfo.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <LucidClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Ends: {formatDate(epochInfo.endTime)}</span>
                </div>
            </div>
        </div>
    );
};