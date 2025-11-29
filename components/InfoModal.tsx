
import React, { useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidInfoIcon } from './icons/LucidInfoIcon';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-sm max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50 rounded-t-xl">
                    <h2 id="info-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto">
                     <div className="flex items-start gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
                        <LucidInfoIcon className="w-6 h-6 text-[#E70559] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                           {children}
                        </div>
                    </div>
                </div>

                 <footer className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700/50 rounded-b-xl">
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