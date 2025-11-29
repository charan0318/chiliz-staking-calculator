
import React from 'react';

export const TargetIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 15.91a4.5 4.5 0 01-6.364 0 4.5 4.5 0 010-6.364 4.5 4.5 0 016.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01" />
    </svg>
);
