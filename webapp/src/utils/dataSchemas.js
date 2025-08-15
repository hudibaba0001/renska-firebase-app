/**
 * Centralized Data Schemas for SwedPrime
 * Ensures consistency across all Firestore collections
 */

// ============================================================================
// COMPANY SCHEMA
// ============================================================================

export const COMPANY_SCHEMA = {
  // Basic Information
  name: { type: 'string', required: true, maxLength: 100 },
  slug: { type: 'string', required: true, pattern: /^[a-z0-9-]+$/ },
  address: { type: 'string', required: false, maxLength: 200 },
  orgNumber: { type: 'string', required: false, pattern: /^\d{10,11}$/ },
  
  // Admin Information
  adminName: { type: 'string', required: true, maxLength: 100 },
  adminEmail: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  adminPhone: { type: 'string', required: false, pattern: /^\+?[\d\s-()]+$/ },
  adminUid: { type: 'string', required: true },
  
  // Subscription & Billing
  subscriptionStatus: { 
    type: 'string', 
    required: true, 
    enum: ['pending', 'active', 'suspended', 'cancelled'] 
  },
  subscriptionAmount: { type: 'number', required: false, min: 0 },
  plan: { 
    type: 'string', 
    required: true, 
    enum: ['starter', 'pro', 'enterprise'] 
  },
  
  // Configuration
  rutEnabled: { type: 'boolean', required: true, default: false },
  isPublic: { type: 'boolean', required: true, default: false },
  
  // Timestamps
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

// ============================================================================
// SERVICE SCHEMA
// ============================================================================

export const SERVICE_SCHEMA = {
  // Basic Information
  name: { type: 'string', required: true, maxLength: 100 },
  description: { type: 'string', required: false, maxLength: 500 },
  
  // Pricing Configuration
  pricingModel: { 
    type: 'string', 
    required: true, 
    enum: ['window', 'per-sqm', 'per-room', 'fixed', 'hourly'] 
  },
  minPrice: { type: 'number', required: true, min: 0 },
  
  // Window-specific pricing
  windowTypes: {
    type: 'array',
    required: false,
    items: {
      name: { type: 'string', required: true },
      price: { type: 'number', required: true, min: 0 },
      description: { type: 'string', required: false }
    }
  },
  
  // Add-ons
  addOns: {
    type: 'array',
    required: false,
    items: {
      name: { type: 'string', required: true },
      price: { type: 'number', required: true, min: 0 },
      rutEligible: { type: 'boolean', required: true, default: true }
    }
  },
  
  // Custom fees
  customFees: {
    type: 'array',
    required: false,
    items: {
      name: { type: 'string', required: true },
      amount: { type: 'number', required: true, min: 0 },
      rutEligible: { type: 'boolean', required: true, default: true }
    }
  },
  
  // Timestamps
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

// ============================================================================
// BOOKING SCHEMA
// ============================================================================

export const BOOKING_SCHEMA = {
  // Customer Information
  customerName: { type: 'string', required: true, maxLength: 100 },
  customerEmail: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  customerPhone: { type: 'string', required: false, pattern: /^\+?[\d\s-()]+$/ },
  customerAddress: { type: 'string', required: false, maxLength: 200 },
  personalNumber: { type: 'string', required: false, pattern: /^\d{10,12}$/ },
  
  // Service Details
  service: { type: 'string', required: true }, // Service ID
  serviceName: { type: 'string', required: true, maxLength: 100 },
  
  // Window Configuration (flat structure for easy querying)
  window_0: { type: 'number', required: false, min: 0, default: 0 },
  window_1: { type: 'number', required: false, min: 0, default: 0 },
  window_2: { type: 'number', required: false, min: 0, default: 0 },
  window_3: { type: 'number', required: false, min: 0, default: 0 },
  window_4: { type: 'number', required: false, min: 0, default: 0 },
  window_5: { type: 'number', required: false, min: 0, default: 0 },
  window_6: { type: 'number', required: false, min: 0, default: 0 },
  window_7: { type: 'number', required: false, min: 0, default: 0 },
  
  // Add-ons (flat structure)
  addon_Ladder_needed: { type: 'boolean', required: false, default: false },
  addon_Clean_window_frames: { type: 'boolean', required: false, default: false },
  
  // Scheduling
  customerDate: { type: 'string', required: false, pattern: /^\d{4}-\d{2}-\d{2}$/ },
  customerTime: { type: 'string', required: false, pattern: /^\d{2}:\d{2}$/ },
  
  // Pricing
  totalPrice: { type: 'number', required: true, min: 0 },
  rutApplied: { type: 'boolean', required: true, default: false },
  
  // Status
  status: { 
    type: 'string', 
    required: true, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // GDPR
  gdprConsent: { type: 'boolean', required: true, default: false },
  
  // Timestamps
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

// ============================================================================
// COUPON SCHEMA
// ============================================================================

export const COUPON_SCHEMA = {
  // Basic Information
  code: { type: 'string', required: true, maxLength: 20, pattern: /^[A-Z0-9]+$/ },
  name: { type: 'string', required: true, maxLength: 100 },
  description: { type: 'string', required: false, maxLength: 500 },
  
  // Discount Configuration
  discountType: { 
    type: 'string', 
    required: true, 
    enum: ['percentage', 'fixed'] 
  },
  discountValue: { type: 'number', required: true, min: 0 },
  
  // Usage Limits
  maxUsage: { type: 'number', required: false, min: 1 },
  currentUsage: { type: 'number', required: true, min: 0, default: 0 },
  
  // Validity
  validFrom: { type: 'timestamp', required: true },
  validTo: { type: 'timestamp', required: false },
  isActive: { type: 'boolean', required: true, default: true },
  
  // Service Restrictions
  applicableServices: { type: 'array', required: false, items: { type: 'string' } },
  
  // Timestamps
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate data against schema
 */
export function validateData(data, schema) {
  const errors = [];
  
  for (const [field, config] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required fields
    if (config.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation for undefined optional fields
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (config.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    } else if (config.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    } else if (config.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    } else if (config.type === 'array' && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
    }
    
    // String validations
    if (config.type === 'string' && typeof value === 'string') {
      if (config.maxLength && value.length > config.maxLength) {
        errors.push(`${field} must be ${config.maxLength} characters or less`);
      }
      if (config.pattern && !config.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      if (config.enum && !config.enum.includes(value)) {
        errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
      }
    }
    
    // Number validations
    if (config.type === 'number' && typeof value === 'number') {
      if (config.min !== undefined && value < config.min) {
        errors.push(`${field} must be at least ${config.min}`);
      }
      if (config.max !== undefined && value > config.max) {
        errors.push(`${field} must be at most ${config.max}`);
      }
    }
  }
  
  return errors;
}

/**
 * Sanitize data for Firestore
 */
export function sanitizeData(data, schema) {
  const sanitized = {};
  
  for (const [field, config] of Object.entries(schema)) {
    const value = data[field];
    
    // Apply default values
    if (value === undefined && config.default !== undefined) {
      sanitized[field] = config.default;
    } else if (value !== undefined) {
      sanitized[field] = value;
    }
  }
  
  return sanitized;
}

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export const SCHEMAS = {
  company: COMPANY_SCHEMA,
  service: SERVICE_SCHEMA,
  booking: BOOKING_SCHEMA,
  coupon: COUPON_SCHEMA
}; 