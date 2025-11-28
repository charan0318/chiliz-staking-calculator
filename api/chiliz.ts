import type { Validator, AprHistoryPoint } from '../types';
import { KNOWN_VALIDATORS, HISTORICAL_SNAPSHOTS_DATA } from '../data/knownValidators';
import { CURRENCY_NAMES } from '../data/currencyNames';

// Caching layer to reduce API calls and avoid rate limiting.
const cache = {
  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }
      const item = JSON.parse(itemStr);
      const now = new Date();
      // if the item is expired, remove it from cache and return null
      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value as T;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  },
  set: (key: string, value: any, ttlSeconds: number = 300) => {
    try {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + ttlSeconds * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Error writing to cache:", error);
    }
  },
};

const SEED_FLAG_KEY = 'chiliz_history_seeded_v2'; // Bump version to allow re-seeding with new logic

const seedHistoricalData = () => {
    try {
        if (localStorage.getItem(SEED_FLAG_KEY)) {
            // Data has already been seeded, do nothing.
            return;
        }

        console.log('Seeding historical APR data with dynamic dates...');
        const today = new Date();
        
        HISTORICAL_SNAPSHOTS_DATA.forEach((snapshot, index) => {
            // Assign dates for the days *prior* to today.
            // The last snapshot in the array is the most recent (yesterday), and so on.
            const date = new Date(today);
            const daysAgo = HISTORICAL_SNAPSHOTS_DATA.length - index;
            date.setDate(today.getDate() - daysAgo);

            const dateStr = date.toISOString().split('T')[0];
            const snapshotKey = `chiliz_apr_snapshot_${dateStr}`;
            
            if (!localStorage.getItem(snapshotKey)) {
                localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
                 console.log(`Seeded data for ${dateStr}`);
            }
        });

        // Set the flag so we don't run this again.
        localStorage.setItem(SEED_FLAG_KEY, 'true');
        console.log('Historical data seeding complete.');

    } catch (e) {
        console.error("Failed to seed historical data:", e);
    }
};

// Run the seeding function once when the module is loaded.
seedHistoricalData();


// --- Chiliz Chain Data Fetching ---

// Use a CORS proxy to prevent browser-based "Failed to fetch" errors.
const PROXY_URL = 'https://corsproxy.io/?';


/**
 * Fetches the list of active validators from the Chiliz Staking API.
 * It now uses the per-validator APR for greater accuracy, enriching this data with
 * static information and falling back to a known list on failure.
 * It also saves a daily snapshot of all validator APRs and total stake to localStorage for historical tracking.
 */
