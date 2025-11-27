'use client';

import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export default function Select({
  label,
  helperText,
  error = false,
  errorText,
  fullWidth = true,
  options,
  className = '',
  ...props
}: SelectProps) {
  const selectClasses = `
    md-text-field
    ${error ? 'md-text-field-error' : ''}
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
      
      <select className={selectClasses} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {(helperText || errorText) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error ? errorText : helperText}
        </p>
      )}
    </div>
  );
}
