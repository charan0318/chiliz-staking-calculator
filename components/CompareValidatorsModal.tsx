

import React, { useState, useEffect, useMemo } from 'react';
import type { Validator, AprHistoryPoint } from '../types';
import { fetchValidatorHistory } from '../api/chiliz';
import { ValidatorCompareSelector } from './ValidatorCompareSelector';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidCopyIcon } from './icons/LucidCopyIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidUsersIcon } from './icons/LucidUsersIcon';
import { LucidTrendingUpIcon } from './icons/LucidTrendingUpIcon';
import { LucidSignalIcon } from './icons/LucidSignalIcon';
import { LucidPercentIcon } from './icons/LucidPercentIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';


const COLORS = ['#E70559', '#14B8A6', '#3B82F6', '#F97316', '#8B5CF6'];

type CompareMetric = 'netApr' | 'grossApr' | 'votingPower' | 'commission' | 'uptime';

const compareInfoContent = (
    <div className="space-y-3 text-sm">
        <p>
            This tool allows for a side-by-side comparison of up to 5 Chiliz Chain validators.
        </p>
        <p>
            You can analyze key metrics to help you make an informed decision:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-gray-500 dark:text-gray-400">
            <li><strong>7-Day APR History:</strong> Compare both Net and Gross APR trends. A highlighted value indicates the top performer for that day.</li>
            <li><strong>Total Voting Power:</strong> See the total CHZ staked with each validator.</li>
            <li><strong>Commission Rate:</strong> Compare the fees charged by each validator.</li>
            <li><strong>Uptime:</strong> Check the recent performance and reliability of each validator.</li>
        </ul>
        <p>
            Use the 'Select Validators' button to customize your comparison list.
        </p>
    </div>
);

interface CompareValidatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allValidators: Validator[];
    onShowInfo: (title: string, content: React.ReactNode) => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLargeNumber = (num: number): string => {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
};


