
import React, { useMemo, useEffect, useState } from 'react';
import type { Validator, AprHistoryPoint } from '../types';
import { LucidAreaChartIcon } from './icons/LucidAreaChartIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidRefreshCwIcon } from './icons/LucidRefreshCwIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';
import { LucidSignalIcon } from './icons/LucidSignalIcon';
import { LucidUsersIcon } from './icons/LucidUsersIcon';
import { LucidArrowUpIcon } from './icons/LucidArrowUpIcon';
import { LucidArrowDownIcon } from './icons/LucidArrowDownIcon';
import { ChilizIcon } from './icons/ChilizIcon';

interface TrendChartProps {
    aprData: AprHistoryPoint[];
    isLoadingApr: boolean;
    errorApr: string | null;
    selectedValidator: Validator | null;
    averageApr: number;
    isOpen: boolean;
    onClose: () => void;
    appLogoUrl: string | null;
    onShowInfo: (title: string, content: React.ReactNode) => void;
}

interface TrendDataRow {
    date: string;
    apr?: number; // Net APR
    grossApr?: number;
    aprChange?: number;
    aprChangePercent?: number;
}

const statsInfoContent = (
    <div className="space-y-3 text-sm">
        <p><strong>Net APR:</strong> The estimated annual return after the validator's commission fee has been deducted.</p>
        <p><strong>Commission:</strong> The percentage of your earned rewards that the validator keeps as their service fee.</p>
        <p><strong>Voting Power:</strong> This represents the validator's influence on the network, based on the total CHZ staked with them. A higher voting power indicates more community trust.</p>
        <p><strong>Uptime:</strong> The percentage of blocks this validator has successfully signed in a recent window. A higher uptime is crucial for consistent reward generation.</p>
    </div>
);

const DailyChange: React.FC<{ value?: number; unit: string; precision?: number }> = ({ value, unit, precision = 2 }) => {
    if (value === undefined || value === 0 || isNaN(value)) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
    }
    const isPositive = value > 0;
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const Icon = isPositive ? LucidArrowUpIcon : LucidArrowDownIcon;
    const formattedValue = `${Math.abs(value).toFixed(precision)}${unit}`;
    
    return (
        <div className={`flex items-center justify-end gap-1 text-xs ${colorClass}`}>
            <Icon className="w-3 h-3" />
            <span>{formattedValue}</span>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700/50">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-xl font-bold text-zinc-800 dark:text-white mt-1">{value}</p>
    </div>
);

const formatDateForTable = (dateString: string): string => {
    const date = new Date(`${dateString}T00:00:00Z`); // Treat as UTC to avoid timezone issues
    // Format to '26 Jul' and then replace space with hyphen for '26-Jul'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', '-');
};

