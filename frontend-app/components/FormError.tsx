import React from 'react';

interface FormErrorProps {
  error?: string;
  className?: string;
}

export default function FormError({ error, className = '' }: FormErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-red-600 text-sm mt-1 flex items-start gap-1 ${className}`}>
      <span className="text-red-500">⚠️</span>
      <span>{error}</span>
    </p>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormErrorSummary({ errors, className = '' }: FormErrorSummaryProps) {
  const errorList = Object.values(errors).filter(Boolean);
  
  if (errorList.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start gap-2">
        <span className="text-red-500 text-xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
            {errorList.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
