

import React, { useMemo, useState, useEffect } from 'react';
import { PRESET_AMOUNTS } from '../constants';
import { ChilizIcon } from './icons/ChilizIcon';
import { ErrorDisplay } from './ErrorDisplay';
import { getCurrencySymbol } from '../utils/currency';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidArrowUpDownIcon } from './icons/LucidArrowUpDownIcon';
import { LucidChevronsUpDownIcon } from './icons/LucidChevronsUpDownIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';
import { LucidGlobeIcon } from './icons/LucidGlobeIcon';
import { LucidExternalLinkIcon } from './icons/LucidExternalLinkIcon';
import type { Validator } from '../types';
import { LucidArrowUpIcon } from './icons/LucidArrowUpIcon';
import { LucidArrowDownIcon } from './icons/LucidArrowDownIcon';

interface CalculatorInputProps {
    stakedAmount: string;
    onStakedAmountChange: (value: string) => void;
    onPresetClick: (amount: number) => void;
    chzPrice: string;
    isPriceLoading: boolean;
    priceError: string | null;
    validators: Validator[];
    selectedValidator: Validator | null;
    onValidatorChange: (validatorAddress: string) => void;
    hasInteractedWithValidator: boolean;
    onViewValidatorDetails: (validator: Validator) => void;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
    onRefreshPriceData: () => void;
    selectedCurrency: string;
    isLoadingCurrencies: boolean;
    currenciesError: string | null;
    exchangeRates: Record<string, number> | null;
    ratesError: string | null;
    onShowInfo: (title: string, content: React.ReactNode) => void;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    appLogoUrl: string | null;
    averageApr: number;
    grossApr: number;
    bestValidatorAddress: string | null;
    onOpenSortModal: () => void;
    onOpenCurrencyModal: () => void;
    onOpenValidatorModal: () => void;
    onCycleCurrency: () => void;
    onCycleCurrencyMouseEnter: () => void;
    onCycleCurrencyMouseLeave: () => void;
    totalNetworkStakeChz: number;
    totalStakeChangePercent: number | null;
    displayCycle: string[];
}

const formatPresetAmount = (amount: number): string => {
    if (amount >= 1000000) {
        return `${amount / 1000000}M`;
    }
    if (amount >= 1000) {
        return `${amount / 1000}k`;
    }
    return amount.toString();
};

const formatLargeNumber = (num: number, digits: number = 2): { value: string, suffix: string } => {
    if (num === 0) return { value: '0', suffix: '' };
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log(num) / Math.log(1000));
    const value = (num / Math.pow(1000, i)).toFixed(digits);
    return { value, suffix: suffixes[i] };
};

