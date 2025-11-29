

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`relative group ${className || ''}`}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-left p-2.5 text-xs text-zinc-800 dark:text-white bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        {text}
        <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current text-white dark:text-zinc-800" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};