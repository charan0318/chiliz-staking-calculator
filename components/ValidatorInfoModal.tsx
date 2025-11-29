

import React, { useEffect, useState } from 'react';
import type { Validator } from '../types';
import { CHILIZ_STAKING_URL } from '../constants';
import { ChilizIcon } from './icons/ChilizIcon';
import { InfoModal } from './InfoModal';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidExternalLinkIcon } from './icons/LucidExternalLinkIcon';
import { LucidGlobeIcon } from './icons/LucidGlobeIcon';
import { LucidBadgeCheckIcon } from './icons/LucidBadgeCheckIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';

interface ValidatorInfoModalProps {
    validator: Validator | null;
    onClose: () => void;
    isTopPick?: boolean;
    appLogoUrl: string | null;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-start gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            {children}
        </div>
    </div>
);

const statsInfoContent = (
    <div className="space-y-3 text-sm">
        <p><strong>Net APR:</strong> This is your estimated annual return after the validator's commission fee has been deducted.</p>
        <p><strong>Gross APR:</strong> This is the total annual return on your stake before any commission fees are taken by the validator.</p>
        <p><strong>Commission:</strong> This is the percentage of your earned rewards that the validator keeps as their service fee.</p>
        <p><strong>Voting Power:</strong> This represents the validator's influence on the network, based on the total CHZ staked with them. A higher voting power indicates more community trust.</p>
        <p><strong>Uptime:</strong> The percentage of blocks this validator has successfully signed in the recent window. A higher uptime is crucial for consistent reward generation.</p>
    </div>
);


export const ValidatorInfoModal: React.FC<ValidatorInfoModalProps> = ({ validator, onClose, isTopPick, appLogoUrl, onExternalLinkClick }) => {
    const [infoModal, setInfoModal] = useState<{ title: string; content: React.ReactNode } | null>(null);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (validator) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [validator, onClose]);
    
    if (!validator) {
        return null;
    }

    const netApr = validator.apr * (1 - validator.commission / 100);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="validator-info-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50 sticky top-0 bg-white dark:bg-[#1D1D1D] rounded-t-xl z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        {validator.logo && (
                            <img src={validator.logo} alt={`${validator.name} logo`} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700 flex-shrink-0" />
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 id="validator-info-title" className="text-xl font-bold text-zinc-900 dark:text-white truncate">{validator.name}</h2>
                            {isTopPick && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700/50 flex-shrink-0">
                                    <LucidSparklesIcon className="w-3 h-3" />
                                    Top Pick
                                </span>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0 ml-2"
                        aria-label="Close validator details"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-6 text-zinc-700 dark:text-gray-300 text-sm leading-relaxed">
                    
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <h3 className="font-bold text-md text-zinc-800 dark:text-white">Validator Statistics</h3>
                            <button
                                type="button"
                                onClick={() => setInfoModal({
                                    title: 'About Validator Statistics',
                                    content: statsInfoContent
                                })}
                                aria-label="More information about validator statistics"
                                className="p-1 -m-1"
                            >
                                <LucidInfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                            </button>
                        </div>
                        <div className="bg-gray-100 dark:bg-zinc-800/80 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Net APR</span>
                                <span className="font-bold text-lg text-[#E70559]">{netApr.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Gross APR</span>
                                <span className="font-semibold text-zinc-800 dark:text-white">{validator.apr.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Commission</span>
                                <span className="font-semibold text-zinc-800 dark:text-white">{validator.commission}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Voting Power</span>
                                <div className="text-right">
                                    <span className="font-semibold text-zinc-800 dark:text-white">
                                        {validator.votingPowerPercent ? `${validator.votingPowerPercent.toFixed(2)}%` : 'N/A'}
                                    </span>
                                    {validator.votingPowerChz && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {`${(validator.votingPowerChz / 1_000_000).toFixed(2)}M CHZ`}
                                        </p>
                                    )}
                                </div>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
                                <span className={`font-semibold ${validator.uptime && validator.uptime >= 99 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {validator.uptime ? `${validator.uptime.toFixed(3)}%` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-md text-zinc-800 dark:text-white mb-3">Validator Status</h3>
                        {validator.jailed ? (
                            <InfoCard icon={<LucidAlertTriangleIcon className="w-6 h-6 text-red-500" />}>
                                <div className="text-sm">
                                    <p className="font-bold text-red-700 dark:text-red-300">This validator is currently JAILED.</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Jailed validators are inactive and do not earn staking rewards. Delegating funds to a jailed validator is not recommended.
                                    </p>
                                </div>
                            </InfoCard>
                        ) : (
                            <InfoCard icon={<LucidBadgeCheckIcon className="w-6 h-6 text-green-500" />}>
                                 <div className="text-sm">
                                    <p className="font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                                        Status: ACTIVE
                                        {validator.type && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                                                {validator.type}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                        The validator is operating normally and earning rewards for its delegators.
                                    </p>
                                     {validator.type === 'Main' && (
                                        <p className="text-xs text-zinc-600 dark:text-gray-400 mt-1.5">
                                            <strong>Main validators</strong> are part of the active set that produces blocks and secures the network.
                                        </p>
                                    )}
                                    {validator.type === 'Candidate' && (
                                        <p className="text-xs text-zinc-600 dark:text-gray-400 mt-1.5">
                                            <strong>Candidate validators</strong> are on standby and can become Main validators. They still receive delegations and earn rewards.
                                        </p>
                                    )}
                                </div>
                            </InfoCard>
                        )}
                    </div>

                    {validator.achievements && validator.achievements.length > 0 && (
                        <div>
                            <h3 className="font-bold text-md text-zinc-800 dark:text-white mb-3">Key Highlights</h3>
                            <ul className="space-y-2.5">
                                {validator.achievements.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2.5">
                                        <LucidBadgeCheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
                    <div className="flex flex-col gap-3">
                        {validator.website && (
                             <a 
                                href={validator.website} 
                                onClick={onExternalLinkClick}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                            >
                                <LucidGlobeIcon className="w-4 h-4" />
                                Visit Website
                                <LucidExternalLinkIcon className="w-4 h-4" />
                            </a>
                        )}
                         <a 
                            href={CHILIZ_STAKING_URL} 
                            onClick={onExternalLinkClick}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-[#E70559] bg-transparent border border-[#E70559] rounded-lg hover:bg-[#E70559]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                        >
                            {appLogoUrl ? (
                                <img src={appLogoUrl} alt="App Logo" className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                                <ChilizIcon className="w-4 h-4" />
                            )}
                            Stake Now
                            <LucidExternalLinkIcon className="w-4 h-4" />
                        </a>
                    </div>
                </footer>
            </div>
             <InfoModal
                isOpen={!!infoModal}
                onClose={() => setInfoModal(null)}
                title={infoModal?.title || ''}
            >
                {infoModal?.content}
            </InfoModal>
        </div>
    );
};