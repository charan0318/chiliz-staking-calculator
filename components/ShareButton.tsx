import React, { useState, useMemo } from 'react';
import type { Rewards, Validator } from '../types';
import { ShareModal } from './ShareModal';
import { LucidShare2Icon } from './icons/LucidShare2Icon';
import { APP_URL, CHILIZ_TWITTER_URL } from '../constants';

interface ShareButtonProps {
    rewards: Rewards;
    stakedAmount: number;
    onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    selectedValidator: Validator | null;
    currentApr: number;
    grossApr: number;
}

const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const ShareButton: React.FC<ShareButtonProps> = ({ rewards, stakedAmount, onExternalLinkClick, selectedValidator, currentApr, grossApr }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const shareTitle = 'Chiliz Staking Rewards';
    
    const validatorText = useMemo(() => {
        if (selectedValidator) {
            return `with ${selectedValidator.name} (${grossApr.toFixed(2)}% Gross / ${currentApr.toFixed(2)}% Net APR)`;
        }
        return `based on the network average (${grossApr.toFixed(2)}% Gross / ${currentApr.toFixed(2)}% Net APR)`;
    }, [selectedValidator, currentApr, grossApr]);

    const shareText = `I'm estimating my Chiliz Staking Rewards!\n\nStaking ${formatNumber(stakedAmount)} CHZ could earn ~${formatNumber(rewards.yearly.chz)} CHZ per year ${validatorText}.\n\nCalculate yours using the Chiliz Staking Calculator and get staking on Chiliz Chain!`;


    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: APP_URL,
                });
            } catch (error) {
                // If sharing fails for any reason (including cancellation), open the fallback modal.
                setIsModalOpen(true);
                
                // Only log an error to the console if it's not an AbortError from the user cancelling.
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('Error sharing:', error);
                } else {
                    console.log('Share canceled, showing fallback modal.');
                }
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-[#E70559] bg-[#E70559]/10 rounded-lg hover:bg-[#E70559]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-[#E70559]"
            >
                <LucidShare2Icon className="w-4 h-4" />
                Share Results
            </button>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shareText={shareText}
                onExternalLinkClick={onExternalLinkClick}
                selectedValidator={selectedValidator}
            />
        </>
    );
};