// Validation utility functions for form validation across the app

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Required field validation
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

// Bangladesh phone number validation (01XXXXXXXXX)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  const phoneRegex = /^01[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid Bangladesh phone number (01XXXXXXXXX)' };
  }
  return { isValid: true };
};

// Age validation
export const validateAge = (age: string | number): ValidationResult => {
  if (!age) {
    return { isValid: false, error: 'Age is required' };
  }
  const ageNum = typeof age === 'string' ? parseInt(age) : age;
  if (isNaN(ageNum)) {
    return { isValid: false, error: 'Age must be a number' };
  }
  if (ageNum < 1 || ageNum > 150) {
    return { isValid: false, error: 'Age must be between 1 and 150' };
  }
  return { isValid: true };
};

// Name validation
export const validateName = (name: string, minLength: number = 2): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.trim().length < minLength) {
    return { isValid: false, error: `Name must be at least ${minLength} characters` };
  }
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string, minLength: number = 8): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};

// Medicine validation
export const validateMedicine = (medicine: any): ValidationResult => {
  if (!medicine.name || !medicine.name.trim()) {
    return { isValid: false, error: 'Medicine name is required' };
  }
  if (!medicine.dose || !medicine.dose.trim()) {
    return { isValid: false, error: 'Dose is required' };
  }
  if (!medicine.duration || !medicine.duration.trim()) {
    return { isValid: false, error: 'Duration is required' };
  }
  if (!medicine.instructions || !medicine.instructions.trim()) {
    return { isValid: false, error: 'Instructions are required' };
  }
  return { isValid: true };
};

// Template name validation
export const validateTemplateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Template name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Template name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Template name must not exceed 50 characters' };
  }
  return { isValid: true };
};

// Description validation
export const validateDescription = (description: string, minLength: number = 10, maxLength: number = 200): ValidationResult => {
  if (!description) {
    return { isValid: false, error: 'Description is required' };
  }
  if (description.trim().length < minLength) {
    return { isValid: false, error: `Description must be at least ${minLength} characters` };
  }
  if (description.trim().length > maxLength) {
    return { isValid: false, error: `Description must not exceed ${maxLength} characters` };
  }
  return { isValid: true };
};

// Generic text length validation
export const validateTextLength = (
  text: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): ValidationResult => {
  if (!text) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (minLength && text.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (maxLength && text.trim().length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { isValid: true };
};

// Validate at least one item in array
export const validateAtLeastOne = (items: any[], fieldName: string): ValidationResult => {
  if (!items || items.length === 0) {
    return { isValid: false, error: `At least one ${fieldName} is required` };
  }
  return { isValid: true };
};

// BMDC number validation (optional field)
export const validateBMDC = (bmdc: string): ValidationResult => {
  if (!bmdc) {
    return { isValid: true }; // Optional field
  }
  // Basic format check - adjust regex based on actual BMDC format
  const bmdcRegex = /^[A-Z]-?\d{4,6}$/i;
  if (!bmdcRegex.test(bmdc)) {
    return { isValid: false, error: 'Please enter a valid BMDC number (e.g., A-12345)' };
  }
  return { isValid: true };
};

// Validate selection (dropdown/select)
export const validateSelection = (value: string, fieldName: string): ValidationResult => {
  if (!value || value === '' || value === 'select') {
    return { isValid: false, error: `Please select ${fieldName}` };
  }
  return { isValid: true };
};
