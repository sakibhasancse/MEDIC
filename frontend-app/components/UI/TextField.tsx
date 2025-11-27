'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export default function TextField({
  label,
  helperText,
  error = false,
  errorText,
  fullWidth = true,
  startAdornment,
  endAdornment,
  className = '',
  ...props
}: TextFieldProps) {
  const inputClasses = `
    md-text-field
    ${error ? 'md-text-field-error' : ''}
    ${startAdornment ? 'pl-10' : ''}
    ${endAdornment ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {startAdornment}
          </div>
        )}
        
        <input
          className={inputClasses}
          {...props}
        />
        
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {endAdornment}
          </div>
        )}
      </div>
      
      {(helperText || errorText) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error ? errorText : helperText}
        </p>
      )}
    </div>
  );
}
