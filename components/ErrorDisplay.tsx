import React from 'react';
import { LucidAlertTriangleIcon } from './icons/LucidAlertTriangleIcon';
import { LucidRefreshCwIcon } from './icons/LucidRefreshCwIcon';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
    retryText?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, retryText = 'Retry' }) => {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3 rounded-r-lg" role="alert">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <LucidAlertTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 flex-grow">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {message}
                    </p>
                </div>
                {onRetry && (
                    <div className="ml-auto pl-3">
                        <button
                            onClick={onRetry}
                            className="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200 underline flex items-center gap-1 whitespace-nowrap"
                        >
                            <LucidRefreshCwIcon className="w-4 h-4" />
                            {retryText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};