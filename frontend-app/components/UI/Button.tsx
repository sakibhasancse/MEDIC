'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'md-button';
  
  const variantClasses = {
    primary: 'md-button-primary',
    secondary: 'md-button-secondary',
    outlined: 'md-button-outlined',
    text: 'md-button-text',
  };
  
  const sizeClasses = {
    small: 'px-4 py-1.5 text-xs min-h-[32px]',
    medium: 'px-6 py-2.5 text-sm min-h-[40px]',
    large: 'px-8 py-3 text-base min-h-[48px]',
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && startIcon && <span>{startIcon}</span>}
      <span>{children}</span>
      {!loading && endIcon && <span>{endIcon}</span>}
    </button>
  );
}
