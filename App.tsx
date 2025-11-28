



import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CalculatorInput } from './components/CalculatorInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ChilizIcon } from './components/icons/ChilizIcon';
import { TrendChart } from './components/TrendChart';
import type { Rewards, Validator, AprHistoryPoint, SortOrder } from './types';
import { APR as defaultApr, CHILIZ_STAKING_URL } from './constants';
import { fetchValidators, fetchValidatorHistory, fetchChzPrice, fetchSupportedCurrencies, fetchExchangeRates } from './api/chiliz';
import { SettingsMenuModal } from './components/SettingsMenuModal';
import { StakingGuideModal } from './components/StakingGuideModal';
import { ValidatorInfoModal } from './components/ValidatorInfoModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { InfoModal } from './components/InfoModal';
import { Tutorial } from './components/Tutorial';
import { CUSTOM_LOGO_BASE64, CUSTOM_FANTOKENS_LOGO_BASE64, CUSTOM_SOCIOS_LOGO_BASE64 } from './assets/customLogo';
import { DelegationCalculator } from './components/DelegationCalculator';
import { KNOWN_VALIDATORS } from './data/knownValidators';
import { ValidatorSortModal } from './components/ValidatorSortDropdown';
import { CurrencyModal } from './components/CurrencyModal';
import { ValidatorModal } from './components/ValidatorModal';
import { ShareButton } from './components/ShareButton';
import { FaqModal } from './components/FaqModal';
import { CompareValidatorsModal } from './components/CompareValidatorsModal';
import { ExternalLinkWarningModal } from './components/ExternalLinkWarningModal';
import { NetworkStakeHistoryModal } from './components/NetworkStakeHistoryModal';
import { LucidExternalLinkIcon } from './components/icons/LucidExternalLinkIcon';
import { LucidBookOpenIcon } from './components/icons/LucidBookOpenIcon';
import { LucidInfoIcon } from './components/icons/LucidInfoIcon';
import { LucidEyeIcon } from './components/icons/LucidEyeIcon';

// Use a CORS proxy to prevent browser-based "Failed to fetch" errors.
const PROXY_URL = 'https://corsproxy.io/?';

// A custom hook to debounce a value, preventing rapid-fire API calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set debouncedValue to value (passed in) after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // On each re-render, clear the previous timeout to reset the debounce timer
        return () => {
            clearTimeout(handler);
        };
    },
    // Only re-run the effect if value or delay changes
    [value, delay]);

    return debouncedValue;
}

