// Security configuration and utilities
import { secureLogger } from '../utils/secureLogger';

/**
 * Security configuration object
 */
export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMIT: {
    WINDOW_MS: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    MAX_REQUESTS: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS) || 100,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    MAX_AGE_DAYS: 90,
  },

  // Session configuration
  SESSION: {
    TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD_MS: 60 * 60 * 1000, // 1 hour
    SECURE_COOKIES: import.meta.env.NODE_ENV === 'production',
  },

  // Input validation
  VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    MAX_EMAIL_LENGTH: 254,
    MAX_PHONE_LENGTH: 20,
    ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    MAX_FILE_SIZE_MB: 10,
  },

  // Encryption settings
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
  },

  // Content Security Policy
  CSP: {
    REPORT_URI: '/api/csp-report',
    ENFORCE: import.meta.env.NODE_ENV === 'production',
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export function validatePasswordStrength(password) {
  const errors = [];
  const config = SECURITY_CONFIG.PASSWORD;

  if (!password || password.length < config.MIN_LENGTH) {
    errors.push(`Password must be at least ${config.MIN_LENGTH} characters long`);
  }

  if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Calculate password strength score
 * @param {string} password - Password to analyze
 * @returns {number} - Strength score from 0-100
 */
function calculatePasswordStrength(password) {
  let score = 0;
  
  if (!password) return 0;

  // Length bonus
  score += Math.min(password.length * 4, 25);

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 5;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

  // Length penalties for short passwords
  if (password.length < 8) score -= 10;
  if (password.length < 6) score -= 15;

  // Repetition penalty
  const repeats = password.match(/(.)\1{2,}/g);
  if (repeats) score -= repeats.length * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Rate limiting tracker
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  /**
   * Check if action is rate limited
   * @param {string} key - Unique identifier (IP, user ID, etc.)
   * @param {string} action - Action type
   * @returns {boolean} - True if rate limited
   */
  isRateLimited(key, action = 'default') {
    const now = Date.now();
    const rateLimitKey = `${key}_${action}`;
    const config = SECURITY_CONFIG.RATE_LIMIT;

    if (!this.attempts.has(rateLimitKey)) {
      this.attempts.set(rateLimitKey, []);
    }

    const userAttempts = this.attempts.get(rateLimitKey);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      timestamp => now - timestamp < config.WINDOW_MS
    );

    this.attempts.set(rateLimitKey, validAttempts);

    // Check if rate limited
    if (validAttempts.length >= config.MAX_REQUESTS) {
      secureLogger.warn(`Rate limit exceeded for key: ${key}, action: ${action}`);
      return true;
    }

    // Add current attempt
    validAttempts.push(now);
    return false;
  }

  /**
   * Clear rate limit for a key
   * @param {string} key - Key to clear
   * @param {string} action - Action type
   */
  clearRateLimit(key, action = 'default') {
    const rateLimitKey = `${key}_${action}`;
    this.attempts.delete(rateLimitKey);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Security event logger
 */
export function logSecurityEvent(event, details = {}) {
  const sanitizedDetails = {
    timestamp: new Date().toISOString(),
    event,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };

  // Remove sensitive information
  delete sanitizedDetails.password;
  delete sanitizedDetails.token;
  delete sanitizedDetails.personnummer;

  secureLogger.warn('SECURITY_EVENT', sanitizedDetails);

  // In production, you might want to send this to a security monitoring service
  if (import.meta.env.NODE_ENV === 'production') {
    // TODO: Send to security monitoring service
    // sendToSecurityService(sanitizedDetails);
  }
}

/**
 * Generate secure random string
 * @param {number} length - Length of string to generate
 * @returns {string} - Random string
 */
export function generateSecureRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

export default SECURITY_CONFIG;
