
import React from 'react';

export const QuestionBubbleIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M20.25 12c0-4.97-4.03-9-9-9S2.25 7.03 2.25 12c0 2.14.755 4.103 2.02 5.666L3 21.75l4.086-1.022A8.956 8.956 0 0011.25 21c4.97 0 9-4.03 9-9z" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 15.75h.008v.008H12v-.008z" 
        />
    </svg>
);
