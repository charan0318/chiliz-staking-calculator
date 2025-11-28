
export interface RewardPeriod {
  chz: number;
  fiatValue: number;
}

export interface Rewards {
  daily: RewardPeriod;
  weekly: RewardPeriod;
  monthly: RewardPeriod;
  yearly: RewardPeriod;
}

export interface Validator {
    address: string;
    name: string;
    apr: number;
    commission: number;
    website?: string;
    description?: string;
    achievements?: string[];
    jailed: boolean;
    logo?: string;
    votingPowerChz?: number;
    votingPowerPercent?: number;
    uptime?: number;
    type?: 'Main' | 'Candidate';
    twitterHandle?: string;
}

export interface AprHistoryPoint {
    date: string;
    apr: number; // This represents Net APR
    grossApr: number;
}

// FIX: Add missing PriceHistoryPoint type definition.
/**
 * Represents a point in time for price history.
 * A tuple where the first element is the timestamp (milliseconds) and the second is the price.
 */
export type PriceHistoryPoint = [number, number];

// Fix: Add missing EpochInfo type definition for the EpochDisplay component.
/**
 * Represents information about the current staking epoch.
 */
export interface EpochInfo {
    number: number;
    progressPercent: number;
    startTime: Date;
    endTime: Date;
}

/**
 * Defines the available sorting options for the validator list.
 * '-asc' denotes ascending order, '-desc' denotes descending order.
 */
export type SortOrder = 'netApr-desc' | 'netApr-asc' | 'grossApr-desc' | 'grossApr-asc' | 'votingPower-desc' | 'votingPower-asc' | 'uptime-desc' | 'uptime-asc' | 'commission-asc' | 'commission-desc' | 'name-asc' | 'name-desc';