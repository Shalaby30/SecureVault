import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// UI utility function for class name merging
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Password generation and strength utilities
const LOWER_CASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPER_CASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generate a random password with specified length and character sets
 * @param {number} length - Length of the password (default: 16)
 * @param {Object} options - Options for character sets
 * @param {boolean} options.includeUppercase - Include uppercase letters
 * @param {boolean} options.includeNumbers - Include numbers
 * @param {boolean} options.includeSymbols - Include symbols
 * @returns {string} Generated password
 */
export function generatePassword(
  length = 16,
  { includeUppercase = true, includeNumbers = true, includeSymbols = true } = {}
) {
  let charset = LOWER_CASE;
  
  if (includeUppercase) charset += UPPER_CASE;
  if (includeNumbers) charset += NUMBERS;
  if (includeSymbols) charset += SYMBOLS;

  let password = '';
  const values = new Uint32Array(length);
  
  // Use crypto.getRandomValues for secure random number generation
  crypto.getRandomValues(values);
  
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length];
  }
  
  // Ensure at least one character from each included character set
  if (includeUppercase && !/[A-Z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * (password.length - 1));
    const randomUpper = UPPER_CASE[Math.floor(Math.random() * UPPER_CASE.length)];
    password = password.substring(0, randomIndex) + randomUpper + password.substring(randomIndex + 1);
  }
  
  if (includeNumbers && !/\d/.test(password)) {
    const randomIndex = Math.floor(Math.random() * (password.length - 1));
    const randomNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    password = password.substring(0, randomIndex) + randomNumber + password.substring(randomIndex + 1);
  }
  
  if (includeSymbols && !/[^a-zA-Z0-9]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * (password.length - 1));
    const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    password = password.substring(0, randomIndex) + randomSymbol + password.substring(randomIndex + 1);
  }
  
  return password;
}

/**
 * Check password strength and return a score (0-4)
 * @param {string} password - The password to check
 * @returns {Object} Object containing score and feedback
 */
export function checkPasswordStrength(password) {
  if (!password) return { score: 0, strength: 'Very Weak', feedback: 'Enter a password' };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length < 8) {
    feedback.push('Make it at least 8 characters long');
  } else if (password.length >= 12) {
    score += 1;
  }
  
  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  // Contains numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  // Contains symbols
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add symbols');
  }
  
  // Common passwords check (very basic example)
  const commonPasswords = ['password', '123456', 'qwerty', 'letmein', 'welcome'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords');
  }
  
  // Sequential/repeating characters
  if (/([a-zA-Z0-9])\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }
  
  // Determine strength level
  let strength;
  if (score <= 1) strength = 'Very Weak';
  else if (score === 2) strength = 'Weak';
  else if (score === 3) strength = 'Moderate';
  else if (score === 4) strength = 'Strong';
  else strength = 'Very Strong';
  
  return {
    score: Math.min(4, Math.max(0, score)),
    strength,
    feedback: feedback.length > 0 ? feedback : ['Good job! This is a strong password.']
  };
}
