
import React from 'react';

export const PulseIcon = ({ className }: { className?: string }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h3l2.25-6L12 18l2.25-6h3.75" />
    </svg>
);
