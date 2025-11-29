

import React, { useState, useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidBarChart3Icon } from './icons/LucidBarChart3Icon';
import { LucidArrowUpIcon } from './icons/LucidArrowUpIcon';
import { LucidArrowDownIcon } from './icons/LucidArrowDownIcon';

interface EnhancedStakeHistoryPoint {
    date: string;
    totalStake: number;
    change?: number;
    changePercent?: number;
}

interface NetworkStakeHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowInfo: (title: string, content: React.ReactNode) => void;
}

const formatDateForTable = (dateString: string): string => {
    const date = new Date(`${dateString}T00:00:00Z`); // Treat as UTC to avoid timezone issues
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const formatLargeNumber = (num: number, useSign: boolean = false): string => {
    if (isNaN(num)) return '-';
    const sign = useSign ? (num > 0 ? '+' : num < 0 ? '-' : '') : '';
    const absNum = Math.abs(num);

    if (absNum >= 1_000_000_000) return `${sign}${(absNum / 1_000_000_000).toFixed(2)}B`;
    if (absNum >= 1_000_000) return `${sign}${(absNum / 1_000_000).toFixed(2)}M`;
    if (absNum >= 1_000) return `${sign}${(absNum / 1_000).toFixed(1)}K`;
    return `${sign}${absNum.toFixed(0)}`;
};

const DailyChangePercent: React.FC<{ value?: number }> = ({ value }) => {
    if (value === undefined || isNaN(value)) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
    }
    const isPositive = value > 0;
    const isNegative = value < 0;
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500';
    const Icon = isPositive ? LucidArrowUpIcon : isNegative ? LucidArrowDownIcon : null;
    const formattedValue = `${Math.abs(value).toFixed(2)}%`;
    
    return (
        <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${colorClass}`}>
            {Icon && <Icon className="w-3 h-3" />}
            <span>{formattedValue}</span>
        </div>
    );
};


export const NetworkStakeHistoryModal: React.FC<NetworkStakeHistoryModalProps> = ({ isOpen, onClose, onShowInfo }) => {
    const [historyData, setHistoryData] = useState<EnhancedStakeHistoryPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        const fetchData = () => {
            setIsLoading(true);
            setError(null);
            try {
                const allKeys = Object.keys(localStorage);
                const snapshotKeys = allKeys
                    .filter(key => key.startsWith('chiliz_apr_snapshot_'))
                    .sort();
                
                if (snapshotKeys.length < 2) {
                    throw new Error("Not enough historical data available to display a trend.");
                }

                const data: EnhancedStakeHistoryPoint[] = snapshotKeys.map(key => {
                    const dateStr = key.replace('chiliz_apr_snapshot_', '');
                    const snapshotStr = localStorage.getItem(key);
                    const snapshot: { totalStake: number } = snapshotStr ? JSON.parse(snapshotStr) : { totalStake: 0 };
                    return { date: dateStr, totalStake: snapshot.totalStake };
                }).filter(item => item.totalStake > 0);

                const enhancedData = data.map((item, index) => {
                    if (index === 0) {
                        return { ...item, change: undefined, changePercent: undefined };
                    }
                    const prevItem = data[index - 1];
                    const change = item.totalStake - prevItem.totalStake;
                    const changePercent = prevItem.totalStake !== 0 ? (change / prevItem.totalStake) * 100 : 0;
                    return { ...item, change, changePercent };
                });

                setHistoryData(enhancedData.reverse()); // Newest first
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load historical data.');
                setHistoryData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    const infoContent = (
        <div className="space-y-3 text-sm">
            <p>
                This table shows the daily history of the <strong>Total Network Stake</strong> on the Chiliz Chain for up to the last 30 days.
            </p>
            <p>
                <strong>Total Network Stake</strong> is the total amount of CHZ currently staked across all validators.
            </p>
            <p>
                <strong>Daily Change</strong> shows the increase or decrease in the total stake compared to the previous day, both as an absolute value and as a percentage.
            </p>
            <p className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
                This data is based on daily snapshots saved in your browser, so a complete history will build up over time as you use the app.
            </p>
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-full flex-grow flex flex-col items-center justify-center animate-pulse p-4">
                     <div className="w-full h-12 bg-gray-200 dark:bg-zinc-800/50 rounded-md mb-2"></div>
                     <div className="w-full h-12 bg-gray-200 dark:bg-zinc-800/50 rounded-md mb-2"></div>
                     <div className="w-full h-12 bg-gray-200 dark:bg-zinc-800/50 rounded-md"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 m-4 flex flex-col items-center justify-center text-center h-full flex-grow">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Data</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">{error}</p>
                </div>
            );
        }

        return (
             <div className="flex-grow overflow-y-auto border-t border-b dark:border-zinc-700/50 relative">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800 text-xs uppercase text-gray-700 dark:text-gray-400 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold text-left">Date</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-right">Total Stake (CHZ)</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-right">Daily Change</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                        {historyData.map((row, index) => (
                            <tr key={row.date} className="border-b dark:border-zinc-700 last:border-b-0">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {formatDateForTable(row.date)}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-gray-300">
                                    {formatLargeNumber(row.totalStake)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {index < historyData.length -1 ? (
                                        <div className="flex flex-col items-end">
                                            <span className="font-semibold text-zinc-800 dark:text-white">
                                                {formatLargeNumber(row.change ?? 0, true)}
                                            </span>
                                            <DailyChangePercent value={row.changePercent} />
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stake-history-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2">
                        <LucidBarChart3Icon className="w-5 h-5 text-gray-400" />
                        <h2 id="stake-history-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                            30-Day Network Stake History
                        </h2>
                        <button
                            type="button"
                            onClick={() => onShowInfo('About Network Stake History', infoContent)}
                            aria-label="More information about network stake history"
                            className="group p-1 -m-1"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                        </button>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                 <div className="flex-grow overflow-hidden flex">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};