

import React, { useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';

interface FaqModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FAQ_DATA = [
    {
        question: 'What is the purpose of this calculator?',
        answer: 'This tool is designed to provide an easy way to estimate your potential staking rewards for Chiliz (CHZ). It should be used as a guide for planning and comparing validators, not as a financial guarantee.'
    },
    {
        question: 'What is "Net APR"?',
        answer: 'Net APR (Annual Percentage Rate) is your estimated annual return after deducting the validator\'s commission fee. This calculator uses the Net APR for all reward estimations to give you a more accurate figure.'
    },
    {
        question: 'What does "Total Network Stake" mean?',
        answer: 'This figure, displayed at the top of the calculator, represents the total amount of CHZ currently staked across all validators on the Chiliz Chain. It\'s a key indicator of network security and overall community participation.'
    },
    {
        question: 'How do I choose a good validator?',
        answer: 'Look for a balance of high Net APR, high uptime (ideally >99%), a reasonable commission, and a good reputation. The "Top Pick" badge helps identify the validator with the highest current return, but doing your own research (DYOR) is always recommended.'
    },
    {
        question: 'What is the "Compare Validators" tool?',
        answer: 'Found in the settings menu, this tool allows you to select up to 5 validators for a side-by-side comparison. You can compare key metrics like their 7-day Net APR history, total Voting Power, Commission rate, and Uptime, helping you make a more informed decision.'
    },
    {
        question: 'What is the "Delegation Calculator"?',
        answer: 'Found in the settings menu, this is a reverse calculator. Instead of entering your CHZ amount, you enter your desired reward target (e.g., "100 CHZ per month"), and it estimates the amount of CHZ you would need to stake to achieve that goal based on the selected validator\'s Net APR, or the network average if no validator is chosen.'
    },
    {
        question: 'What does it mean if a validator is "Jailed"?',
        answer: 'A "jailed" validator is temporarily inactive and cannot participate in validating blocks. You will NOT earn rewards while your delegated validator is jailed. It is highly recommended to delegate only to active validators.'
    },
    {
        question: 'Where does the data come from?',
        answer: 'Validator data, including individual APRs, commission, and uptime, is fetched live from the official Chiliz Chain staking API. The CHZ price data is sourced from the CoinGecko API. All data is cached to ensure the app is fast and reliable.'
    },
    {
        question: 'Why is my actual reward different from the estimate?',
        answer: 'The calculator provides an estimate based on current data. Actual rewards can vary due to several factors, including changes in the network-wide APR, fluctuations in the total amount of CHZ staked on the network, and a validator\'s uptime performance.'
    },
    {
        question: 'What are the main risks of staking?',
        answer: 'Staking involves risks. Key risks include: Market Volatility (the price of CHZ can change), Slashing (losing funds if a validator misbehaves), and Unbonding Periods (your CHZ is locked for a time after unstaking). We highly recommend reading the full Staking Guide.'
    },
    {
        question: 'Is this an official Chiliz app?',
        answer: 'No, this is an independent, community-built tool created to help CHZ holders. It is not officially affiliated with Chiliz, FanTokens or Socios.com.'
    }
];

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
        <h3 className="font-bold text-base text-zinc-800 dark:text-white mb-2">{question}</h3>
        <p className="text-sm text-zinc-700 dark:text-gray-300 leading-relaxed">{answer}</p>
    </div>
);


export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
    
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
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-modal-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50 sticky top-0 bg-white dark:bg-[#1D1D1D] rounded-t-xl z-10">
                    <h2 id="faq-modal-title" className="text-xl font-bold text-zinc-900 dark:text-white">Frequently Asked Questions</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close FAQ"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    {FAQ_DATA.map((item, index) => (
                        <FaqItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
                 <footer className="p-4 bg-gray-100 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="w-full py-2 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};