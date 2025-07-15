/**
 * SwedPrime Validation Engine
 * Comprehensive validation system for pricing calculations and form inputs
 */

// Validation Rule Types
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  TYPE: 'type',
  MIN: 'min',
  MAX: 'max',
  RANGE: 'range',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
  ENUM: 'enum',
  ARRAY: 'array',
  OBJECT: 'object',
  CONDITIONAL: 'conditional'
};

// Field Types
export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  DATE: 'date',
  EMAIL: 'email',
  PHONE: 'phone',
  ZIP_CODE: 'zipCode',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  ARRAY: 'array',
  OBJECT: 'object'
};

// Error Severity Levels
export const ERROR_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+46|0)[1-9]\d{8,9}$/,
  ZIP_CODE: /^\d{5}$/,
  CURRENCY: /^\d+(\.\d{2})?$/,
  PERCENTAGE: /^(100|[1-9]?\d)(\.\d+)?$/
};

/**
 * Validation Engine Class
 */
export class ValidationEngine {
  constructor(config = {}) {
    this.config = config;
    this.customValidators = new Map();
    this.fieldSchemas = new Map();
    this.debug = config.debug || false;
    
    // Initialize default validators
    this.initializeDefaultValidators();
  }

  /**
   * Initialize default validation functions
   */
  initializeDefaultValidators() {
    // Required field validator
    this.customValidators.set(VALIDATION_TYPES.REQUIRED, (value, rule) => {
      if (rule.required && (value === null || value === undefined || value === '')) {
        return {
          isValid: false,
          error: rule.message || 'This field is required'
        };
      }
      return { isValid: true };
    });

    // Type validator
    this.customValidators.set(VALIDATION_TYPES.TYPE, (value, rule) => {
      if (value === null || value === undefined) {
        return { isValid: true }; // Skip type validation for null/undefined
      }

      const expectedType = rule.type;
      let isValid = false;

      switch (expectedType) {
        case FIELD_TYPES.STRING:
          isValid = typeof value === 'string';
          break;
        case FIELD_TYPES.NUMBER:
          isValid = typeof value === 'number' && !isNaN(value);
          break;
        case FIELD_TYPES.INTEGER:
          isValid = Number.isInteger(value);
          break;
        case FIELD_TYPES.BOOLEAN:
          isValid = typeof value === 'boolean';
          break;
        case FIELD_TYPES.DATE:
          isValid = value instanceof Date || !isNaN(Date.parse(value));
          break;
        case FIELD_TYPES.EMAIL:
          isValid = typeof value === 'string' && VALIDATION_PATTERNS.EMAIL.test(value);
          break;
        case FIELD_TYPES.PHONE:
          isValid = typeof value === 'string' && VALIDATION_PATTERNS.PHONE.test(value);
          break;
        case FIELD_TYPES.ZIP_CODE:
          isValid = typeof value === 'string' && VALIDATION_PATTERNS.ZIP_CODE.test(value);
          break;
        case FIELD_TYPES.ARRAY:
          isValid = Array.isArray(value);
          break;
        case FIELD_TYPES.OBJECT:
          isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
          break;
        default:
          isValid = true;
      }

      return {
        isValid,
        error: isValid ? null : rule.message || `Expected ${expectedType}, got ${typeof value}`
      };
    });

    // Min/Max validators
    this.customValidators.set(VALIDATION_TYPES.MIN, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      const numValue = Number(value);
      const isValid = !isNaN(numValue) && numValue >= rule.min;
      
      return {
        isValid,
        error: isValid ? null : rule.message || `Value must be at least ${rule.min}`
      };
    });

