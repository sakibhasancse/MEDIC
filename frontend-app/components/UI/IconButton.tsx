'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'filled' | 'outlined' | 'standard';
  color?: 'primary' | 'secondary' | 'error' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export default function IconButton({
  children,
  variant = 'standard',
  color = 'default',
  size = 'medium',
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'md-icon-button';
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };
  
  const variantClasses = {
    filled: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-teal-600 text-white hover:bg-teal-700',
      error: 'bg-red-600 text-white hover:bg-red-700',
      default: 'bg-gray-600 text-white hover:bg-gray-700',
    },
    outlined: {
      primary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      secondary: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
      error: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
      default: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50',
    },
    standard: {
      primary: 'text-blue-600 hover:bg-blue-50',
      secondary: 'text-teal-600 hover:bg-teal-50',
      error: 'text-red-600 hover:bg-red-50',
      default: 'text-gray-600 hover:bg-gray-100',
    },
  };
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant][color]}
    ${className}
  `.trim();

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