export const fetchValidators = async (): Promise<Validator[]> => {
    const cacheKey = 'chiliz_validators_list_v2'; // Bumped version to invalidate cache on this update
    const cachedValidators = cache.get<Validator[]>(cacheKey);
    if (cachedValidators) {
        console.log('Returning cached validators list.');
        return cachedValidators;
    }

    console.log('Fetching live validator data from Chiliz Staking API...');

    try {
        const targetUrl = 'https://staking-api.chiliz.com/validators?page=1&perPage=50&disabled=false';
        const endpoint = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch validators: ${response.statusText} (${response.status})`);
        }
        const apiResponse = await response.json();

        if (!apiResponse || !Array.isArray(apiResponse.data)) {
            throw new Error('Invalid data format from validators API.');
        }
        
        const totalNetworkStake = apiResponse.data.reduce((acc: number, item: any) => {
            return acc + (parseFloat(item.total_stake) / 1e18);
        }, 0);

        const validators: Validator[] = apiResponse.data.map((item: any): Validator => {
            const knownValidator = KNOWN_VALIDATORS.find(v => v.name.toLowerCase() === item.name.toLowerCase());
            const votingPowerChz = parseFloat(item.total_stake) / 1e18; // Convert from smallest unit ('scarcity')
            const validatorType = item.type ? (item.type === 'main' ? 'Main' : 'Candidate') : knownValidator?.type;

            return {
                address: item.address,
                name: item.name,
                // Use the individual validator's gross APR for precise calculations.
                apr: parseFloat(item.apr) * 100,
                commission: parseFloat(item.commission.rate) * 100,
                website: item.website,
                description: item.description || knownValidator?.description, // Fallback to known data
                achievements: knownValidator?.achievements, // Enrich with static achievement data
                jailed: item.jailed,
                logo: item.logo_url,
                votingPowerChz: votingPowerChz,
                votingPowerPercent: totalNetworkStake > 0 ? (votingPowerChz / totalNetworkStake) * 100 : 0,
                uptime: parseFloat(item.uptime),
                type: validatorType,
                twitterHandle: knownValidator?.twitterHandle,
            };
        });
        
        // --- START OF NEW LOGIC: Save daily snapshot of all validators for true history ---
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const snapshotKey = `chiliz_apr_snapshot_${todayStr}`;

            // The snapshot now includes total stake and individual validator voting power
            const snapshotData = {
                totalStake: totalNetworkStake,
                validators: validators.map(v => ({
                    name: v.name,
                    apr: v.apr,
                    commission: v.commission,
                    netApr: v.apr * (1 - (v.commission / 100)),
                    votingPowerChz: v.votingPowerChz || 0
                }))
            };
            
            localStorage.setItem(snapshotKey, JSON.stringify(snapshotData));
        } catch (e) {
            console.error("Failed to save daily APR snapshot:", e);
        }
        // --- END OF NEW LOGIC ---

        cache.set(cacheKey, validators, 300); // Cache for 5 minutes
        return validators;

    } catch (error) {
        console.warn('Failed to fetch live validator data. This might be a network or CORS issue. Falling back to static list.', error);
        
        // When falling back, still create a snapshot for today using the fallback data
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const snapshotKey = `chiliz_apr_snapshot_${todayStr}`;
            const totalStake = KNOWN_VALIDATORS.reduce((acc, v) => acc + (v.votingPowerChz || 0), 0);
            
            const snapshotData = {
                totalStake,
                validators: KNOWN_VALIDATORS.map(v => ({
                    name: v.name,
                    apr: v.apr,
                    commission: v.commission,
                    netApr: v.apr * (1 - (v.commission / 100)),
                    votingPowerChz: v.votingPowerChz || 0
                }))
            };
            
            localStorage.setItem(snapshotKey, JSON.stringify(snapshotData));
             console.log("Saved snapshot from fallback data.");
        } catch(e) {
            console.error("Failed to save snapshot from fallback data:", e);
        }

        return KNOWN_VALIDATORS; // Fallback to static data instead of throwing an error.
    }
};

// --- CoinGecko and Off-Chain Data Fetching ---

/**
 * A static list of common currencies to use for price fetching.
 * This avoids a separate API call to get all supported currencies, reducing rate limit pressure.
 */
const COMMON_CURRENCIES = [
    'usd', 'eur', 'jpy', 'gbp', 'aud', 'cad', 'chf', 'cny', 'hkd', 'sgd',
    'sek', 'krw', 'nok', 'nzd', 'inr', 'mxn', 'twd', 'zar', 'brl', 'rub',
    'try', 'aed', 'ars', 'clp', 'cop', 'czk', 'dkk', 'huf', 'idr', 'ils',
    'myr', 'php', 'pkr', 'pln', 'sar', 'thb', 'uah', 'vnd', 'ngn'
].sort();

const MOCKED_CHZ_PRICE_USD = 0.081; // A recent, plausible price

const MOCK_EXCHANGE_RATES: Record<string, number> = {
    'usd': 1, 'eur': 0.92, 'jpy': 157, 'gbp': 0.78, 'aud': 1.5, 'cad': 1.37, 'chf': 0.89, 'cny': 7.25,
    'hkd': 7.8, 'sgd': 1.35, 'sek': 10.4, 'krw': 1370, 'nok': 10.5, 'nzd': 1.62, 'inr': 83, 'mxn': 18.3,
    'twd': 32.2, 'zar': 18.5, 'brl': 5.3, 'rub': 89, 'try': 32.3, 'aed': 3.67, 'ars': 900, 'clp': 920,
    'cop': 3900, 'czk': 22.8, 'dkk': 6.8, 'huf': 358, 'idr': 16200, 'ils': 3.7, 'myr': 4.7, 'php': 58.6,
    'pkr': 278, 'pln': 3.9, 'sar': 3.75, 'thb': 36.6, 'uah': 40.5, 'vnd': 25400, 'ngn': 1480
};

/**
 * Generates a mock price data object when the live API is unavailable.
 * Uses a hardcoded USD price and approximate exchange rates.
 */
const getMockPriceData = (): Record<string, number> => {
    console.warn('API lookup failed. Falling back to mocked price data.');
    
    const priceData: Record<string, number> = {};
    const usdPrice = MOCKED_CHZ_PRICE_USD;

    for (const currency of COMMON_CURRENCIES) {
        priceData[currency] = usdPrice * (MOCK_EXCHANGE_RATES[currency] || 1);
    }
    
    return priceData;
};


/**
 * Fetches persistent historical APR data for a given validator (or network average).
 * It reads from daily snapshots of all validator data stored in localStorage.
 * This function no longer generates pseudo-random data.
 */
export const fetchValidatorHistory = async (validatorName: string | null, days: number): Promise<AprHistoryPoint[]> => {
    const history: AprHistoryPoint[] = [];

    // Get all keys from localStorage and filter for our snapshots
    const allKeys = Object.keys(localStorage);
    const snapshotKeys = allKeys
        .filter(key => key.startsWith('chiliz_apr_snapshot_'))
        .sort() // Sort chronologically, oldest first
        .slice(-days); // Get only the last 'days' worth of snapshots

    for (const key of snapshotKeys) {
        const dateStr = key.replace('chiliz_apr_snapshot_', '');
        let netAprForDay: number | null = null;
        let grossAprForDay: number | null = null;

        try {
            const snapshotStr = localStorage.getItem(key);
            if (snapshotStr) {
                const snapshot: { validators: Array<{ name: string; apr: number; netApr: number }> } = JSON.parse(snapshotStr);
                const snapshotValidators = snapshot.validators;
                
                if (validatorName) {
                    // Find the specific validator's data
                    const validatorData = snapshotValidators.find(v => v.name === validatorName);
                    if (validatorData) {
                        netAprForDay = validatorData.netApr;
                        grossAprForDay = validatorData.apr;
                    }
                } else {
                    // Calculate network average for the day
                    const activeValidators = snapshotValidators.filter(v => v.netApr > 0);
                    if (activeValidators.length > 0) {
                        const totalNetApr = activeValidators.reduce((acc, v) => acc + v.netApr, 0);
                        netAprForDay = totalNetApr / activeValidators.length;
                        const totalGrossApr = activeValidators.reduce((acc, v) => acc + v.apr, 0);
                        grossAprForDay = totalGrossApr / activeValidators.length;
                    }
                }
            }
        } catch (e) {
            console.error(`Failed to process snapshot for ${dateStr}:`, e);
        }

        if (netAprForDay !== null && grossAprForDay !== null) {
            history.push({ 
                date: dateStr, 
                apr: parseFloat(netAprForDay.toFixed(2)),
                grossApr: parseFloat(grossAprForDay.toFixed(2))
            });
        }
    }
    
    // The keys are already sorted, so the history should be too.
    return Promise.resolve(history);
};



/**
 * The single source of truth for all price and rate data.
 * Fetches CHZ price against all COMMON_CURRENCIES from CoinGecko in one call and caches the result.
 * If the API call fails, it gracefully falls back to mock data.
 */
const fetchPriceAndRatesData = async (): Promise<Record<string, number>> => {
    const cacheKey = 'chiliz_coingecko_price_data';
    const cachedData = cache.get<Record<string, number>>(cacheKey);
    if (cachedData) {
        console.log('Returning cached CoinGecko price and rates data.');
        return cachedData;
    }

    console.log(`Fetching all price data from CoinGecko via proxy...`);
    const currencies = COMMON_CURRENCIES.join(',');
    const targetUrl = `https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=${currencies}`;
    const endpoint = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.error || `CoinGecko API error: ${response.statusText} (${response.status})`;
             if (response.status === 429) { // Handle rate limiting
                 return getMockPriceData();
            }
            throw new Error(errorMessage);
        }
        
        const prices = data?.chiliz;
        if (!prices) {
            throw new Error('Could not retrieve price data from CoinGecko API response.');
        }
        
        cache.set(cacheKey, prices);
        return prices;
    } catch (error) {
        console.error(`Failed to fetch price and rates data from CoinGecko:`, error);
        // Gracefully fall back to mock data on ANY fetch error
        // instead of throwing an error that breaks the UI.
        return getMockPriceData();
    }
};

/**
 * Returns a static list of supported currency codes and their names.
 */
export const fetchSupportedCurrencies = async (): Promise<Array<{ code: string; name: string }>> => {
    // This now returns the keys from our static mock rates to ensure consistency
    // without an extra API call.
    const currencyCodes = Object.keys(MOCK_EXCHANGE_RATES).sort();
    const currencies = currencyCodes.map(code => ({
        code,
        name: CURRENCY_NAMES[code] || code.toUpperCase(),
    }));
    return Promise.resolve(currencies);
};

/**
 * Returns exchange rates from the base currency to all other available currencies.
 */
export const fetchExchangeRates = async (baseCurrency: string): Promise<Record<string, number>> => {
    const allRates = await fetchPriceAndRatesData();
    const baseRate = allRates[baseCurrency.toLowerCase()];
    
    if (!baseRate) {
        throw new Error(`Base currency '${baseCurrency}' not found.`);
    }

    const exchangeRates: Record<string, number> = {};
    for (const target of Object.keys(allRates)) {
        const targetRate = allRates[target.toLowerCase()];
        if (targetRate) {
            exchangeRates[target.toLowerCase()] = targetRate / baseRate;
        }
    }
    
    return exchangeRates;
};

/**
 * Fetches the current price of CHZ in the specified currency.
 */
export const fetchChzPrice = async (currency: string = 'usd'): Promise<number> => {
    const allPrices = await fetchPriceAndRatesData();
    const price = allPrices[currency.toLowerCase()];
    
    if (price === undefined) {
         throw new Error(`Price data not available for currency '${currency}'.`);
    }
    
    return price;
};
