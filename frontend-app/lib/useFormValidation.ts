import { useState, useCallback } from 'react';
import { ValidationResult } from './validation';

export interface FormErrors {
  [key: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateField = useCallback((
    field: string,
    validationFn: () => ValidationResult
  ): boolean => {
    const result = validationFn();
    if (!result.isValid && result.error) {
      setError(field, result.error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [setError, clearError]);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    validateField,
    hasErrors,
  };
}
