
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChilizIcon } from './icons/ChilizIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LucidTargetIcon } from './icons/LucidTargetIcon';
import { LucidLineChartIcon } from './icons/LucidLineChartIcon';
import { LucidHelpCircleIcon } from './icons/LucidHelpCircleIcon';
import { LucidBookOpenIcon } from './icons/LucidBookOpenIcon';
import { LucidMessageSquareIcon } from './icons/LucidMessageSquareIcon';
import { LucidActivityIcon } from './icons/LucidActivityIcon';
import { LucidMailIcon } from './icons/LucidMailIcon';
import { LucidPaletteIcon } from './icons/LucidPaletteIcon';
import { LucidMoreVerticalIcon } from './icons/LucidMoreVerticalIcon';
import { LucidCopyIcon } from './icons/LucidCopyIcon';
import { LucidBarChart3Icon } from './icons/LucidBarChart3Icon';


interface SettingsMenuModalProps {
    onOpenTutorial: () => void;
    onOpenStakingGuide: () => void;
    onOpenDelegationCalculator: () => void;
    onOpenTrendChart: () => void;
    onOpenCompareValidators: () => void;
    onOpenNetworkStakeHistory: () => void;
    onOpenFaq: () => void;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    appLogoUrl: string | null;
    fanTokensLogoUrl: string | null;
    sociosLogoUrl: string | null;
}

const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`px-3 pt-4 pb-1 ${className}`}>
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">{children}</h3>
    </div>
);


const MenuItem: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void }> = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
        <span className="text-zinc-500 dark:text-gray-400">{icon}</span>
        <span className="font-semibold text-zinc-800 dark:text-white">{text}</span>
    </button>
);

export const SettingsMenuModal: React.FC<SettingsMenuModalProps> = ({ 
    onOpenTutorial, 
    onOpenStakingGuide, 
    onOpenDelegationCalculator, 
    onOpenTrendChart, 
    onOpenCompareValidators, 
    onOpenNetworkStakeHistory,
    onOpenFaq, 
    onExternalLinkClick,
    appLogoUrl,
    fanTokensLogoUrl,
    sociosLogoUrl
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenTutorial = () => {
        setIsOpen(false);
        setTimeout(onOpenTutorial, 150);
    };

    const handleOpenGuide = () => {
        setIsOpen(false);
        onOpenStakingGuide();
    };
    
    const handleOpenDelegationCalculator = () => {
        setIsOpen(false);
        setTimeout(onOpenDelegationCalculator, 150);
    };

    const handleOpenTrendChart = () => {
        setIsOpen(false);
        setTimeout(onOpenTrendChart, 150);
    };
     const handleOpenCompare = () => {
        setIsOpen(false);
        onOpenCompareValidators();
    };
    
    const handleOpenNetworkStakeHistory = () => {
        setIsOpen(false);
        onOpenNetworkStakeHistory();
    };

    const handleOpenFaq = () => {
        setIsOpen(false);
        onOpenFaq();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                aria-label="Open settings and more"
            >
                <LucidMoreVerticalIcon className="w-6 h-6" />
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-menu-title"
                >
                    <div 
                        className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-sm max-h-[90vh] flex flex-col animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                            <h2 id="settings-menu-title" className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Settings & More</h2>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                                aria-label="Close menu"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </header>
                        
                        <div className="flex-grow p-2 overflow-y-auto">
                            <SectionHeader>Tools</SectionHeader>
                            <MenuItem icon={<LucidTargetIcon className="w-6 h-6" />} text="Delegation Calculator" onClick={handleOpenDelegationCalculator} />
                            <MenuItem icon={<LucidCopyIcon className="w-6 h-6" />} text="Compare Validators" onClick={handleOpenCompare} />
                            <MenuItem icon={<LucidLineChartIcon className="w-6 h-6" />} text="30-Day APR History" onClick={handleOpenTrendChart} />
                            <MenuItem icon={<LucidBarChart3Icon className="w-6 h-6" />} text="30-Day Network Stake History" onClick={handleOpenNetworkStakeHistory} />

                            <SectionHeader>Help</SectionHeader>
                            <MenuItem icon={<LucidHelpCircleIcon className="w-6 h-6" />} text="App Tutorial" onClick={handleOpenTutorial} />
                            <MenuItem icon={<LucidBookOpenIcon className="w-6 h-6" />} text="Staking Guide" onClick={handleOpenGuide} />
                            <MenuItem icon={<LucidMessageSquareIcon className="w-6 h-6" />} text="FAQ" onClick={handleOpenFaq} />
                             <a href="https://x.com/ch04niverse" onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-500 dark:text-gray-400"><LucidMailIcon className="w-6 h-6" /></span>
                                    <span className="font-semibold text-zinc-800 dark:text-white">Feedback & Suggestions</span>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                            </a>
                            
                            <div className="px-3 py-2"><hr className="border-t border-gray-200 dark:border-zinc-700/50" /></div>
                            
                            <SectionHeader className="pt-2">Network</SectionHeader>
                             <a href="https://status.chiliz.com/" onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-500 dark:text-gray-400"><LucidActivityIcon className="w-6 h-6" /></span>
                                    <div>
                                        <span className="font-semibold text-zinc-800 dark:text-white">Chiliz Chain Status</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Real-time network performance</p>
                                    </div>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                            </a>

                            <SectionHeader>SportFi Ecosystem</SectionHeader>
                             <a href="https://www.chiliz.com/" onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-500 dark:text-gray-400">
                                        {appLogoUrl ? (
                                            <img src={appLogoUrl} alt="App Logo" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <ChilizIcon className="w-6 h-6" />
                                        )}
                                    </span>
                                    <div>
                                        <span className="font-semibold text-zinc-800 dark:text-white">Chiliz.com</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">The Blockchain Built for Sports</p>
                                    </div>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                            </a>
                             <a href="https://www.fantokens.com/" onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-500 dark:text-gray-400">
                                        {fanTokensLogoUrl ? (
                                            <img src={fanTokensLogoUrl} alt="FanTokens.com Logo" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <ChilizIcon className="w-6 h-6" />
                                        )}
                                    </span>
                                    <div>
                                        <span className="font-semibold text-zinc-800 dark:text-white">FanTokens.com</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Trusted by 80+ global sports brands</p>
                                    </div>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                            </a>
                            <a href="https://www.socios.com/" onClick={onExternalLinkClick} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-zinc-500 dark:text-gray-400">
                                        {sociosLogoUrl ? (
                                            <img src={sociosLogoUrl} alt="Socios.com Logo" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <ChilizIcon className="w-6 h-6" />
                                        )}
                                    </span>
                                    <div>
                                        <span className="font-semibold text-zinc-800 dark:text-white">Socios.com</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Web3 Sports Platform</p>
                                    </div>
                                </div>
                                <ExternalLinkIcon className="w-4 h-4 text-zinc-400 dark:text-gray-500" />
                            </a>

                            <div className="p-2 pt-4">
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-200 dark:border-zinc-700/50">
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-500 dark:text-gray-400"><LucidPaletteIcon className="w-6 h-6" /></span>
                                        <p className="font-semibold text-zinc-800 dark:text-white">Appearance</p>
                                    </div>
                                    <ThemeSwitcher />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
