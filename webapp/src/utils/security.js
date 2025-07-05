// Security utilities for input validation and sanitization

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized safe string
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize text input
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Validated and sanitized input
 */
export function validateTextInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  
  const sanitized = sanitizeHtml(input);
  return sanitized.length <= maxLength ? sanitized : sanitized.substring(0, maxLength);
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeHtml(email);
  
  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
}

/**
 * Validate company slug (URL-safe identifier)
 * @param {string} slug - Company slug to validate
 * @returns {boolean} - True if valid slug format
 */
export function validateSlug(slug) {
  if (typeof slug !== 'string') return false;
  
  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

/**
 * Validate numeric input
 * @param {any} value - Value to validate as number
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - True if valid number within range
 */
export function validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= min && num <= max;
}

/**
 * Validate phone number format (Swedish format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Swedish phone format
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const swedishPhoneRegex = /^(\+46|0)[1-9]\d{7,8}$/;
  
  return swedishPhoneRegex.test(cleanPhone);
}

/**
 * Rate limiting check (client-side - should be supplemented with server-side)
 * @param {string} action - Action being performed
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if within rate limit
 */
export function checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
  const key = `rateLimit_${action}`;
  const now = Date.now();
  
  const stored = localStorage.getItem(key);
  const attempts = stored ? JSON.parse(stored) : [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  recentAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(recentAttempts));
  
  return true;
}

/**
 * Sanitize object properties recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = validateTextInput(key, 100);
    if (cleanKey) {
      if (typeof value === 'string') {
        sanitized[cleanKey] = validateTextInput(value, 10000);
      } else if (typeof value === 'object') {
        sanitized[cleanKey] = sanitizeObject(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Create secure form validation rules
 */
export const VALIDATION_RULES = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-åäöÅÄÖ]+$/,
    message: 'Company name must be 2-100 characters, letters and numbers only'
  },
  
  email: {
    required: true,
    maxLength: 254,
    validator: validateEmail,
    message: 'Please enter a valid email address'
  },
  
  slug: {
    required: true,
    minLength: 2,
    maxLength: 50,
    validator: validateSlug,
    message: 'Slug must be 2-50 characters, lowercase letters, numbers, and hyphens only'
  },
  
  phone: {
    required: false,
    validator: validatePhone,
    message: 'Please enter a valid Swedish phone number'
  },
  
  price: {
    required: true,
    min: 0,
    max: 100000,
    validator: (value) => validateNumber(value, 0, 100000),
    message: 'Price must be between 0 and 100,000 SEK'
  }
};

/**
 * Validate form data against rules
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} - { isValid: boolean, errors: object }
 */
export function validateFormData(data, rules) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Check required
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }
    
    // Skip further validation if field is empty and not required
    if (!value && !rule.required) continue;
    
    // Check length
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
      isValid = false;
      continue;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
      isValid = false;
      continue;
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
      isValid = false;
      continue;
    }
    
    // Check custom validator
    if (rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `${field} is invalid`;
      isValid = false;
      continue;
    }
  }
  
  return { isValid, errors };
} 