export const CompareValidatorsModal: React.FC<CompareValidatorsModalProps> = ({ isOpen, onClose, allValidators, onShowInfo }) => {
    const [selectedValidators, setSelectedValidators] = useState<Validator[]>([]);
    const [historyData, setHistoryData] = useState<Record<string, AprHistoryPoint[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [compareBy, setCompareBy] = useState<CompareMetric>('netApr');

    useEffect(() => {
        if (isOpen && allValidators.length > 0 && selectedValidators.length === 0) {
            const topTwo = allValidators.filter(v => !v.jailed).slice(0, 2);
            setSelectedValidators(topTwo);
        }
    }, [isOpen, allValidators, selectedValidators.length]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if ((compareBy !== 'netApr' && compareBy !== 'grossApr') || selectedValidators.length === 0) {
            setHistoryData({});
            return;
        }

        const fetchAllHistories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const promises = selectedValidators.map(v => {
                    return fetchValidatorHistory(v.name, 7);
                });
                const results = await Promise.all(promises);

                const newData: Record<string, AprHistoryPoint[]> = {};
                selectedValidators.forEach((v, index) => {
                    newData[v.address] = results[index];
                });
                setHistoryData(newData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch history data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllHistories();
    }, [selectedValidators, compareBy]);
    
    const sortedForStaticView = useMemo(() => {
        const copy = [...selectedValidators];
        switch(compareBy) {
            case 'netApr':
                 return copy.sort((a,b) => (b.apr * (1 - b.commission / 100)) - (a.apr * (1 - a.commission / 100)));
            case 'grossApr':
                return copy.sort((a, b) => b.apr - a.apr);
            case 'votingPower':
                return copy.sort((a, b) => (b.votingPowerChz || 0) - (a.votingPowerChz || 0));
            case 'commission':
                return copy.sort((a, b) => a.commission - b.commission);
            case 'uptime':
                return copy.sort((a, b) => (b.uptime || 0) - (a.uptime || 0));
            default:
                return copy;
        }
    }, [selectedValidators, compareBy]);

    const maxValueForBar = useMemo(() => {
        if (selectedValidators.length === 0) return 1;
        switch(compareBy) {
            case 'netApr':
                 return Math.max(...selectedValidators.map(v => v.apr * (1 - v.commission / 100)));
            case 'grossApr':
                return Math.max(...selectedValidators.map(v => v.apr));
            case 'votingPower':
                return Math.max(...selectedValidators.map(v => v.votingPowerChz || 0));
            case 'commission':
                return Math.max(...selectedValidators.map(v => v.commission));
            case 'uptime':
                return 100; // Uptime is a percentage, max is 100
            default:
                return 1;
        }
    }, [selectedValidators, compareBy]);


    const tableFormattedData = useMemo(() => {
        if ((compareBy !== 'netApr' && compareBy !== 'grossApr') || Object.keys(historyData).length === 0 || selectedValidators.length === 0) {
            return { headerDates: [], rows: [], dailyMaxValues: {} };
        }

        const allDates = new Set<string>();
        Object.values(historyData).forEach(history => {
            if (Array.isArray(history)) {
                history.forEach(point => allDates.add(point.date));
            }
        });
        const headerDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const dailyMaxValues: { [date: string]: number } = {};
        headerDates.forEach(date => {
            let maxVal = -1;
            selectedValidators.forEach(v => {
                const history = historyData[v.address];
                const point = history?.find(p => p.date === date);
                if (point) {
                    const value = compareBy === 'netApr' ? point.apr : point.grossApr;
                    if (value > maxVal) {
                        maxVal = value;
                    }
                }
            });
            dailyMaxValues[date] = maxVal;
        });

        const rows = selectedValidators.map(validator => {
            const values = new Map<string, number | null>();
            const validatorHistory = historyData[validator.address];
            headerDates.forEach(date => {
                const point = validatorHistory?.find(p => p.date === date);
                values.set(date, point ? (compareBy === 'netApr' ? point.apr : point.grossApr) : null);
            });
            return { validator, values };
        });

        // Sort rows by the most recent day's value
        rows.sort((a, b) => {
            const latestDate = headerDates[0];
            const valA = a.values.get(latestDate) ?? -1;
            const valB = b.values.get(latestDate) ?? -1;
            return valB - valA;
        });

        return { headerDates, rows, dailyMaxValues };
    }, [historyData, selectedValidators, compareBy]);
    
    const MetricToggle: React.FC = () => {
        const metrics: { key: CompareMetric; label: string; icon: React.ReactNode }[] = [
            { key: 'netApr', label: 'Net APR', icon: <LucidTrendingUpIcon className="w-4 h-4" /> },
            { key: 'grossApr', label: 'Gross APR', icon: <LucidTrendingUpIcon className="w-4 h-4" /> },
            { key: 'votingPower', label: 'Voting Power', icon: <LucidUsersIcon className="w-4 h-4" /> },
            { key: 'commission', label: 'Commission', icon: <LucidPercentIcon className="w-4 h-4" /> },
            { key: 'uptime', label: 'Uptime', icon: <LucidSignalIcon className="w-4 h-4" /> },
        ];

        return (
            <div className="flex-shrink-0 flex items-center p-1 space-x-1 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-wrap justify-center">
                {metrics.map(({ key, label, icon }) => {
                    const isActive = compareBy === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setCompareBy(key)}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full transition-colors text-sm font-semibold focus:outline-none ${
                                isActive 
                                    ? 'bg-white dark:bg-zinc-900/70 shadow-sm text-zinc-800 dark:text-white' 
                                    : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white'
                            }`}
                            aria-pressed={isActive}
                        >
                            {icon}
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderStaticTable = () => {
        const titleMap = {
            grossApr: 'Gross APR',
            votingPower: 'Voting Power',
            commission: 'Commission',
            uptime: 'Uptime',
            netApr: ''
        };

        const renderValue = (v: Validator) => {
            switch(compareBy) {
                case 'grossApr':
                    return `${v.apr.toFixed(2)}%`;
                case 'votingPower':
                    return v.votingPowerChz ? `${formatLargeNumber(v.votingPowerChz)} CHZ` : 'N/A';
                case 'commission':
                    return `${v.commission.toFixed(2)}%`;
                case 'uptime':
                    return v.uptime ? `${v.uptime.toFixed(3)}%` : 'N/A';
                default:
                    return '-';
            }
        };

        const getValueForBar = (v: Validator) => {
             switch(compareBy) {
                case 'grossApr': return v.apr;
                case 'votingPower': return v.votingPowerChz || 0;
                case 'commission': return v.commission;
                case 'uptime': return v.uptime || 0;
                default: return 0;
            }
        };

        return (
             <div className="flex-grow p-1 sm:p-4 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800 text-xs uppercase text-gray-700 dark:text-gray-400 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold text-left">Validator</th>
                            <th scope="col" className="px-4 py-3 font-semibold text-right">{titleMap[compareBy]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedForStaticView.map((validator, index) => (
                            <tr key={validator.address} className="border-b dark:border-zinc-700">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white min-w-[200px] max-w-[200px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div className="w-8 h-8 rounded-full flex-shrink-0">
                                            {validator.logo ? <img src={validator.logo} alt={validator.name} className="w-full h-full rounded-full object-cover"/> : <div className="w-full h-full rounded-full bg-gray-200 dark:bg-zinc-700"></div>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-zinc-800 dark:text-white" title={validator.name}>{validator.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {validator.jailed ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex-shrink-0">
                                                        <LucidAlertTriangleIcon className="w-3 h-3" />
                                                        Jailed
                                                    </span>
                                                ) : validator.type && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 flex-shrink-0">
                                                        {validator.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="font-semibold w-24 text-right text-zinc-900 dark:text-white">{renderValue(validator)}</span>
                                        <div className="w-32 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                    width: `${(getValueForBar(validator) / maxValueForBar) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )
    };

    const renderHistoryTable = () => {
        const { headerDates, rows, dailyMaxValues } = tableFormattedData;

        return (
            <div className="flex-grow p-1 sm:p-4 overflow-auto">
                <table className="w-full min-w-[600px] text-sm text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800 text-xs uppercase text-gray-700 dark:text-gray-400 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold text-left sticky left-0 bg-gray-50 dark:bg-zinc-800 z-20">Validator</th>
                            {headerDates.map(date => (
                                <th key={date} scope="col" className="px-4 py-3 font-semibold text-center whitespace-nowrap">{formatDate(date)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                        {rows.map(({ validator, values }, index) => (
                            <tr key={validator.address} className="border-b dark:border-zinc-700">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-zinc-900 z-10 min-w-[200px] max-w-[200px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div className="w-8 h-8 rounded-full flex-shrink-0">
                                            {validator.logo ? <img src={validator.logo} alt={validator.name} className="w-full h-full rounded-full object-cover"/> : <div className="w-full h-full rounded-full bg-gray-200 dark:bg-zinc-700"></div>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-zinc-800 dark:text-white" title={validator.name}>{validator.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {validator.jailed ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex-shrink-0">
                                                        <LucidAlertTriangleIcon className="w-3 h-3" />
                                                        Jailed
                                                    </span>
                                                ) : validator.type && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 flex-shrink-0">
                                                        {validator.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {headerDates.map(date => {
                                    const value = values.get(date);
                                    const isMax = value !== null && value !== undefined && value === dailyMaxValues[date];
                                    return (
                                        <td key={date} className="px-4 py-3 text-center whitespace-nowrap">
                                            {value !== null && value !== undefined ? (
                                                <span className={`font-semibold rounded-md px-2 py-1 ${isMax ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'text-zinc-700 dark:text-gray-300'}`}>
                                                    {value.toFixed(2)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        const isLoadingData = isLoading && (compareBy === 'netApr' || compareBy === 'grossApr');
        if (isLoadingData) {
            return (
                <div className="flex-grow w-full h-full p-4 animate-pulse">
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-800/50 rounded-lg"></div>
                </div>
            );
        }

        if (error) {
             return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Data</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">{error}</p>
                </div>
            );
        }

        if (selectedValidators.length === 0) {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <LucidUsersIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-zinc-700 dark:text-gray-300">Select Validators to Compare</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">Click the button below to choose up to 5 validators.</p>
                </div>
            );
        }
        
        return (compareBy === 'netApr' || compareBy === 'grossApr') ? renderHistoryTable() : renderStaticTable();
    };
    
    const subtitleMap: { [key in CompareMetric]: string } = {
        netApr: '7-Day History (Net APR)',
        grossApr: '7-Day History (Gross APR)',
        votingPower: 'Total Voting Power',
        commission: 'Commission Rate',
        uptime: 'Uptime Percentage'
    };
    

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="compare-validators-title"
            >
                <div
                    className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-4xl h-[85vh] max-h-[700px] flex flex-col animate-fade-in-up"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-zinc-700/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <LucidCopyIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h2 id="compare-validators-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                                        Compare Validators
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => onShowInfo('About Validator Comparison', compareInfoContent)}
                                        aria-label="More information about comparing validators"
                                        className="group p-1 -m-1"
                                    >
                                        <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {subtitleMap[compareBy]}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0" 
                            aria-label="Close"
                        >
                            <LucidXIcon className="w-6 h-6" />
                        </button>
                    </header>

                    <div className="p-3 border-b border-gray-200 dark:border-zinc-700/50 flex justify-center">
                        <MetricToggle />
                    </div>
                    
                    {renderContent()}
                    
                    <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
                        <button
                            onClick={() => setIsSelectorOpen(true)}
                            className="w-full sm:w-auto sm:float-right py-2 px-5 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors flex items-center justify-center gap-2"
                        >
                             <LucidUsersIcon className="w-4 h-4" />
                            Select Validators ({selectedValidators.length}/5)
                        </button>
                    </footer>
                </div>
            </div>
            <ValidatorCompareSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                allValidators={allValidators}
                currentlySelected={selectedValidators}
                onConfirmSelection={setSelectedValidators}
            />
        </>
    );
};