


import React, { useEffect, useMemo } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidArrowUpRightIcon } from './icons/LucidArrowUpRightIcon';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';

interface ExternalLinkWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    url: string;
}

export const ExternalLinkWarningModal: React.FC<ExternalLinkWarningModalProps> = ({ isOpen, onClose, onConfirm, url }) => {
    
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
    
    const displayUrl = useMemo(() => {
        if (!url) return '';
        try {
            const urlObject = new URL(url);
            return urlObject.hostname;
        } catch (e) {
            return url.length > 50 ? `${url.substring(0, 47)}...` : url;
        }
    }, [url]);
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="external-link-warning-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <h2 id="external-link-warning-title" className="text-lg font-bold text-zinc-900 dark:text-white">Leaving the App</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close warning"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 space-y-4 text-sm leading-relaxed">
                    <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <LucidAlertTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-800 dark:text-amber-200">You are about to navigate to an external website.</p>
                            <p className="text-amber-700 dark:text-amber-300 mt-1">This site is not affiliated with the Chiliz Staking Calculator.</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">You will be redirected to:</p>
                        <p className="font-mono text-sm text-[#E70559] bg-gray-100 dark:bg-zinc-800 p-3 rounded-md mt-2 text-center font-bold tracking-wider">{displayUrl}</p>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl flex justify-end items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="py-2 px-4 text-sm font-semibold text-zinc-700 dark:text-gray-300 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors"
                    >
                        Proceed
                        <LucidArrowUpRightIcon className="w-4 h-4" />
                    </button>
                </footer>
            </div>
        </div>
    );
};