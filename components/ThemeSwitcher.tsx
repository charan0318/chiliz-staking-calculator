import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LucidSunIcon } from './icons/LucidSunIcon';
import { LucidMoonIcon } from './icons/LucidMoonIcon';
import { LucidMonitorIcon } from './icons/LucidMonitorIcon';
import type { Theme } from '../context/ThemeContext';

const themeOptions: { value: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: LucidSunIcon },
    { value: 'dark', label: 'Dark', icon: LucidMoonIcon },
    { value: 'system', label: 'System', icon: LucidMonitorIcon },
];

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const activeIndex = themeOptions.findIndex((option) => option.value === theme);
    // Each button is w-8 (2rem), and the gap is 0.25rem (from space-x-1).
    // The total step distance is button width + gap = 2.25rem.
    const sliderPosition = activeIndex * 2.25;

    return (
        <div className="relative p-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="flex items-center space-x-1">
                {themeOptions.map((option) => {
                    const isActive = theme === option.value;
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`
                                relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-200 dark:focus-visible:ring-offset-zinc-800 focus-visible:ring-[#E70559]
                                ${isActive 
                                    ? 'text-zinc-800 dark:text-white' 
                                    : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-white'
                                }
                            `}
                            aria-pressed={isActive}
                            aria-label={`Switch to ${option.label} theme`}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
            </div>
            <span
                className="absolute top-1 left-1 h-8 w-8 rounded-full bg-white dark:bg-zinc-900/70 shadow-sm transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(${sliderPosition}rem)` }}
                aria-hidden="true"
            />
        </div>
    );
};