const App: React.FC = () => {
    const [stakedAmount, setStakedAmount] = useState<string>('');
    const [chzPrice, setChzPrice] = useState<string>('0.08');
    const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
    const [validators, setValidators] = useState<Validator[]>([]);
    const [isLoadingValidators, setIsLoadingValidators] = useState<boolean>(true);
    const [validatorError, setValidatorError] = useState<string | null>(null);
    const [bestValidatorAddress, setBestValidatorAddress] = useState<string | null>(null);
    
    const [aprHistoryData, setAprHistoryData] = useState<AprHistoryPoint[]>([]);
    const [isLoadingAprHistory, setIsLoadingAprHistory] = useState<boolean>(true);
    const [aprHistoryError, setAprHistoryError] = useState<string | null>(null);
    
    const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
    const [viewingValidator, setViewingValidator] = useState<Validator | null>(null);
    const [isDelegationCalculatorOpen, setIsDelegationCalculatorOpen] = useState<boolean>(false);
    const [isTrendChartOpen, setIsTrendChartOpen] = useState<boolean>(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
    const [isStakeHistoryOpen, setIsStakeHistoryOpen] = useState<boolean>(false);

    const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
    const [priceError, setPriceError] = useState<string | null>(null);
    
    const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');
    const debouncedSelectedCurrency = useDebounce(selectedCurrency, 500); // 500ms debounce delay
    const [supportedCurrencies, setSupportedCurrencies] = useState<Array<{ code: string; name: string }>>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState<boolean>(true);
    const [currenciesError, setCurrenciesError] = useState<string | null>(null);

    const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
    const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
    const [ratesError, setRatesError] = useState<string | null>(null);
    
    // State for the cycling currency display order
    const [displayCycle, setDisplayCycle] = useState<string[]>([]);
    const [isCurrencyCyclePaused, setIsCurrencyCyclePaused] = useState<boolean>(false);

    const [infoModalContent, setInfoModalContent] = useState<{ title: string, content: React.ReactNode } | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('netApr-desc');

    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    const [tutorialKey, setTutorialKey] = useState(0);

    // Track if user has interacted with validator dropdown to improve placeholder UX
    const [hasInteractedWithValidator, setHasInteractedWithValidator] = useState<boolean>(false);

    // The app logo is now set directly from the developer-defined constant.
    const [customLogo] = useState<string | null>(CUSTOM_LOGO_BASE64 || null);
    const [customFanTokensLogo] = useState<string | null>(CUSTOM_FANTOKENS_LOGO_BASE64 || null);
    const [customSociosLogo] = useState<string | null>(CUSTOM_SOCIOS_LOGO_BASE64 || null);

    // State for modals that were previously inside CalculatorInput
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [isValidatorModalOpen, setIsValidatorModalOpen] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState<boolean>(false);

    // State for the external link warning modal
    const [externalLink, setExternalLink] = useState<string | null>(null);

    // State to hold the global view count
    const [viewCount, setViewCount] = useState<number | null>(null);
    const [viewCountStatus, setViewCountStatus] = useState<'loading' | 'success' | 'error'>('loading');

    // State to hold the daily change in total network stake
    const [totalStakeChangePercent, setTotalStakeChangePercent] = useState<number | null>(null);


    // Effect for fetching and updating the global view counter
    useEffect(() => {
        const namespace = 'chiliz-calc-app';
        const key = 'views';
        // Use api.counterapi.dev as a free alternative to the now-defunct countapi.xyz
        const hitUrl = `${PROXY_URL}${encodeURIComponent(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)}`;
        const getUrl = `${PROXY_URL}${encodeURIComponent(`https://api.counterapi.dev/v1/${namespace}/${key}/`)}`;

        const fetchAndSet = async (url: string): Promise<boolean> => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    // New API returns the count in the 'count' property
                    setViewCount(data.count);
                    return true;
                }
            } catch (error) {
                console.error("View counter API error:", error);
            }
            return false;
        };
    
        const initialLoad = async () => {
            const hitSuccess = await fetchAndSet(hitUrl);
            if (hitSuccess) {
                setViewCountStatus('success');
            } else {
                console.warn('View counter hit failed. Falling back to get.');
                const getSuccess = await fetchAndSet(getUrl);
                if (getSuccess) {
                    setViewCountStatus('success');
                } else {
                    setViewCountStatus('error');
                }
            }
        };
    
        initialLoad();
    
        // Poll every 10 seconds to keep the count updated for the user
        const intervalId = setInterval(() => fetchAndSet(getUrl), 10000);
    
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const hasCompletedTutorial = localStorage.getItem('chiliz-calc-tutorial-completed');
        if (!hasCompletedTutorial) {
            // Set a small delay to ensure the page has rendered and elements are available
            const timer = setTimeout(() => {
                setIsTutorialOpen(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleExternalLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const url = event.currentTarget.href;
        if (url) {
            setExternalLink(url);
        }
    };

    const handleConfirmExternalLink = () => {
        if (externalLink) {
            window.open(externalLink, '_blank', 'noopener,noreferrer');
            setExternalLink(null);
        }
    };

    const handleCloseTutorial = () => {
        localStorage.setItem('chiliz-calc-tutorial-completed', 'true');
        // Clean up progress when tutorial is marked as complete/closed
        localStorage.removeItem('chiliz-calc-tutorial-step');
        setIsTutorialOpen(false);
    };
    
    const handleRestartTutorial = () => {
        // When opening from settings, always restart from the beginning.
        // This is done by clearing any saved step progress and changing the component key to force a remount.
        localStorage.removeItem('chiliz-calc-tutorial-step');
        setTutorialKey(prevKey => prevKey + 1);
        setIsTutorialOpen(true);
    };

    const averageApr = useMemo(() => {
        // Filter out jailed validators and those with 0 APR to get a realistic network average.
        // This prevents inactive candidates from artificially lowering the estimated rewards.
        const activeValidators = validators.filter(v => !v.jailed && v.apr > 0);

        if (activeValidators.length === 0) return defaultApr;

        const totalNetApr = activeValidators.reduce((acc, v) => acc + (v.apr * (1 - (v.commission / 100))), 0);
        return totalNetApr / activeValidators.length;
    }, [validators]);
    
    const averageGrossApr = useMemo(() => {
        const activeValidators = validators.filter(v => !v.jailed && v.apr > 0);
        if (activeValidators.length === 0) return 0;
        const totalGrossApr = activeValidators.reduce((acc, v) => acc + v.apr, 0);
        return totalGrossApr / activeValidators.length;
    }, [validators]);
    
    const apr = selectedValidator
        ? (selectedValidator.jailed ? 0 : selectedValidator.apr * (1 - (selectedValidator.commission / 100)))
        : averageApr;

    const grossApr = selectedValidator
        ? (selectedValidator.jailed ? 0 : selectedValidator.apr)
        : averageGrossApr;

    const findAndSetBestValidator = (validatorList: Validator[]) => {
        const activeValidators = validatorList.filter(v => !v.jailed && v.apr > 0);
        if (activeValidators.length > 0) {
            const topValidator = activeValidators.reduce((best, current) => {
                const bestNetApr = best.apr * (1 - best.commission / 100);
                const currentNetApr = current.apr * (1 - current.commission / 100);
                return currentNetApr > bestNetApr ? current : best;
            });
            setBestValidatorAddress(topValidator.address);
        } else {
            setBestValidatorAddress(null);
        }
    };
    
    const loadValidators = useCallback(async () => {
        setIsLoadingValidators(true);
        setValidatorError(null);
        try {
            const data = await fetchValidators();
            setValidators(data);
            findAndSetBestValidator(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching validators.';
            setValidatorError(`${errorMessage} Displaying a cached list as a fallback.`);
            setValidators(KNOWN_VALIDATORS);
            findAndSetBestValidator(KNOWN_VALIDATORS);
        } finally {
            setIsLoadingValidators(false);
        }
    }, []);

    const syncPrice = useCallback(async () => {
        setIsPriceLoading(true);
        setPriceError(null);
        try {
            const price = await fetchChzPrice(debouncedSelectedCurrency);
            setChzPrice(price.toString());
        } catch (error) {
            setPriceError(error instanceof Error ? error.message : `Could not fetch price in ${debouncedSelectedCurrency.toUpperCase()}.`);
        } finally {
            setIsPriceLoading(false);
        }
    }, [debouncedSelectedCurrency]);

    const loadCurrencies = useCallback(async () => {
        setIsLoadingCurrencies(true);
        setCurrenciesError(null);
        try {
            const data = await fetchSupportedCurrencies();
            setSupportedCurrencies(data);
        } catch (error) {
            setCurrenciesError(error instanceof Error ? error.message : 'An unknown error occurred.');
            setSupportedCurrencies([]);
        } finally {
            setIsLoadingCurrencies(false);
        }
    }, []);

    const loadExchangeRates = useCallback(async () => {
        setIsLoadingRates(true);
        setRatesError(null);
        try {
            const data = await fetchExchangeRates(debouncedSelectedCurrency);
            setExchangeRates(data);
        } catch (error) {
            setRatesError(error instanceof Error ? error.message : 'Could not load conversion rates.');
            setExchangeRates(null);
        } finally {
            setIsLoadingRates(false);
        }
    }, [debouncedSelectedCurrency]);

    const refreshPriceData = useCallback(() => {
        // Reset errors to give immediate feedback that a retry is happening
        setPriceError(null);
        setCurrenciesError(null);
        setRatesError(null);
        syncPrice();
        loadCurrencies();
        loadExchangeRates();
    }, [syncPrice, loadCurrencies, loadExchangeRates]);
    
    useEffect(() => {
        // When the main currency or supported currencies list changes, reset the cycle list.
        if (supportedCurrencies.length > 0) {
            const allCurrencyCodes = supportedCurrencies.map(c => c.code.toLowerCase());
            const otherCurrencies = allCurrencyCodes.filter(c => c !== selectedCurrency.toLowerCase());
            setDisplayCycle(otherCurrencies);
        }
    }, [selectedCurrency, supportedCurrencies]);

    useEffect(() => {
        loadValidators();
        loadCurrencies();
    }, [loadValidators, loadCurrencies]);

    useEffect(() => {
        syncPrice();
        loadExchangeRates();
    }, [syncPrice, loadExchangeRates]);

    useEffect(() => {
        const loadAprHistory = async () => {
            setIsLoadingAprHistory(true);
            setAprHistoryError(null);
            try {
                const days = 30;
                // NEW: fetchValidatorHistory now reads from persistent snapshots and doesn't need a base APR.
                const data = await fetchValidatorHistory(selectedValidator?.name || null, days);
                setAprHistoryData(data);
            } catch (error) {
                setAprHistoryError(error instanceof Error ? error.message : 'Could not load chart data.');
                setAprHistoryData([]);
            } finally {
                setIsLoadingAprHistory(false);
            }
        };

        // Don't try to load history until validators are loaded (to ensure today's snapshot is saved first)
        if (!isLoadingValidators) {
            loadAprHistory();
        }
    }, [selectedValidator, isLoadingValidators]);

    const rewards: Rewards | null = useMemo(() => {
        const amount = parseFloat(stakedAmount.replace(/,/g, ''));
        const price = parseFloat(chzPrice);

        if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0 || (!selectedValidator && !hasInteractedWithValidator)) {
            return null;
        }

        const yearlyChz = amount * (apr / 100);
        const monthlyChz = yearlyChz / 12;
        const weeklyChz = yearlyChz / 52;
        const dailyChz = yearlyChz / 365;

        return {
            daily: { chz: dailyChz, fiatValue: dailyChz * price },
            weekly: { chz: weeklyChz, fiatValue: weeklyChz * price },
            monthly: { chz: monthlyChz, fiatValue: monthlyChz * price },
            yearly: { chz: yearlyChz, fiatValue: yearlyChz * price },
        };
    }, [stakedAmount, chzPrice, apr, selectedValidator, hasInteractedWithValidator]);

    const handleAmountChange = (value: string) => {
        if (value === '') {
            setStakedAmount('');
            return;
        }
        
        const sanitizedValue = value.replace(/,/g, '');
        if (!/^\d*\.?\d*$/.test(sanitizedValue)) {
            return; // Invalid input, do nothing.
        }

        const parts = sanitizedValue.split('.');
        const integerPartString = parts[0];
        const decimalPartString = parts[1];

        let formattedInteger = '';
        if (integerPartString) {
            formattedInteger = Number(integerPartString).toLocaleString('en-US');
        }

        let finalValue = formattedInteger;
        if (decimalPartString !== undefined) {
            finalValue = `${formattedInteger}.${decimalPartString}`;
        }

        // Handle typing a decimal point at the end
        if (sanitizedValue.endsWith('.') && !finalValue.includes('.')) {
            finalValue = finalValue ? `${finalValue}.` : '0.';
        }
        
        setStakedAmount(finalValue);
    };
    
    const handlePresetClick = (amount: number) => {
        // If the clicked preset amount is already the current staked amount, clear it.
        // Otherwise, set the staked amount to the preset value.
        const currentAmount = parseFloat(stakedAmount.replace(/,/g, ''));
        if (currentAmount === amount) {
            setStakedAmount('');
            // When deselecting, blur the currently focused element to remove the focus ring.
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        } else {
            setStakedAmount(amount.toLocaleString('en-US'));
        }
    };

    const handleValidatorChange = (validatorAddress: string) => {
        setHasInteractedWithValidator(true); // Mark interaction
        if (validatorAddress === "") {
            setSelectedValidator(null);
        } else {
            const validator = validators.find(v => v.address === validatorAddress);
            setSelectedValidator(validator || null);
        }
    };
    
    const handleCurrencyChange = (currency: string) => {
        setSelectedCurrency(currency);
    };

    // This now only cycles the display list, not the main selected currency.
    const handleCycleCurrency = useCallback(() => {
        setDisplayCycle(prevCycle => {
            if (prevCycle.length < 2) return prevCycle;
            const newCycle = [...prevCycle];
            const first = newCycle.shift();
            if (first) {
                newCycle.push(first);
            }
            return newCycle;
        });
    }, []);
    
    // Effect for auto-cycling currencies, paused on hover.
    useEffect(() => {
        if (isCurrencyCyclePaused || !supportedCurrencies || supportedCurrencies.length <= 4) {
            return;
        }

        const intervalId = setInterval(() => {
            handleCycleCurrency();
        }, 5000); // Cycle every 5 seconds

        return () => clearInterval(intervalId);
    }, [isCurrencyCyclePaused, handleCycleCurrency, supportedCurrencies.length]);

    const numericPrice = parseFloat(chzPrice) || 0;

    const sortedValidators = useMemo(() => {
        const validatorsCopy = [...validators];

        validatorsCopy.sort((a, b) => {
            const netAprA = a.apr * (1 - a.commission / 100);
            const netAprB = b.apr * (1 - b.commission / 100);

            switch (sortOrder) {
                case 'netApr-asc':
                    if (netAprA !== netAprB) {
                        return netAprA - netAprB;
                    }
                    return (b.votingPowerChz || 0) - (a.votingPowerChz || 0); // Tie-breaker
                case 'grossApr-desc':
                    if (b.apr !== a.apr) {
                        return b.apr - a.apr;
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'grossApr-asc':
                    if (a.apr !== b.apr) {
                        return a.apr - b.apr;
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'votingPower-desc':
                    if ((b.votingPowerChz || 0) !== (a.votingPowerChz || 0)) {
                        return (b.votingPowerChz || 0) - (a.votingPowerChz || 0);
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'votingPower-asc':
                     if ((a.votingPowerChz || 0) !== (b.votingPowerChz || 0)) {
                        return (a.votingPowerChz || 0) - (b.votingPowerChz || 0);
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'uptime-desc':
                    if ((b.uptime || 0) !== (a.uptime || 0)) {
                        return (b.uptime || 0) - (a.uptime || 0);
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'uptime-asc':
                    if ((a.uptime || 0) !== (b.uptime || 0)) {
                        return (a.uptime || 0) - (b.uptime || 0);
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'commission-asc':
                    if (a.commission !== b.commission) {
                        return a.commission - b.commission;
                    }
                    return netAprB - netAprA; // Tie-breaker
                case 'commission-desc':
                     if (a.commission !== b.commission) {
                        return b.commission - a.commission;
                    }
                    return netAprB - netAprA; // Tie-breaker
                
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                
                case 'name-desc':
                    return b.name.localeCompare(a.name);

                case 'netApr-desc':
                default:
                    // Sort by Net APR descending, with Voting Power as a tie-breaker.
                    if (netAprB !== netAprA) {
                        return netAprB - netAprA;
                    }
                    return (b.votingPowerChz || 0) - (a.votingPowerChz || 0);
            }
        });

        return validatorsCopy;
    }, [validators, sortOrder]);

    const totalNetworkStakeChz = useMemo(() => {
        if (validators.length === 0) {
            return 0;
        }
        return validators.reduce((acc, v) => acc + (v.votingPowerChz || 0), 0);
    }, [validators]);
    
    // Effect for calculating daily change in total network stake
    useEffect(() => {
        if (totalNetworkStakeChz <= 0) {
            setTotalStakeChangePercent(null);
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(new Date().getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const snapshotKey = `chiliz_apr_snapshot_${yesterdayStr}`;
        
        try {
            const yesterdayDataStr = localStorage.getItem(snapshotKey);
            if (!yesterdayDataStr) {
                setTotalStakeChangePercent(null);
                return;
            }
            const yesterdayData = JSON.parse(yesterdayDataStr);
            const previousValue = yesterdayData.totalStake;

            if (previousValue > 0) {
                const change = ((totalNetworkStakeChz - previousValue) / previousValue) * 100;
                setTotalStakeChangePercent(change);
            } else {
                setTotalStakeChangePercent(null);
            }
        } catch (e) {
            console.error("Failed to process daily stake change:", e);
            setTotalStakeChangePercent(null);
        }

    }, [totalNetworkStakeChz]);

    return (
        <div className="relative min-h-screen text-zinc-800 dark:text-white bg-gray-50 dark:bg-[radial-gradient(101.8%_101.8%_at_50%_-1.8%,_rgb(29,29,29)_0%,_rgb(0,0,0)_100%)] font-sans flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 overflow-x-hidden">
            <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E70559]/10 text-[#E70559] border border-[#E70559]/20">
                    Beta
                </span>
            </div>
            <main className="w-full max-w-md mx-auto flex flex-col gap-6">
                <header className="relative text-center flex flex-col items-center gap-3">
                    <div className="absolute top-0 right-0" id="tutorial-step-settings">
                        <SettingsMenuModal 
                            onOpenTutorial={handleRestartTutorial}
                            onOpenStakingGuide={() => setIsGuideOpen(true)}
                            onOpenDelegationCalculator={() => setIsDelegationCalculatorOpen(true)}
                            onOpenTrendChart={() => setIsTrendChartOpen(true)}
                            onOpenCompareValidators={() => setIsCompareModalOpen(true)}
                            onOpenNetworkStakeHistory={() => setIsStakeHistoryOpen(true)}
                            onOpenFaq={() => setIsFaqOpen(true)}
                            onExternalLinkClick={handleExternalLinkClick}
                            appLogoUrl={customLogo}
                            fanTokensLogoUrl={customFanTokensLogo}
                            sociosLogoUrl={customSociosLogo}
                        />
                    </div>
                    
                    <div className="w-16 h-16">
                        {customLogo ? (
                            <img src={customLogo} alt="Custom App Logo" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <ChilizIcon className="w-full h-full rounded-full" />
                        )}
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-bold">Chiliz Staking Calculator</h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Estimate your potential earnings from staking CHZ.</p>
                </header>

                <CalculatorInput 
                    stakedAmount={stakedAmount}
                    onStakedAmountChange={handleAmountChange}
                    onPresetClick={handlePresetClick}
                    chzPrice={chzPrice}
                    isPriceLoading={isPriceLoading}
                    priceError={priceError}
                    validators={validators}
                    selectedValidator={selectedValidator}
                    onValidatorChange={handleValidatorChange}
                    hasInteractedWithValidator={hasInteractedWithValidator}
                    onViewValidatorDetails={setViewingValidator}
                    isLoading={isLoadingValidators}
                    error={validatorError}
                    onRefresh={loadValidators}
                    onRefreshPriceData={refreshPriceData}
                    selectedCurrency={selectedCurrency}
                    isLoadingCurrencies={isLoadingCurrencies}
                    currenciesError={currenciesError}
                    exchangeRates={exchangeRates}
                    ratesError={ratesError}
                    onShowInfo={(title, content) => setInfoModalContent({ title, content })}
                    onExternalLinkClick={handleExternalLinkClick}
                    appLogoUrl={customLogo}
                    averageApr={averageApr}
                    grossApr={grossApr}
                    bestValidatorAddress={bestValidatorAddress}
                    onOpenSortModal={() => setIsSortModalOpen(true)}
                    onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
                    onOpenValidatorModal={() => setIsValidatorModalOpen(true)}
                    displayCycle={displayCycle}
                    onCycleCurrency={handleCycleCurrency}
                    onCycleCurrencyMouseEnter={() => setIsCurrencyCyclePaused(true)}
                    onCycleCurrencyMouseLeave={() => setIsCurrencyCyclePaused(false)}
                    totalNetworkStakeChz={totalNetworkStakeChz}
                    totalStakeChangePercent={totalStakeChangePercent}
                />
                
                <div id="tutorial-step-4">
                    <ResultsDisplay 
                        rewards={rewards}
                        stakedAmount={parseFloat(stakedAmount.replace(/,/g, '')) || 0}
                        chzPrice={numericPrice}
                        selectedCurrency={selectedCurrency}
                    />
                    {rewards && (
                        <div className="mt-4 flex flex-col gap-3">
                            <a
                                href={CHILIZ_STAKING_URL}
                                onClick={handleExternalLinkClick}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                            >
                                {selectedValidator ? `Stake with ${selectedValidator.name}` : 'Stake on Chiliz Chain'}
                                <LucidExternalLinkIcon className="w-4 h-4" />
                            </a>
                            <ShareButton 
                                rewards={rewards} 
                                stakedAmount={parseFloat(stakedAmount.replace(/,/g, '')) || 0} 
                                onExternalLinkClick={handleExternalLinkClick}
                                selectedValidator={selectedValidator}
                                currentApr={apr}
                                grossApr={grossApr}
                            />
                        </div>
                    )}
                </div>

                <div id="tutorial-step-guide" className="bg-white dark:bg-[#1D1D1D]/80 border border-gray-200 dark:border-[#333] rounded-xl p-5 backdrop-blur-sm text-center">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">New to Staking?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Learn the basics, understand the risks, and follow our step-by-step guide to get started.</p>
                    <button 
                        onClick={() => setIsGuideOpen(true)}
                        className="inline-flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-[#E70559] bg-[#E70559]/10 rounded-lg hover:bg-[#E70559]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                    >
                        <LucidBookOpenIcon className="w-4 h-4" />
                        Open Staking Guide
                    </button>
                </div>

                <footer className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4 space-y-2">
                    <p className="px-4">
                        {
                            (selectedValidator || hasInteractedWithValidator)
                                ? `Calculations are estimates based on a net APR of ${apr.toFixed(2)}% (from ${grossApr.toFixed(2)}% Gross APR). Actual rewards may vary.`
                                : `Calculations are estimates. Actual rewards may vary.`
                        }
                        <button 
                            onClick={() => setIsDisclaimerOpen(true)}
                            className="inline-flex align-middle ml-1"
                            aria-label="View disclaimer details"
                        >
                            <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                        </button>
                    </p>
                    <p>Built for Community, by the Community ❤️</p>
                    <p>
                        <a 
                            href="https://x.com/ch04niverse" 
                            onClick={handleExternalLinkClick}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-[#E70559] hover:underline"
                        >
                            ch04niverse
                        </a>
                    </p>
                    <p id="tutorial-step-view-counter" className="flex items-center justify-center gap-1.5 opacity-75 min-h-[1rem]" title="Total app views by the community">
                        {viewCountStatus === 'loading' && <span className="animate-pulse w-10 h-4 bg-gray-200 dark:bg-zinc-700 rounded"></span>}
                        {viewCountStatus === 'success' && viewCount !== null && (
                            <>
                                <LucidEyeIcon className="w-4 h-4" />
                                <span>{viewCount.toLocaleString()}</span>
                            </>
                        )}
                    </p>
                    <p>&copy; 2025 Chiliz Staking Calculator. Not affiliated with Chiliz.</p>
                </footer>
            </main>

            <StakingGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} onExternalLinkClick={handleExternalLinkClick} />
            <ValidatorInfoModal 
                validator={viewingValidator} 
                onClose={() => setViewingValidator(null)} 
                isTopPick={!!(viewingValidator && viewingValidator.address === bestValidatorAddress)}
                appLogoUrl={customLogo}
                onExternalLinkClick={handleExternalLinkClick}
            />
            <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
            <InfoModal 
                isOpen={!!infoModalContent} 
                onClose={() => setInfoModalContent(null)}
                title={infoModalContent?.title || ''}
            >
                {infoModalContent?.content}
            </InfoModal>
             <DelegationCalculator
                isOpen={isDelegationCalculatorOpen}
                onClose={() => setIsDelegationCalculatorOpen(false)}
                averageApr={averageApr}
                chzPrice={numericPrice}
                selectedCurrency={selectedCurrency}
                selectedValidator={selectedValidator}
                onShowInfo={(title, content) => setInfoModalContent({ title, content })}
                appLogoUrl={customLogo}
            />
            <TrendChart
                aprData={aprHistoryData}
                isLoadingApr={isLoadingAprHistory}
                errorApr={aprHistoryError}
                selectedValidator={selectedValidator}
                averageApr={averageApr}
                isOpen={isTrendChartOpen}
                onClose={() => setIsTrendChartOpen(false)}
                appLogoUrl={customLogo}
                onShowInfo={(title, content) => setInfoModalContent({ title, content })}
            />
            <ValidatorSortModal 
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
            />
             <CurrencyModal
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                supportedCurrencies={supportedCurrencies}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={handleCurrencyChange}
                isLoading={isLoadingCurrencies}
                error={currenciesError}
            />
            <ValidatorModal
                isOpen={isValidatorModalOpen}
                onClose={() => setIsValidatorModalOpen(false)}
                validators={sortedValidators}
                selectedValidator={selectedValidator}
                onValidatorChange={handleValidatorChange}
                averageApr={averageApr}
                bestValidatorAddress={bestValidatorAddress}
                hasInteractedWithValidator={hasInteractedWithValidator}
                appLogoUrl={customLogo}
            />
            <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
            <CompareValidatorsModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                allValidators={sortedValidators}
                onShowInfo={(title, content) => setInfoModalContent({ title, content })}
            />
            <NetworkStakeHistoryModal 
                isOpen={isStakeHistoryOpen} 
                onClose={() => setIsStakeHistoryOpen(false)}
                onShowInfo={(title, content) => setInfoModalContent({ title, content })}
            />
            <ExternalLinkWarningModal
                isOpen={!!externalLink}
                onClose={() => setExternalLink(null)}
                onConfirm={handleConfirmExternalLink}
                url={externalLink || ''}
            />
            <Tutorial key={tutorialKey} isOpen={isTutorialOpen} onClose={handleCloseTutorial} />
        </div>
    );
};

export default App;