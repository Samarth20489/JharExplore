import React from 'react';
import { cn } from '../../utils/helpers';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen, size = 'md', text }) => {
  const sizeClasses = { sm: 'w-6 h-6 border-2', md: 'w-12 h-12 border-4', lg: 'w-16 h-16 border-4' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', fullScreen && 'min-h-screen')}>
      <div className={cn('rounded-full border-surface-300 border-t-primary animate-spin', sizeClasses[size])} />
      {text && <p className="text-gray-500 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
