

import React, { useEffect } from 'react';
import { LucidXIcon } from './icons/LucidXIcon';
import { LucidTwitterIcon } from './icons/LucidTwitterIcon';
import { LucidTelegramIcon } from './icons/LucidTelegramIcon';
import { APP_URL, TELEGRAM_BOT_URL, CHILIZ_TWITTER_URL, CHILIZ_STAKING_URL } from '../constants';
import type { Validator } from '../types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareText: string;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    selectedValidator: Validator | null;
}

const renderRichText = (text: string, onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void, selectedValidator: Validator | null) => {
    const calculatorPhrase = "Chiliz Staking Calculator";
    const chilizChainPhrase = "Chiliz Chain";

    // Base parts for the regex
    const regexParts = [
        `(\\*.*?\\*)`,                // Bold text: *text*
        `(@[a-zA-Z0-9_]+)`,          // @handles: @handle_name
        `(${calculatorPhrase})`,     // Specific phrase for calculator
        `(${chilizChainPhrase})`,
    ];

    // If there's a selected validator with a twitter handle, add its name to the regex
    if (selectedValidator && selectedValidator.twitterHandle) {
        // Escape any special regex characters in the validator's name
        const escapedName = selectedValidator.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        regexParts.push(`(${escapedName})`);
    }

    const regex = new RegExp(regexParts.join('|'), 'g');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
        if (!part) return null;

        // Handle bold text
        if (part.startsWith('*') && part.endsWith('*')) {
            return <strong key={index} className="text-zinc-800 dark:text-white">{part.slice(1, -1)}</strong>;
        }

        // Handle Chiliz Chain
        if (part === chilizChainPhrase) {
             return (
                <span key={index}>
                    <a 
                        href={CHILIZ_TWITTER_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={onExternalLinkClick}
                        className="text-[#1DA1F2] hover:underline font-semibold"
                    >
                        Chiliz
                    </a>
                    {' Chain'}
                </span>
            );
        }
        
        // Handle selected validator's name
        if (selectedValidator && selectedValidator.twitterHandle && part === selectedValidator.name) {
             return (
                <a 
                    key={index} 
                    href={`https://twitter.com/${selectedValidator.twitterHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={onExternalLinkClick}
                    className="text-[#1DA1F2] hover:underline font-semibold"
                >
                    {part}
                </a>
            );
        }

        // Handle other @handles (like the validator's handle in parentheses)
        if (part.startsWith('@')) {
            const handle = part.slice(1);
            return (
                <a 
                    key={index} 
                    href={`https://twitter.com/${handle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={onExternalLinkClick}
                    className="text-[#1DA1F2] hover:underline font-semibold"
                >
                    {part}
                </a>
            );
        }

        // Handle calculator phrase
        if (part === calculatorPhrase) {
             return (
                <a 
                    key={index} 
                    href={TELEGRAM_BOT_URL} 
                    onClick={onExternalLinkClick} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#E70559] hover:underline font-semibold"
                >
                    {part}
                </a>
            );
        }

        // Return plain text part
        return part;
    });
};

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareText, onExternalLinkClick, selectedValidator }) => {
    
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

    const textForTwitter = `${shareText}\n\n${APP_URL}`;
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textForTwitter)}`;
    const telegramIntentUrl = `https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_BOT_URL)}&text=${encodeURIComponent(shareText)}`;


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
        >
            <div 
                className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-[#333] rounded-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700/50">
                    <h2 id="share-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">Share Results</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <LucidXIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    <div
                        className="w-full p-3 text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg overflow-y-auto"
                    >
                        <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                           {renderRichText(shareText, onExternalLinkClick, selectedValidator)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={twitterIntentUrl}
                                onClick={onExternalLinkClick}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#1DA1F2]/90 rounded-lg hover:bg-[#1DA1F2] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#1DA1F2]"
                            >
                                <LucidTwitterIcon className="w-5 h-5" />
                                Twitter
                            </a>
                            <a
                                href={telegramIntentUrl}
                                onClick={onExternalLinkClick}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#2AABEE]/90 rounded-lg hover:bg-[#2AABEE] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#2AABEE]"
                            >
                                <LucidTelegramIcon className="w-5 h-5" />
                                Telegram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};