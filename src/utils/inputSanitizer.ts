/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Validate password meets security requirements
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/\d/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("One special character");

  return { valid: errors.length === 0, errors };
};

/**
 * Validate name input
 */
export const validateName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
};

/**
 * Rate-limit aware form submission wrapper
 */
export const validateFormInputLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};
