


import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import type { PriceHistoryPoint } from '../types';
import { useTheme } from '../context/ThemeContext';
import { LucidTrendingUpIcon } from './icons/LucidTrendingUpIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidXIcon } from './icons/LucidXIcon';

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
    isLoading: boolean;
    error: string | null;
    currency: string;
    isOpen: boolean;
    onClose: () => void;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (amount: number, currency: string): string => {
    try {
        return amount.toLocaleString(undefined, {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        });
    } catch (e) {
        return `${amount.toFixed(4)} ${currency.toUpperCase()}`;
    }
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 p-3 rounded-md shadow-lg text-sm">
                <p className="label text-gray-500 dark:text-gray-400 font-medium">{`${formatDate(label)}`}</p>
                <p className="intro font-semibold text-zinc-800 dark:text-white mt-1">{formatCurrency(payload[0].value, currency)}</p>
            </div>
        );
    }
    return null;
};

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, isLoading, error, currency, isOpen, onClose }) => {
    const { isDarkMode } = useTheme();

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

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-full flex-grow flex flex-col items-center justify-center animate-pulse">
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-800/50 rounded-md"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-gray-100 dark:bg-[#1D1D1D]/50 border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 flex flex-col items-center justify-center text-center h-full flex-grow">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-red-500">Error Loading Chart</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="h-full flex-grow flex flex-col items-center justify-center text-center">
                    <LucidInfoIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="font-semibold text-zinc-700 dark:text-gray-300">No Price Data Available</h3>
                    <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">
                        Historical price data could not be retrieved for {currency.toUpperCase()}.
                    </p>
                </div>
            );
        }

        const chartData = data.map(([timestamp, price]) => ({ timestamp, price }));

        return (
            <div className="w-full h-full flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: -10,
                            bottom: 40,
                        }}
                    >
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E70559" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#E70559" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#e5e7eb"} />
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatDate} 
                            tick={{ fill: isDarkMode ? '#888' : '#6b7280', fontSize: 12 }} 
                            stroke={isDarkMode ? "#555" : "#d1d5db"}
                            dy={10}
                            interval={Math.floor(data.length / 5)}
                        />
                        <YAxis 
                            tickFormatter={(value) => formatCurrency(value, currency)}
                            tick={{ fill: isDarkMode ? '#888' : '#6b7280', fontSize: 12 }} 
                            stroke={isDarkMode ? "#555" : "#d1d5db"}
                            domain={['dataMin * 0.95', 'dataMax * 1.05']}
                            orientation="left"
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: '#E70559', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Area type="monotone" dataKey="price" stroke="#E70559" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" activeDot={{ r: 6, fill: '#E70559', stroke: isDarkMode ? '#000' : '#fff', strokeWidth: 2 }} />
                        <Brush
                            dataKey="timestamp"
                            height={30}
                            stroke="#E70559"
                            fill={isDarkMode ? '#333333' : '#f3f4f6'}
                            tickFormatter={formatDate}
                            travellerWidth={10}
                             y={320} // Position brush at the bottom
                        />
                    </AreaChart>
                </ResponsiveContainer>
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
            aria-labelledby="price-chart-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-3xl h-[600px] max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2">
                        <LucidTrendingUpIcon className="w-5 h-5 text-gray-400" />
                        <h2 id="price-chart-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                            30-Day CHZ Price Trend <span className="uppercase text-gray-400 text-base">({currency})</span>
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close price chart"
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