export const CalculatorInput: React.FC<CalculatorInputProps> = ({ 
    stakedAmount, onStakedAmountChange, onPresetClick, chzPrice, isPriceLoading, priceError, validators, selectedValidator, onValidatorChange, hasInteractedWithValidator, onViewValidatorDetails, isLoading, error, onRefresh, onRefreshPriceData, selectedCurrency, isLoadingCurrencies, currenciesError, exchangeRates, ratesError, onShowInfo, onExternalLinkClick, appLogoUrl, averageApr, grossApr, bestValidatorAddress, onOpenSortModal, onOpenCurrencyModal, onOpenValidatorModal, onCycleCurrency, onCycleCurrencyMouseEnter, onCycleCurrencyMouseLeave, totalNetworkStakeChz, totalStakeChangePercent, displayCycle
}) => {
    
    const numericPrice = useMemo(() => parseFloat(chzPrice), [chzPrice]);
    
    const [isFading, setIsFading] = useState(false);
    const [currentDisplayCycle, setCurrentDisplayCycle] = useState(displayCycle);

    useEffect(() => {
        // Trigger animation only when the prop from parent changes
        if (displayCycle.length > 0 && displayCycle[0] !== currentDisplayCycle[0]) {
            setIsFading(true);
            const fadeOutTimer = setTimeout(() => {
                setCurrentDisplayCycle(displayCycle);
                setIsFading(false);
            }, 200); // This should be the duration of the fade-out transition

            return () => clearTimeout(fadeOutTimer);
        } else if (displayCycle.length > 0 && currentDisplayCycle.length === 0) {
            // Initial load
            setCurrentDisplayCycle(displayCycle);
        }
    }, [displayCycle, currentDisplayCycle]);

    const conversionCurrenciesToRender = useMemo(() => {
        if (!exchangeRates || !currentDisplayCycle) return [];
        // Use the LOCAL state for rendering
        return currentDisplayCycle
            .filter(currency => exchangeRates[currency.toLowerCase()] !== undefined)
            .slice(0, 4);
    }, [exchangeRates, currentDisplayCycle]);
    
    const priceRelatedError = priceError || currenciesError || ratesError;
    
    const getCurrencyButtonDisplayName = () => {
        if (isLoadingCurrencies) return "Loading...";
        if (currenciesError) return "Error";
        return selectedCurrency.toUpperCase();
    };

    const getValidatorButtonDisplayName = () => {
        if (isLoading) return "Loading validators...";
        if (error) return "Error loading data";
        if (selectedValidator) return selectedValidator.name;
        // If user has selected something before, show 'Average'. Otherwise, show placeholder.
        if (hasInteractedWithValidator) return "Average Net APR";
        return "Select Validator";
    };

    const isTopPickSelected = selectedValidator?.address === bestValidatorAddress;

    const formattedTotalStake = formatLargeNumber(totalNetworkStakeChz);

    const validatorInfoContent = (
        <div className="space-y-3 text-sm">
            <p>
                <strong>Net APR</strong> is your potential annual return after a validator's commission fee is deducted. This app uses the latest <strong>individual Gross APR</strong> for each validator, fetched directly from the Chiliz Chain API, to provide the most accurate estimate.
            </p>
            <p>
                The official <a href="https://governance.chilizchain.com/staking" target="_blank" rel="noopener noreferrer" onClick={onExternalLinkClick} className="font-semibold text-[#E70559] hover:underline inline-flex items-center gap-1">Chiliz Governance site<LucidExternalLinkIcon className="w-3.5 h-3.5" /></a> also uses live, per-validator data.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                    <LucidInfoIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-sm">
                    <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-1">Why might the numbers differ slightly?</h4>
                    <p className="text-blue-700 dark:text-blue-300">
                        Staking rewards are highly dynamic. A small difference can occur if one platform's data refreshes moments before the other. Both are considered accurate real-time estimates.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#1D1D1D]/80 border border-gray-200 dark:border-[#333] rounded-xl p-5 backdrop-blur-sm flex flex-col gap-4">
             <div className="flex justify-center items-center gap-1.5 pb-3 border-b border-gray-100 dark:border-zinc-800/50 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-[#E70559]">Total Network Stake:</span>
                {isLoading ? (
                    <span className="animate-pulse w-24 h-4 bg-gray-200 dark:bg-zinc-700 rounded"></span>
                ) : (
                     <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-700 dark:text-gray-300">
                            {formattedTotalStake.value}{formattedTotalStake.suffix} CHZ
                        </span>
                        {totalStakeChangePercent !== null && (
                            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                                totalStakeChangePercent >= 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                            }`}>
                                {totalStakeChangePercent >= 0 ? <LucidArrowUpIcon className="w-3 h-3" /> : <LucidArrowDownIcon className="w-3 h-3" />}
                                <span>{Math.abs(totalStakeChangePercent).toFixed(2)}%</span>
                            </div>
                        )}
                    </div>
                )}
                 <button
                    type="button"
                    onClick={() => onShowInfo(
                        'About Total Network Stake',
                        `This is the total amount of CHZ currently staked across all validators on the Chiliz Chain. The percentage change from the previous day will appear here starting on your second visit. A higher staked amount generally indicates greater network security and community confidence.`
                    )}
                    aria-label="More information about total network stake"
                    className="group p-1 -m-1"
                >
                    <LucidInfoIcon className="w-3.5 h-3.5 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                </button>
            </div>
            
            <div id="tutorial-step-1">
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="block text-sm font-medium text-zinc-700 dark:text-gray-300">
                        Validators & Net APR
                    </span>
                    <button
                        type="button"
                        onClick={() => onShowInfo('About Net APR & Data Accuracy', validatorInfoContent)}
                        aria-label="More information about validators and net APR"
                        className="group p-1 -m-1"
                    >
                        <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help transition-colors group-hover:text-zinc-600 dark:group-hover:text-gray-300" />
                    </button>
                </div>
                
                {error ? (
                    <div className="mt-1">
                        <ErrorDisplay message={error} onRetry={onRefresh} />
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={onOpenValidatorModal}
                            disabled={isLoading || !!error}
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pl-4 pr-10 text-left text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors disabled:bg-gray-200/50 dark:disabled:bg-zinc-800/50 disabled:cursor-not-allowed"
                            aria-haspopup="dialog"
                        >
                             <div className="flex items-center gap-3 min-w-0 h-6">
                                {selectedValidator ? (
                                    <>
                                        {selectedValidator.logo ? (
                                            <img src={selectedValidator.logo} alt={`${selectedValidator.name} logo`} className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex-shrink-0"></div>
                                        )}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`truncate`}>{getValidatorButtonDisplayName()}</span>
                                            {selectedValidator.jailed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex-shrink-0">
                                                    <LucidAlertTriangleIcon className="w-3 h-3" />
                                                    Jailed
                                                </span>
                                            ) : isTopPickSelected && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700/50 flex-shrink-0">
                                                    <LucidSparklesIcon className="w-3 h-3" />
                                                    Top Pick
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span className={hasInteractedWithValidator ? "text-zinc-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                        {getValidatorButtonDisplayName()}
                                    </span>
                                )}
                            </div>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <LucidChevronsUpDownIcon className="h-5 w-5" />
                            </div>
                        </button>
                    </div>
                )}
                
                {!error && (
                     <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                            <div className="text-left">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Net APR</span>
                                <p className="font-bold text-xl text-[#E70559]">
                                    {(selectedValidator || hasInteractedWithValidator) ? (selectedValidator ? (selectedValidator.jailed ? 0 : selectedValidator.apr * (1 - selectedValidator.commission / 100)) : averageApr).toFixed(2) : '--'}%
                                </p>
                            </div>
                            <div className="h-10 w-px bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="text-left">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Gross APR</span>
                                <p className="font-bold text-xl text-zinc-700 dark:text-gray-300">
                                    {(selectedValidator || hasInteractedWithValidator) ? grossApr.toFixed(2) : '--'}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 sm:gap-4">
                            <button
                                onClick={onOpenSortModal}
                                className="flex items-center gap-1 text-xs text-zinc-500 dark:text-gray-400 font-semibold hover:text-[#E70559] dark:hover:text-white transition-colors"
                                aria-label="Sort validator list"
                            >
                                <LucidArrowUpDownIcon className="h-4 w-4" />
                                Sort
                            </button>
                            <button
                                onClick={() => selectedValidator && onViewValidatorDetails(selectedValidator)}
                                disabled={!selectedValidator}
                                className="flex items-center gap-1 text-xs text-zinc-500 dark:text-gray-400 font-semibold hover:text-[#E70559] dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="View validator details"
                            >
                                <LucidInfoIcon className="h-4 w-4" />
                                Details
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div id="tutorial-step-2" className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <label htmlFor="stakedAmount" className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                            Amount of CHZ to Stake
                        </label>
                         <button
                            type="button"
                            onClick={() => onShowInfo(
                                'About Staking Amount',
                                'Enter the total amount of Chiliz (CHZ) tokens you plan to stake. You can use numeric values only.'
                            )}
                            aria-label="More information about staking amount"
                            className="p-1 -m-1"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                        </button>
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            {appLogoUrl ? (
                                <img src={appLogoUrl} alt="App Logo" className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                                <ChilizIcon className="h-5 w-5 text-[#E70559]" />
                            )}
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="stakedAmount"
                            name="stakedAmount"
                            value={stakedAmount}
                            onChange={(e) => onStakedAmountChange(e.target.value)}
                            placeholder="e.g., 10,000"
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-zinc-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((amount) => {
                        const isSelected = parseFloat(stakedAmount.replace(/,/g, '')) === amount;
                        return (
                            <button
                                key={amount}
                                onClick={() => onPresetClick(amount)}
                                className={`py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559] border-2 ${
                                    isSelected
                                        ? 'bg-gray-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold border-[#E70559]'
                                        : 'bg-gray-200 dark:bg-zinc-800/60 text-zinc-700 dark:text-gray-300 font-semibold border-transparent hover:bg-gray-300 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                {formatPresetAmount(amount)}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-3 rounded-r-lg flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                    <LucidAlertTriangleIcon className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Price Volatility Warning:</span> The fiat value of your staked CHZ and potential rewards can fluctuate significantly due to market price changes.
                </p>
            </div>

            <div id="tutorial-step-3">
                 <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                        <label htmlFor="chzPrice" className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                            Current CHZ Price
                        </label>
                        <button
                            type="button"
                            onClick={() => onShowInfo(
                                'About CHZ Price',
                                'The current market price of one CHZ token, sourced from CoinGecko. This is used to estimate the value of your rewards in the selected currency.'
                            )}
                            aria-label="More information about CHZ price"
                            className="p-1 -m-1"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                        </button>
                    </div>
                 </div>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            id="chzPrice"
                            name="chzPrice"
                            value={isPriceLoading ? 'Fetching...' : chzPrice}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pl-4 pr-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors cursor-default"
                            autoComplete="off"
                        />
                    </div>
                     <div className="w-28 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onOpenCurrencyModal}
                            disabled={isLoadingCurrencies || !!currenciesError}
                            className="w-full h-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg py-3 pl-4 pr-10 text-left text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E70559] focus:border-[#E70559] transition-colors disabled:bg-gray-200/50 dark:disabled:bg-zinc-800/50 disabled:cursor-not-allowed uppercase relative"
                        >
                            <span className="truncate">{getCurrencyButtonDisplayName()}</span>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <LucidChevronsUpDownIcon className="h-5 w-5" />
                            </div>
                        </button>
                    </div>
                </div>
                {exchangeRates && !isNaN(numericPrice) && numericPrice > 0 && conversionCurrenciesToRender.length > 0 && (
                    <div
                        onClick={onCycleCurrency}
                        onMouseEnter={onCycleCurrencyMouseEnter}
                        onMouseLeave={onCycleCurrencyMouseLeave}
                        className={`mt-2 text-xs text-zinc-500 dark:text-gray-400 text-center flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 cursor-pointer rounded-md p-1 -m-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-opacity duration-200 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                        title="Tap to cycle through all available currencies"
                    >
                        <span>≈</span>
                        {conversionCurrenciesToRender.map((currency, index) => {
                            const convertedValue = numericPrice * (exchangeRates[currency] || 0);
                            return (
                                <React.Fragment key={currency}>
                                    <span className="whitespace-nowrap">
                                        {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        {' '}
                                        <span className="uppercase font-medium">{currency}</span>
                                    </span>
                                    {index < conversionCurrenciesToRender.length - 1 && <span className="text-gray-400 dark:text-zinc-600">·</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
                 {priceRelatedError && (
                    <div className="mt-2">
                         <ErrorDisplay message={priceRelatedError} onRetry={onRefreshPriceData} />
                    </div>
                 )}
            </div>
        </div>
    );
};