export const TrendChart: React.FC<TrendChartProps> = ({
    aprData, isLoadingApr, errorApr, selectedValidator, averageApr, isOpen, onClose, appLogoUrl, onShowInfo
}) => {
    const [tableData, setTableData] = useState<TrendDataRow[]>([]);
    // FIX: Add internal state to safely manage the validator prop within the component's lifecycle.
    const [currentValidator, setCurrentValidator] = useState<Validator | null>(null);

    useEffect(() => {
        // This effect syncs the internal state with the prop when the modal is opened.
        // It prevents race conditions on the initial render.
        if (isOpen) {
            setCurrentValidator(selectedValidator);
        }
    }, [isOpen, selectedValidator]);

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

    const mergedData = useMemo(() => {
        if (!aprData || !Array.isArray(aprData)) return [];

        return [...aprData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [aprData]);

    useEffect(() => {
        if (mergedData.length > 0) {
            const reversedData = [...mergedData].reverse();
            const enhancedData = reversedData.map((currentItem, index) => {
                const previousItem = index > 0 ? reversedData[index - 1] : null;

                const aprChange = previousItem && currentItem.apr != null && previousItem.apr != null
                    ? currentItem.apr - previousItem.apr
                    : undefined;

                const aprChangePercent = previousItem?.apr && currentItem.apr && previousItem.apr !== 0
                    ? ((currentItem.apr - previousItem.apr) / previousItem.apr) * 100
                    : undefined;

                return {
                    ...currentItem,
                    aprChange,
                    aprChangePercent,
                };
            });
            setTableData(enhancedData.reverse());
        } else {
            setTableData([]);
        }
    }, [mergedData]);
    
    const isLoading = isLoadingApr;

    if (!isOpen) {
        return null;
    }
    
    // FIX: Use the safe, internal state for display.
    const validatorName = currentValidator?.name || 'Network Average';

    const renderContent = () => {
        if (isLoading && tableData.length === 0) {
            return (
                <div className="flex-grow flex items-center justify-center animate-pulse">
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-800/50 rounded-lg"></div>
                </div>
            );
        }

        if (errorApr) {
            return (
                <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center flex-grow">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Data</h3>
                    {errorApr && <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">APR Data: {errorApr}</p>}
                </div>
            );
        }

        if (tableData.length === 0 && !isLoading) {
             return (
                 <div className="flex-grow flex items-center justify-center text-center">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-zinc-700 dark:text-gray-300">No Historical Data Available</h3>
                </div>
             );
        }

        return (
            <div className="flex-grow overflow-y-auto border dark:border-zinc-700 rounded-lg relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-[#1D1D1D]/70 flex items-center justify-center rounded-lg z-10">
                        <LucidRefreshCwIcon className="w-8 h-8 text-[#E70559] animate-spin" />
                    </div>
                )}
                <table className={`w-full text-sm text-left ${isLoading ? 'opacity-30' : ''}`}>
                    <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800 text-xs uppercase text-gray-700 dark:text-gray-400 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-center">Date</th>
                            <th scope="col" className="px-4 py-3 text-right">Gross APR</th>
                            <th scope="col" className="px-4 py-3 text-right">Net APR</th>
                            <th scope="col" className="px-4 py-3 text-right">Daily Change %</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                        {tableData.map((row) => (
                            <tr key={row.date} className="border-b dark:border-zinc-700 odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap text-center">
                                    {formatDateForTable(row.date)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-gray-300">
                                    {row.grossApr !== undefined ? `${row.grossApr.toFixed(2)}%` : <span className="text-gray-400 dark:text-gray-500">N/A</span>}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {row.apr !== undefined ? (
                                        <div className="font-semibold text-[#E70559]">
                                            {row.apr.toFixed(2)}%
                                            <DailyChange value={row.aprChange} unit=" pts" precision={3}/>
                                        </div>
                                    ) : (
                                            <span className="text-gray-400 dark:text-gray-500">N/A</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <DailyChange value={row.aprChangePercent} unit="%" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trend-chart-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg flex-shrink-0">
                                <LucidAreaChartIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <div>
                                <h2 id="trend-chart-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                                    30-Day APR History
                                </h2>
                                <div className="mt-1 flex items-center gap-2">
                                    {currentValidator?.logo ? (
                                        <img src={currentValidator.logo} alt={`${validatorName} logo`} className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        appLogoUrl ? (
                                            <img src={appLogoUrl} alt="App Logo" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <ChilizIcon className="w-6 h-6" />
                                        )
                                    )}
                                    <p className="text-lg font-bold text-[#E70559]">
                                        {validatorName}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                            aria-label="Close trend chart"
                        >
                            <LucidXIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-grow px-5 pb-5 overflow-hidden flex flex-col min-h-0">
                    {renderContent()}
                </div>
                
                 <div className="px-5 pb-5 border-t border-gray-200 dark:border-zinc-700/50 pt-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-3">
                        <p className="text-base font-bold text-zinc-700 dark:text-gray-300">Validator Snapshot</p>
                        <button
                            type="button"
                            onClick={() => onShowInfo('About Validator Snapshot', statsInfoContent)}
                            aria-label="More information about validator snapshot statistics"
                            className="group p-1 -m-1"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                        </button>
                    </div>
                    {currentValidator ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard 
                                icon={<LucidSparklesIcon className="w-5 h-5 text-green-500" />}
                                label="Net APR"
                                value={`${(currentValidator.apr * (1 - currentValidator.commission / 100)).toFixed(2)}%`}
                            />
                            <StatCard 
                                icon={<LucidInfoIcon className="w-5 h-5 text-blue-500" />}
                                label="Commission"
                                value={`${currentValidator.commission}%`}
                            />
                            <StatCard 
                                icon={<LucidUsersIcon className="w-5 h-5 text-sky-500" />}
                                label="Voting Power"
                                value={currentValidator.votingPowerPercent ? `${currentValidator.votingPowerPercent.toFixed(2)}%` : 'N/A'}
                            />
                            <StatCard 
                                icon={<LucidSignalIcon className="w-5 h-5 text-purple-500" />}
                                label="Uptime"
                                value={currentValidator.uptime ? `${currentValidator.uptime.toFixed(2)}%` : 'N/A'}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <StatCard 
                                icon={<LucidSparklesIcon className="w-5 h-5 text-green-500" />}
                                label="Avg. Net APR"
                                value={`${averageApr.toFixed(2)}%`}
                            />
                             <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-200 dark:border-zinc-700/50 flex items-center justify-center">
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400">Select a validator to see more stats.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