    this.customValidators.set(VALIDATION_TYPES.MAX, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      const numValue = Number(value);
      const isValid = !isNaN(numValue) && numValue <= rule.max;
      
      return {
        isValid,
        error: isValid ? null : rule.message || `Value must be at most ${rule.max}`
      };
    });

    // Range validator
    this.customValidators.set(VALIDATION_TYPES.RANGE, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      const numValue = Number(value);
      const isValid = !isNaN(numValue) && numValue >= rule.min && numValue <= rule.max;
      
      return {
        isValid,
        error: isValid ? null : rule.message || `Value must be between ${rule.min} and ${rule.max}`
      };
    });

    // Pattern validator
    this.customValidators.set(VALIDATION_TYPES.PATTERN, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      const isValid = pattern.test(String(value));
      
      return {
        isValid,
        error: isValid ? null : rule.message || 'Value does not match the required pattern'
      };
    });

    // Enum validator
    this.customValidators.set(VALIDATION_TYPES.ENUM, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      const isValid = rule.values.includes(value);
      
      return {
        isValid,
        error: isValid ? null : rule.message || `Value must be one of: ${rule.values.join(', ')}`
      };
    });

    // Array validator
    this.customValidators.set(VALIDATION_TYPES.ARRAY, (value, rule) => {
      if (value === null || value === undefined) return { isValid: true };
      
      if (!Array.isArray(value)) {
        return {
          isValid: false,
          error: rule.message || 'Value must be an array'
        };
      }

      // Validate array length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return {
          isValid: false,
          error: rule.message || `Array must have at least ${rule.minLength} items`
        };
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return {
          isValid: false,
          error: rule.message || `Array must have at most ${rule.maxLength} items`
        };
      }

      // Validate array items if itemSchema is provided
      if (rule.itemSchema) {
        const errors = [];
        for (let i = 0; i < value.length; i++) {
          const itemValidation = this.validateValue(value[i], rule.itemSchema);
          if (!itemValidation.isValid) {
            errors.push(`Item ${i}: ${itemValidation.error}`);
          }
        }
        
        if (errors.length > 0) {
          return {
            isValid: false,
            error: rule.message || errors.join(', ')
          };
        }
      }

      return { isValid: true };
    });

    // Conditional validator
    this.customValidators.set(VALIDATION_TYPES.CONDITIONAL, (value, rule, allData) => {
      // Check if condition is met
      const conditionMet = this.evaluateCondition(rule.condition, allData);
      
      if (!conditionMet) {
        return { isValid: true }; // Skip validation if condition not met
      }

      // Apply conditional validation rules
      const validationResult = this.validateValue(value, rule.rules, allData);
      
      return {
        isValid: validationResult.isValid,
        error: validationResult.error
      };
    });
  }

  /**
   * Register a custom validator
   */
  registerValidator(name, validatorFunction) {
    this.customValidators.set(name, validatorFunction);
  }

  /**
   * Register a field schema
   */
  registerFieldSchema(fieldName, schema) {
    this.fieldSchemas.set(fieldName, schema);
  }

  /**
   * Validate a single value against rules
   */
  validateValue(value, rules, allData = {}) {
    if (!rules || (Array.isArray(rules) && rules.length === 0)) {
      return { isValid: true };
    }

    const ruleArray = Array.isArray(rules) ? rules : [rules];
    const errors = [];

    for (const rule of ruleArray) {
      const validator = this.customValidators.get(rule.type);
      
      if (!validator) {
        this.log(`Unknown validation type: ${rule.type}`);
        continue;
      }

      const result = validator(value, rule, allData);
      
      if (!result.isValid) {
        errors.push({
          type: rule.type,
          message: result.error,
          level: rule.level || ERROR_LEVELS.ERROR
        });
        
        // Stop on first error unless continueOnError is true
        if (!rule.continueOnError) {
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      error: errors.length > 0 ? errors[0].message : null
    };
  }

  /**
   * Validate an entire object against a schema
   */
  validateObject(data, schema) {
    const result = {
      isValid: true,
      errors: {},
      fieldErrors: {},
      warnings: {},
      summary: {
        totalFields: 0,
        validFields: 0,
        errorFields: 0,
        warningFields: 0
      }
    };

    if (!schema || typeof schema !== 'object') {
      return result;
    }

    // Validate each field in the schema
    for (const [fieldName, fieldRules] of Object.entries(schema)) {
      result.summary.totalFields++;
      
      const fieldValue = this.getNestedValue(data, fieldName);
      const validation = this.validateValue(fieldValue, fieldRules, data);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors[fieldName] = validation.errors;
        result.fieldErrors[fieldName] = validation.error;
        result.summary.errorFields++;
      } else {
        result.summary.validFields++;
      }

      // Check for warnings
      const warnings = validation.errors?.filter(e => e.level === ERROR_LEVELS.WARNING) || [];
      if (warnings.length > 0) {
        result.warnings[fieldName] = warnings;
        result.summary.warningFields++;
      }
    }

    return result;
  }

  /**
   * Validate pricing input data
   */
  validatePricingInput(inputData) {
    const pricingSchema = {
      'service': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.OBJECT }
      ],
      'service.id': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'service.pricingModel': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'area': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.NUMBER },
        { type: VALIDATION_TYPES.RANGE, min: 1, max: 1000 }
      ],
      'rooms': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.INTEGER },
        { type: VALIDATION_TYPES.RANGE, min: 1, max: 50 }
      ],
      'frequency': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING },
        { 
          type: VALIDATION_TYPES.ENUM, 
          values: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] 
        }
      ],
      'zipCode': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.ZIP_CODE }
      ],
      'addOns': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.ARRAY },
        { 
          type: VALIDATION_TYPES.ARRAY, 
          itemSchema: [
            { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
          ]
        }
      ],
      'useRut': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.BOOLEAN }
      ],
      'date': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.DATE }
      ]
    };

    return this.validateObject(inputData, pricingSchema);
  }

  /**
   * Validate service configuration
   */
  validateServiceConfig(serviceConfig) {
    const serviceSchema = {
      'id': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'name': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'pricingModel': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'pricingConfig': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.OBJECT }
      ],
      'enabled': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.BOOLEAN }
      ]
    };

    return this.validateObject(serviceConfig, serviceSchema);
  }

  /**
   * Validate customer information
   */
  validateCustomerInfo(customerInfo) {
    const customerSchema = {
      'name': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING },
        { type: VALIDATION_TYPES.MIN, min: 2 }
      ],
      'email': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.EMAIL }
      ],
      'phone': [
        { type: VALIDATION_TYPES.REQUIRED, required: true },
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.PHONE }
      ],
      'address': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.STRING }
      ],
      'zipCode': [
        { type: VALIDATION_TYPES.TYPE, type: FIELD_TYPES.ZIP_CODE }
      ]
    };

    return this.validateObject(customerInfo, customerSchema);
  }

  /**
   * Evaluate a condition for conditional validation
   */
  evaluateCondition(condition, data) {
    if (!condition) return true;

    const { field, operator, value } = condition;
    const fieldValue = this.getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(value);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(value);
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(value) : String(fieldValue).includes(value);
      case 'in':
        return Array.isArray(value) ? value.includes(fieldValue) : false;
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined;
      case 'not_exists':
        return fieldValue === null || fieldValue === undefined;
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    if (!path || !obj) return obj;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Sanitize input data
   */
  sanitizeInput(data, schema = {}) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      const fieldSchema = schema[key];
      
      if (fieldSchema && fieldSchema.sanitize) {
        sanitized[key] = this.sanitizeValue(value, fieldSchema.sanitize);
      } else {
        sanitized[key] = this.defaultSanitize(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitize a single value
   */
  sanitizeValue(value, sanitizeRules) {
    let sanitized = value;
    
    if (sanitizeRules.trim && typeof sanitized === 'string') {
      sanitized = sanitized.trim();
    }
    
    if (sanitizeRules.toLowerCase && typeof sanitized === 'string') {
      sanitized = sanitized.toLowerCase();
    }
    
    if (sanitizeRules.toUpperCase && typeof sanitized === 'string') {
      sanitized = sanitized.toUpperCase();
    }
    
    if (sanitizeRules.removeSpecialChars && typeof sanitized === 'string') {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    if (sanitizeRules.maxLength && typeof sanitized === 'string') {
      sanitized = sanitized.substring(0, sanitizeRules.maxLength);
    }
    
    return sanitized;
  }

  /**
   * Default sanitization
   */
  defaultSanitize(value) {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }

  /**
   * Create validation summary
   */
  createValidationSummary(validationResults) {
    const summary = {
      isValid: true,
      totalErrors: 0,
      totalWarnings: 0,
      fieldSummary: {},
      errorsByType: {},
      warningsByType: {}
    };

    for (const [fieldName, result] of Object.entries(validationResults)) {
      if (result.errors && result.errors.length > 0) {
        summary.isValid = false;
        summary.totalErrors += result.errors.length;
        
        summary.fieldSummary[fieldName] = {
          isValid: false,
          errorCount: result.errors.length,
          warningCount: 0
        };

        // Group errors by type
        for (const error of result.errors) {
          if (error.level === ERROR_LEVELS.ERROR) {
            summary.errorsByType[error.type] = (summary.errorsByType[error.type] || 0) + 1;
          } else if (error.level === ERROR_LEVELS.WARNING) {
            summary.totalWarnings++;
            summary.warningsByType[error.type] = (summary.warningsByType[error.type] || 0) + 1;
            summary.fieldSummary[fieldName].warningCount++;
          }
        }
      } else {
        summary.fieldSummary[fieldName] = {
          isValid: true,
          errorCount: 0,
          warningCount: 0
        };
      }
    }

    return summary;
  }

  /**
   * Debug logging
   */
  log(...args) {
    if (this.debug) {
      // Debug logging handled by constructor debug flag
    }
  }
}

/**
 * Validation utility functions
 */
export const ValidationUtils = {
  /**
   * Create a validation rule
   */
  createRule(type, options = {}) {
    return {
      type,
      ...options
    };
  },

  /**
   * Create a required rule
   */
  required(message) {
    return {
      type: VALIDATION_TYPES.REQUIRED,
      required: true,
      message
    };
  },

  /**
   * Create a type rule
   */
  type(fieldType, message) {
    return {
      type: VALIDATION_TYPES.TYPE,
      type: fieldType,
      message
    };
  },

  /**
   * Create a range rule
   */
  range(min, max, message) {
    return {
      type: VALIDATION_TYPES.RANGE,
      min,
      max,
      message
    };
  },

  /**
   * Create an enum rule
   */
  enum(values, message) {
    return {
      type: VALIDATION_TYPES.ENUM,
      values,
      message
    };
  },

  /**
   * Create a pattern rule
   */
  pattern(pattern, message) {
    return {
      type: VALIDATION_TYPES.PATTERN,
      pattern,
      message
    };
  },

  /**
   * Create a conditional rule
   */
  conditional(condition, rules, message) {
    return {
      type: VALIDATION_TYPES.CONDITIONAL,
      condition,
      rules,
      message
    };
  }
};

/**
 * Factory function to create validation engine instance
 */
export function createValidationEngine(config) {
  return new ValidationEngine(config);
}

export default ValidationEngine; 