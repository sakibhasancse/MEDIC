'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  extended?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export default function FAB({
  children,
  extended = false,
  position = 'bottom-right',
  color = 'primary',
  size = 'medium',
  className = '',
  ...props
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const colorClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl',
  };

  const sizeClasses = extended
    ? {
        small: 'h-10 px-4 text-sm',
        medium: 'h-12 px-6 text-base',
        large: 'h-14 px-8 text-lg',
      }
    : {
        small: 'w-10 h-10',
        medium: 'w-14 h-14',
        large: 'w-16 h-16',
      };

  return (
    <button
      className={`
        fixed ${positionClasses[position]}
        ${colorClasses[color]}
        ${sizeClasses[size]}
        ${extended ? 'rounded-full' : 'rounded-full'}
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        z-50
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
