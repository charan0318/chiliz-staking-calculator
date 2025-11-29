

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { LucidArrowLeftIcon } from './icons/LucidArrowLeftIcon';
import { LucidArrowRightIcon } from './icons/LucidArrowRightIcon';
import { LucidXIcon } from './icons/LucidXIcon';

interface TutorialStepConfig {
    elementId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStepConfig[] = [
    {
        elementId: 'tutorial-step-1',
        title: '1. Select a Validator',
        content: "To get started, pick a Validator for a precise rewards estimate. For a quick network overview, select 'Average Net APR'. Look for the ✨ Top Pick for the best current returns!",
        position: 'bottom',
    },
    {
        elementId: 'tutorial-step-2',
        title: '2. Enter Staking Amount',
        content: "Now, enter the amount of CHZ you plan to stake. Type any amount or tap a preset for a quick start. The more you stake, the more you can earn!",
        position: 'bottom',
    },
    {
        elementId: 'tutorial-step-3',
        title: '3. Live Price Conversion',
        content: "We fetch the live CHZ price to estimate the real-world value of your rewards. Tap the currency button to see your earnings in USD, EUR, and more!",
        position: 'bottom',
    },
    {
        elementId: 'tutorial-step-4',
        title: '4. View Your Rewards',
        content: "Voilà! See your potential daily, weekly, monthly, and yearly earnings. When you're ready, use the buttons below to share your results or head to the official Chiliz Chain to stake!",
        position: 'top',
    },
    {
        elementId: 'tutorial-step-guide',
        title: '5. Staking Guide',
        content: "New to the world of staking? Our comprehensive Staking Guide is here to help. Learn the basics, understand the risks, and start your staking journey with confidence.",
        position: 'top',
    },
    {
        elementId: 'tutorial-step-settings',
        title: '6. Explore More Tools',
        content: "Explore powerful features in the Settings menu! Plan goals with the Delegation Calculator, compare validators side-by-side, analyze APR and Network Stake trends, and find answers in the FAQ.",
        position: 'left',
    },
    {
        elementId: 'tutorial-step-view-counter',
        title: '7. Community Views',
        content: "This little counter shows how many times our community has viewed the app. It's a fun way to see the app's reach grow! Thanks for being a part of it ❤️",
        position: 'top',
    },
];


const getArrowBaseProps = (position: TutorialStepConfig['position']): { className: string; style: React.CSSProperties } => {
    const baseClasses = "absolute w-3 h-3 bg-white dark:bg-[#1D1D1D] transform rotate-45 border-gray-200 dark:border-[#333]";
    
    switch (position) {
        case 'top': // Popover is at top, arrow points down.
            return {
                className: `${baseClasses} border-b border-r`,
                style: { bottom: '-6px' },
            };
        case 'left': // Popover is at left, arrow points right.
             return {
                className: `${baseClasses} border-t border-r`,
                style: { right: '-6px' },
            };
        case 'right': // Popover is at right, arrow points left.
             return {
                className: `${baseClasses} border-b border-l`,
                style: { left: '-6px' },
            };
        case 'bottom': // Popover is at bottom, arrow points up.
        default:
            return {
                className: `${baseClasses} border-t border-l`,
                style: { top: '-6px' },
            };
    }
};

interface TutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

const TUTORIAL_PROGRESS_KEY = 'chiliz-calc-tutorial-step';

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(() => {
        const savedStep = localStorage.getItem(TUTORIAL_PROGRESS_KEY);
        // Ensure saved step is within bounds
        const stepIndex = savedStep ? parseInt(savedStep, 10) : 0;
        return stepIndex >= 0 && stepIndex < tutorialSteps.length ? stepIndex : 0;
    });
    
    const step = tutorialSteps[currentStepIndex];

    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
    // State for the dynamically determined best position for the popover.
    const [effectivePosition, setEffectivePosition] = useState<TutorialStepConfig['position']>(step?.position || 'bottom');
    const popoverRef = useRef<HTMLDivElement>(null);

    // Save progress to localStorage whenever the step changes
    useEffect(() => {
        if (isOpen) {
            localStorage.setItem(TUTORIAL_PROGRESS_KEY, String(currentStepIndex));
        }
    }, [currentStepIndex, isOpen]);

    // Reset the effective position to the preferred one when the step changes.
    useEffect(() => {
        if (step) {
            setEffectivePosition(step.position || 'bottom');
        }
    }, [step]);


