


import React, { useEffect } from 'react';
import { CHILIZ_STAKING_URL } from '../constants';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidExternalLinkIcon } from './icons/LucidExternalLinkIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidListIcon } from './icons/LucidListIcon';
import { LucidMoreVerticalIcon } from './icons/LucidMoreVerticalIcon';


interface StakingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-base sm:text-lg text-zinc-800 dark:text-white mb-2">{title}</h3>
            {children}
        </div>
    </div>
);

export const StakingGuideModal: React.FC<StakingGuideModalProps> = ({ isOpen, onClose, onExternalLinkClick }) => {
    
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
            aria-labelledby="staking-guide-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50 sticky top-0 bg-white dark:bg-[#1D1D1D] rounded-t-xl z-10">
                    <h2 id="staking-guide-title" className="text-xl font-bold text-zinc-900 dark:text-white">Chiliz Staking Guide</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close staking guide"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4 text-zinc-700 dark:text-gray-300 text-sm leading-relaxed">
                    
                    <InfoCard icon={<LucidInfoIcon className="w-6 h-6 text-blue-500" />} title="What is Staking?">
                        <p>Staking is the process of actively participating in transaction validation on a Proof-of-Stake (PoS) blockchain. On the Chiliz Chain, anyone with a minimum balance of CHZ can delegate their tokens to a validator and earn staking rewards.</p>
                    </InfoCard>

                    <InfoCard icon={<LucidSparklesIcon className="w-6 h-6 text-yellow-500" />} title="Benefits of Staking CHZ">
                         <ul className="list-disc list-inside space-y-2">
                            <li><span className="font-semibold">Earn Rewards:</span> Generate a passive income by earning a percentage of rewards for the transactions you help validate. This calculator helps you estimate these potential earnings.</li>
                            <li><span className="font-semibold">Secure the Network:</span> By staking your CHZ, you contribute to the security and operational integrity of the Chiliz Chain, making it more decentralized and resilient against attacks.</li>
                            <li><span className="font-semibold">Low Barrier to Entry:</span> Unlike mining, staking doesn't require expensive hardware. You can start with any amount of CHZ you're comfortable with.</li>
                        </ul>
                    </InfoCard>

                    <InfoCard icon={<LucidAlertTriangleIcon className="w-6 h-6 text-red-500" />} title="Understanding the Key Risks">
                        <ul className="list-disc list-inside space-y-2">
                            <li><span className="font-semibold">Slashing:</span> If the validator you delegate to misbehaves (e.g., has significant downtime or double-signs transactions), a portion of their staked tokens (including yours) can be permanently destroyed as a penalty. Always choose reputable validators.</li>
                            <li><span className="font-semibold">Market Volatility:</span> The price of CHZ can fluctuate. The USD value of your staked tokens and rewards is not guaranteed and can go up or down.</li>
                             <li><span className="font-semibold">Unbonding Period:</span> When you decide to unstake your CHZ, there is an "unbonding" period (typically 21 days) where your tokens are locked. During this time, they are inaccessible and do not earn rewards.</li>
                            <li><span className="font-semibold">Validator Commission:</span> Validators charge a commission fee on your rewards. This is automatically deducted. This calculator uses the "Net APR" after commission to give you a more accurate estimate.</li>
                        </ul>
                    </InfoCard>
                    
                    <InfoCard icon={<LucidListIcon className="w-6 h-6 text-green-500" />} title="How to Stake Your CHZ: A Step-by-Step Guide">
                         <ol className="list-decimal list-inside space-y-3">
                            <li><span className="font-semibold">Get a Compatible Wallet:</span> You'll need a wallet that can interact with the Chiliz Chain, such as MetaMask or a hardware wallet like Ledger.</li>
                            <li><span className="font-semibold">Acquire CHZ:</span> Purchase CHZ from a cryptocurrency exchange and transfer it to your personal wallet.</li>
                            <li><span className="font-semibold">Go to the Staking Portal:</span> Navigate to the official Chiliz Chain Governance portal. <a href={CHILIZ_STAKING_URL} onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="text-[#E70559] font-semibold hover:underline inline-flex items-center gap-1">Visit Portal <LucidExternalLinkIcon className="w-3 h-3" /></a></li>
                            <li><span className="font-semibold">Connect Your Wallet:</span> Click the "Connect Wallet" button on the portal and approve the connection in your wallet's pop-up.</li>
                            <li>
                                <span className="font-semibold">Choose a Validator:</span> Browse the list of available validators. Use this calculator to compare their Net APRs. Look for the <strong className="text-zinc-800 dark:text-white">"Top Pick"</strong> badge to quickly identify the validator currently offering the highest net return. It's also wise to research their reputation and uptime.
                            </li>
                            <li>
                                <span className="font-semibold">Delegate Your CHZ:</span> Select a validator, click "Delegate," and enter the amount of CHZ you wish to stake. Use the <strong className="text-zinc-800 dark:text-white">Delegation Calculator</strong> (in the settings menu <LucidMoreVerticalIcon className="w-4 h-4 inline-block align-middle -mt-1 text-zinc-500 dark:text-zinc-400"/>) to help plan an amount to meet your reward goals. Finally, confirm the transaction in your wallet.
                            </li>
                        </ol>
                    </InfoCard>

                </div>
                 <footer className="p-4 bg-gray-100 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
                        This guide is for informational purposes only and does not constitute financial advice. Please do your own research (DYOR) before participating.
                    </p>
                    <button 
                        onClick={onClose}
                        className="w-full py-2 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                    >
                        Got it
                    </button>
                </footer>
            </div>
        </div>
    );
};