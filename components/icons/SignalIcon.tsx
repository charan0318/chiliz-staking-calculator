import React from 'react';

export const SignalIcon = ({ className }: { className?: string }) => (
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
            d="M8.288 15.045A9 9 0 0 1 7.5 15.25m-1.5 0a.375.375 0 0 0 .375.375h.375a.375.375 0 0 0 .375-.375m-1.125 0a.375.375 0 0 1 .375-.375h.375a.375.375 0 0 1 .375.375m-1.125 0a.375.375 0 0 0 .375.375h.375a.375.375 0 0 0 .375-.375m-7.5 0a9 9 0 0 1 15 0m-15 0a9 9 0 0 0 15 0m-15 0H3m15 0h.375" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 18.75m-1.125 0a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 1 1-2.25 0Z" 
        />
    </svg>
);