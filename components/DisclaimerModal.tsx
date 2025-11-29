
import React, { useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidSparklesIcon } from './icons/LucidSparklesIcon';
import { LucidGlobeIcon } from './icons/LucidGlobeIcon';
import { LucidTrendingUpIcon } from './icons/LucidTrendingUpIcon';

interface DisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DisclaimerItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-zinc-800 dark:text-white mb-1">{title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
    
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
            aria-labelledby="disclaimer-modal-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50 sticky top-0 bg-white dark:bg-[#1D1D1D] rounded-t-xl z-10">
                    <h2 id="disclaimer-modal-title" className="text-xl font-bold text-zinc-900 dark:text-white">Disclaimer & Methodology</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close disclaimer"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    
                    <DisclaimerItem icon={<LucidAlertTriangleIcon className="w-5 h-5 text-amber-500" />} title="Not Financial Advice">
                        <p>
                            This calculator is a community-built educational tool. The figures provided are estimates only and do not constitute financial, investment, or legal advice. Staking involves risks, including potential loss of principal (slashing) and market volatility.
                        </p>
                    </DisclaimerItem>

                    <DisclaimerItem icon={<LucidSparklesIcon className="w-5 h-5 text-[#E70559]" />} title='"Top Pick" Badge'>
                        <p>
                            The <strong>"Top Pick"</strong> badge is generated automatically by the application based solely on the highest <strong>Net APR</strong> (Gross APR minus Commission) available at the moment of calculation. It is <strong>not</strong> an endorsement of that validator's reliability, security, or long-term performance. Always do your own research (DYOR).
                        </p>
                    </DisclaimerItem>

                    <DisclaimerItem icon={<LucidGlobeIcon className="w-5 h-5 text-blue-500" />} title="Data Sources & Accuracy">
                        <p>
                            We utilize public APIs from the Chiliz Chain and CoinGecko. While we strive for real-time accuracy, data may be subject to caching or network delays. We are not responsible for any discrepancies between this tool and actual on-chain values.
                        </p>
                    </DisclaimerItem>

                    <DisclaimerItem icon={<LucidTrendingUpIcon className="w-5 h-5 text-green-500" />} title="Projection Dynamics">
                        <p>
                            Reward projections assume that the current APR remains constant over the selected timeframe. In reality, APR is dynamic and fluctuates based on the total network stake, validator uptime, and governance parameters.
                        </p>
                    </DisclaimerItem>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
                    >
                        I Understand
                    </button>
                </footer>
            </div>
        </div>
    );
};
