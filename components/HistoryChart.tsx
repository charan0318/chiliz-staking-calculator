


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { AprHistoryPoint } from '../types';
import { useTheme } from '../context/ThemeContext';
import { LucidLineChartIcon } from './icons/LucidLineChartIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidRefreshCwIcon } from './icons/LucidRefreshCwIcon';
import { LucidXIcon } from './icons/LucidXIcon';

interface HistoryChartProps {
    data: AprHistoryPoint[];
    isLoading: boolean;
    error: string | null;
    validatorName: string;
    isOpen: boolean;
    onClose: () => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, validatorName }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 p-3 rounded-md shadow-lg text-sm">
                <p className="label text-gray-500 dark:text-gray-400 font-medium">{`${formatDate(label)}`}</p>
                <p className="text-zinc-700 dark:text-gray-300 my-1">{validatorName}</p>
                <p className="intro font-semibold text-zinc-800 dark:text-white">{`APR: ${payload[0].value.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};


export const HistoryChart: React.FC<HistoryChartProps> = ({ data, isLoading, error, validatorName, isOpen, onClose }) => {
    const { isDarkMode } = useTheme();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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

    useEffect(() => {
        if (!isLoading && data.length > 0) {
            setIsInitialLoad(false);
        }
    }, [isLoading, data]);
    
    const isRefreshing = isLoading && !isInitialLoad;

    const renderContent = () => {
        if (isLoading && isInitialLoad) {
            return (
                <div className="h-80 flex-grow flex flex-col items-center justify-center animate-pulse">
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-800/50 rounded-md"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center h-80 flex-grow">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Chart</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">{error}</p>
                </div>
            );
        }

        if (data.length === 0 && !isLoading) {
            return null;
        }

        return (
            <div className="relative w-full flex-grow">
                {isRefreshing && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-[#1D1D1D]/70 flex items-center justify-center rounded-xl z-10">
                        <LucidRefreshCwIcon className="w-8 h-8 text-[#E70559] animate-spin" />
                    </div>
                )}
                <div className={`transition-opacity duration-300 w-full h-full ${isRefreshing ? 'opacity-30' : 'opacity-100'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 20,
                                left: -10,
                                bottom: 40, // Increased bottom margin for Brush
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#e5e7eb"} />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate} 
                                tick={{ fill: isDarkMode ? '#888' : '#6b7280', fontSize: 12 }} 
                                stroke={isDarkMode ? "#555" : "#d1d5db"}
                                dy={10}
                                interval={Math.floor(data.length / 5)}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${value.toFixed(2)}%`}
                                tick={{ fill: isDarkMode ? '#888' : '#6b7280', fontSize: 12 }} 
                                stroke={isDarkMode ? "#555" : "#d1d5db"}
                                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                            />
                            <Tooltip content={<CustomTooltip validatorName={validatorName} />} cursor={{ stroke: '#E70559', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Line type="monotone" dataKey="apr" stroke="#E70559" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#E70559', stroke: isDarkMode ? '#000' : '#fff', strokeWidth: 2 }} />
                            <Brush 
                                dataKey="date"
                                height={30}
                                stroke="#E70559"
                                fill={isDarkMode ? '#333333' : '#f3f4f6'}
                                tickFormatter={formatDate}
                                travellerWidth={10}
                                y={320} // Position brush at the bottom
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
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
            aria-labelledby="apr-chart-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-3xl h-[600px] max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                 <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 min-w-0">
                        <LucidLineChartIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <h2 id="apr-chart-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                            30-Day APR Trend: <span className="text-[#E70559]">{validatorName}</span>
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors ml-2 flex-shrink-0"
                        aria-label="Close APR chart"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-grow p-5 overflow-hidden flex">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};