/**
 * Loading Spinner Component - Reusable loading indicator
 */

import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '',
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClasses = {
    small: 'gap-2',
    medium: 'gap-3',
    large: 'gap-4'
  };

  const textClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      <ArrowPathIcon 
        className={`${sizeClasses[size]} animate-spin`}
        style={{ color: 'var(--color-accent)' }}
      />
      {showMessage && message && (
        <span 
          className={`${textClasses[size]} font-medium`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;