    useLayoutEffect(() => {
        if (!isOpen || !step) return;

        const updatePositions = () => {
            const element = document.getElementById(step.elementId);
            const popoverEl = popoverRef.current;

            if (!element) {
                if (currentStepIndex < tutorialSteps.length - 1) {
                    setCurrentStepIndex(i => i + 1);
                } else {
                    onClose();
                }
                return;
            }

            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            const targetRect = element.getBoundingClientRect();

            const PADDING = 10;
            setSpotlightStyle({
                position: 'fixed',
                top: `${targetRect.top - PADDING}px`,
                left: `${targetRect.left - PADDING}px`,
                width: `${targetRect.width + PADDING * 2}px`,
                height: `${targetRect.height + PADDING * 2}px`,
                borderRadius: '12px',
                zIndex: 1000,
                pointerEvents: 'none',
                transition: 'all 0.3s ease-in-out',
                animation: 'glowing-spotlight 2s ease-in-out infinite',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            });

            if (!popoverEl) return;

            const popoverRect = popoverEl.getBoundingClientRect();
            const VIEWPORT_PADDING = 16;
            const POPOVER_MARGIN = 16;
            
            // --- Start of new dynamic positioning logic ---
            let newEffectivePosition = step.position || 'bottom';

            const hasSpaceBottom = targetRect.bottom + popoverRect.height + POPOVER_MARGIN < window.innerHeight - VIEWPORT_PADDING;
            const hasSpaceTop = targetRect.top - popoverRect.height - POPOVER_MARGIN > VIEWPORT_PADDING;
            const hasSpaceRight = targetRect.right + popoverRect.width + POPOVER_MARGIN < window.innerWidth - VIEWPORT_PADDING;
            const hasSpaceLeft = targetRect.left - popoverRect.width - POPOVER_MARGIN > VIEWPORT_PADDING;

            const positionPriority = {
                bottom: ['bottom', 'top', 'right', 'left'],
                top: ['top', 'bottom', 'right', 'left'],
                left: ['left', 'right', 'bottom', 'top'],
                right: ['right', 'left', 'bottom', 'top'],
            };
            
            const spaceAvailability = {
                bottom: hasSpaceBottom,
                top: hasSpaceTop,
                left: hasSpaceLeft,
                right: hasSpaceRight,
            };
            
            // Find the first available position based on the preferred priority.
            // FIX: Define the 'priority' variable, which was previously undefined.
            const priority = positionPriority[newEffectivePosition as keyof typeof positionPriority];
            const bestPosition = priority.find(pos => spaceAvailability[pos as keyof typeof spaceAvailability]) as TutorialStepConfig['position'];
            
            newEffectivePosition = bestPosition || step.position || 'bottom';
            setEffectivePosition(newEffectivePosition);
            // --- End of new dynamic positioning logic ---


            let pTop = 0, pLeft = 0;

            // Use newEffectivePosition instead of step.position
            switch(newEffectivePosition) {
                case 'top':
                    pTop = targetRect.top - popoverRect.height - POPOVER_MARGIN;
                    pLeft = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
                    break;
                case 'left':
                    pTop = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                    pLeft = targetRect.left - popoverRect.width - POPOVER_MARGIN;
                    break;
                case 'right':
                    pTop = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2);
                    pLeft = targetRect.right + POPOVER_MARGIN;
                    break;
                case 'bottom':
                default:
                    pTop = targetRect.bottom + POPOVER_MARGIN;
                    pLeft = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
                    break;
            }

            pLeft = Math.max(VIEWPORT_PADDING, Math.min(pLeft, window.innerWidth - popoverRect.width - VIEWPORT_PADDING));
            pTop = Math.max(VIEWPORT_PADDING, Math.min(pTop, window.innerHeight - popoverRect.height - VIEWPORT_PADDING));
            
            setPopoverStyle({
                position: 'fixed',
                zIndex: 1001,
                top: `${pTop}px`,
                left: `${pLeft}px`,
                opacity: 1,
                transition: 'opacity 0.3s ease-out, top 0.3s ease-out, left 0.3s ease-out',
            });
            
            // Use newEffectivePosition to get arrow props
            const { style: baseArrowStyle } = getArrowBaseProps(newEffectivePosition);
            const newArrowStyle = { ...baseArrowStyle };

            // Use newEffectivePosition for arrow calculation
            switch(newEffectivePosition) {
                case 'top': case 'bottom':
                    const targetCenterX = targetRect.left + targetRect.width / 2;
                    let arrowLeft = targetCenterX - pLeft;
                    arrowLeft = Math.max(12, Math.min(arrowLeft, popoverRect.width - 12));
                    newArrowStyle.left = `${arrowLeft}px`;
                    newArrowStyle.transform = 'translateX(-50%) rotate(45deg)';
                    break;
                case 'left': case 'right':
                    const targetCenterY = targetRect.top + targetRect.height / 2;
                    let arrowTop = targetCenterY - pTop;
                    arrowTop = Math.max(12, Math.min(arrowTop, popoverRect.height - 12));
                    newArrowStyle.top = `${arrowTop}px`;
                    newArrowStyle.transform = 'translateY(-50%) rotate(45deg)';
                    break;
            }
            setArrowStyle(newArrowStyle);
        };

        const timeoutId = setTimeout(updatePositions, 50);
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions, true);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions, true);
        };
    }, [currentStepIndex, isOpen, step?.elementId, onClose]);

    if (!isOpen || !step) {
        return null;
    }
    
    const { className: arrowClassName } = getArrowBaseProps(effectivePosition);

    return (
        <div className="fixed inset-0 z-50">
            <div style={spotlightStyle}></div>
            {step && (
                 <div ref={popoverRef} style={popoverStyle} className="bg-white dark:bg-[#1D1D1D] rounded-xl shadow-2xl w-80 max-w-[calc(100vw-2rem)] border border-gray-200 dark:border-[#333] pointer-events-auto">
                    <div style={arrowStyle} className={arrowClassName.replace('transform rotate-45', '')}></div>
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-zinc-800 dark:text-white">{step.title}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white" aria-label="Close tutorial">
                                <LucidXIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{step.content}</p>
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                <span className="text-xs font-semibold text-gray-500">{currentStepIndex + 1} / {tutorialSteps.length}</span>
                                <button 
                                    onClick={onClose} 
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors underline"
                                    aria-label="Skip tutorial"
                                >
                                    Skip
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {currentStepIndex > 0 && (
                                    <button onClick={() => setCurrentStepIndex(i => i - 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 transition-colors">
                                        <LucidArrowLeftIcon className="w-5 h-5" />
                                    </button>
                                )}
                                {currentStepIndex < tutorialSteps.length - 1 ? (
                                    <button onClick={() => setCurrentStepIndex(i => i + 1)} className="flex items-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-[#E70559]/90 rounded-lg hover:bg-[#E70559] transition-colors">
                                        Next
                                        <LucidArrowRightIcon className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={onClose} className="py-2 px-4 text-sm font-semibold text-white bg-green-600/90 rounded-lg hover:bg-green-600 transition-colors">
                                        Finish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};