/**
 * Error Message Component - Displays error states with retry functionality
 */

import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data.',
  onRetry,
  showRetry = true,
  className = ''
}) => {
  return (
    <div 
      className={`rounded-2xl p-8 border text-center max-w-md mx-auto ${className}`}
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ background: 'var(--color-red)' + '20' }}
      >
        <ExclamationTriangleIcon 
          className="h-8 w-8" 
          style={{ color: 'var(--color-red)' }}
        />
      </div>
      
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {message}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 focus:ring-2 focus:ring-offset-2"
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            focusRingColor: 'var(--color-accent)'
          }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;