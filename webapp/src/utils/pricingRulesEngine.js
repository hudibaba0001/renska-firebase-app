/**
 * SwedPrime Pricing Rules Engine
 * Flexible rules engine for complex pricing logic and business rules
 */

// Rule Types
export const RULE_TYPES = {
  DISCOUNT: 'discount',
  MARKUP: 'markup',
  MINIMUM_PRICE: 'minimum_price',
  MAXIMUM_PRICE: 'maximum_price',
  CONDITIONAL: 'conditional',
  BULK_DISCOUNT: 'bulk_discount',
  SEASONAL: 'seasonal',
  TIME_BASED: 'time_based',
  LOCATION_BASED: 'location_based',
  CUSTOMER_BASED: 'customer_based',
  SERVICE_COMBINATION: 'service_combination',
  LOYALTY_DISCOUNT: 'loyalty_discount',
  PROMOTIONAL: 'promotional',
  CUSTOM: 'custom'
};

// Condition Operators
export const OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_THAN_OR_EQUAL: 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL: 'less_than_or_equal',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  IN: 'in',
  NOT_IN: 'not_in',
  BETWEEN: 'between',
  NOT_BETWEEN: 'not_between',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  REGEX: 'regex',
  EXISTS: 'exists',
  NOT_EXISTS: 'not_exists'
};

// Action Types
export const ACTION_TYPES = {
  MULTIPLY: 'multiply',
  ADD: 'add',
  SUBTRACT: 'subtract',
  SET_VALUE: 'set_value',
  PERCENTAGE_DISCOUNT: 'percentage_discount',
  FIXED_DISCOUNT: 'fixed_discount',
  PERCENTAGE_MARKUP: 'percentage_markup',
  FIXED_MARKUP: 'fixed_markup',
  SET_MINIMUM: 'set_minimum',
  SET_MAXIMUM: 'set_maximum',
  ROUND_TO: 'round_to',
  APPLY_FORMULA: 'apply_formula',
  CUSTOM_FUNCTION: 'custom_function'
};

// Rule Priority Levels
export const PRIORITY_LEVELS = {
  HIGHEST: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  LOWEST: 5
};

/**
 * Pricing Rules Engine Class
 */
export class PricingRulesEngine {
  constructor(config = {}) {
    this.config = config;
    this.rules = new Map();
    this.customFunctions = new Map();
    this.executionHistory = [];
    this.debug = config.debug || false;
    
    // Initialize default rule handlers
    this.initializeRuleHandlers();
  }

  /**
   * Initialize default rule handlers
   */
  initializeRuleHandlers() {
    // Discount rule handler
    this.registerRuleHandler(RULE_TYPES.DISCOUNT, (rule, context) => {
      const { action } = rule;
      let discountAmount = 0;
      
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_DISCOUNT:
          discountAmount = context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_DISCOUNT:
          discountAmount = action.value;
          break;
        default:
          discountAmount = 0;
      }
      
      return {
        newPrice: Math.max(0, context.currentPrice - discountAmount),
        appliedDiscount: discountAmount,
        metadata: {
          type: 'discount',
          originalPrice: context.currentPrice,
          discountAmount,
          discountType: action.type
        }
      };
    });

    // Markup rule handler
    this.registerRuleHandler(RULE_TYPES.MARKUP, (rule, context) => {
      const { action } = rule;
      let markupAmount = 0;
      
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_MARKUP:
          markupAmount = context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_MARKUP:
          markupAmount = action.value;
          break;
        default:
          markupAmount = 0;
      }
      
      return {
        newPrice: context.currentPrice + markupAmount,
        appliedMarkup: markupAmount,
        metadata: {
          type: 'markup',
          originalPrice: context.currentPrice,
          markupAmount,
          markupType: action.type
        }
      };
    });

    // Minimum price rule handler
    this.registerRuleHandler(RULE_TYPES.MINIMUM_PRICE, (rule, context) => {
      const minimumPrice = rule.action.value;
      const newPrice = Math.max(context.currentPrice, minimumPrice);
      
      return {
        newPrice,
        metadata: {
          type: 'minimum_price',
          originalPrice: context.currentPrice,
          minimumPrice,
          wasAdjusted: newPrice > context.currentPrice
        }
      };
    });

    // Maximum price rule handler
    this.registerRuleHandler(RULE_TYPES.MAXIMUM_PRICE, (rule, context) => {
      const maximumPrice = rule.action.value;
      const newPrice = Math.min(context.currentPrice, maximumPrice);
      
      return {
        newPrice,
        metadata: {
          type: 'maximum_price',
          originalPrice: context.currentPrice,
          maximumPrice,
          wasAdjusted: newPrice < context.currentPrice
        }
      };
    });

    // Bulk discount rule handler
    this.registerRuleHandler(RULE_TYPES.BULK_DISCOUNT, (rule, context) => {
      const { conditions, action } = rule;
      const area = context.inputData.area || 0;
      
      // Find applicable bulk discount tier
      const bulkTiers = conditions.bulkTiers || [];
      const applicableTier = bulkTiers
        .filter(tier => area >= tier.minArea)
        .sort((a, b) => b.minArea - a.minArea)[0];
      
      if (!applicableTier) {
        return { newPrice: context.currentPrice };
      }
      
      const discountPercentage = applicableTier.discountPercentage || action.value;
      const discountAmount = context.currentPrice * (discountPercentage / 100);
      
      return {
        newPrice: context.currentPrice - discountAmount,
        appliedDiscount: discountAmount,
        metadata: {
          type: 'bulk_discount',
          tier: applicableTier,
          discountPercentage,
          discountAmount
        }
      };
    });

    // Seasonal pricing rule handler
    this.registerRuleHandler(RULE_TYPES.SEASONAL, (rule, context) => {
      const { conditions, action } = rule;
      const currentDate = new Date(context.inputData.date || new Date());
      const currentMonth = currentDate.getMonth() + 1;
      
      // Check if current month is in the seasonal range
      const seasonalMonths = conditions.months || [];
      if (!seasonalMonths.includes(currentMonth)) {
        return { newPrice: context.currentPrice };
      }
      
      let adjustment = 0;
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_MARKUP:
          adjustment = context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.PERCENTAGE_DISCOUNT:
          adjustment = -context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_MARKUP:
          adjustment = action.value;
          break;
        case ACTION_TYPES.FIXED_DISCOUNT:
          adjustment = -action.value;
          break;
      }
      
      return {
        newPrice: context.currentPrice + adjustment,
        appliedAdjustment: adjustment,
        metadata: {
          type: 'seasonal',
          month: currentMonth,
          adjustment,
          adjustmentType: action.type
        }
      };
    });

    // Time-based pricing rule handler
    this.registerRuleHandler(RULE_TYPES.TIME_BASED, (rule, context) => {
      const { conditions, action } = rule;
      const currentDate = new Date(context.inputData.date || new Date());
      const currentHour = currentDate.getHours();
      const currentDay = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check time conditions
      const timeRanges = conditions.timeRanges || [];
      const applicableRange = timeRanges.find(range => {
        const hourInRange = currentHour >= range.startHour && currentHour <= range.endHour;
        const dayInRange = !range.days || range.days.includes(currentDay);
        return hourInRange && dayInRange;
      });
      
      if (!applicableRange) {
        return { newPrice: context.currentPrice };
      }
      
      const multiplier = applicableRange.multiplier || action.value;
      const newPrice = context.currentPrice * multiplier;
      
      return {
        newPrice,
        appliedMultiplier: multiplier,
        metadata: {
          type: 'time_based',
          hour: currentHour,
          day: currentDay,
          range: applicableRange,
          multiplier
        }
      };
    });

    // Location-based pricing rule handler
    this.registerRuleHandler(RULE_TYPES.LOCATION_BASED, (rule, context) => {
      const { conditions, action } = rule;
      const zipCode = context.inputData.zipCode;
      
      if (!zipCode) {
        return { newPrice: context.currentPrice };
      }
      
      // Check location conditions
      const locationRules = conditions.locationRules || [];
      const applicableRule = locationRules.find(locRule => {
        if (locRule.zipCodes && locRule.zipCodes.includes(zipCode)) {
          return true;
        }
        if (locRule.zipRanges) {
          return locRule.zipRanges.some(range => 
            zipCode >= range.start && zipCode <= range.end
          );
        }
        return false;
      });
      
      if (!applicableRule) {
        return { newPrice: context.currentPrice };
      }
      
      let adjustment = 0;
      const adjustmentValue = applicableRule.adjustment || action.value;
      
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_MARKUP:
          adjustment = context.currentPrice * (adjustmentValue / 100);
          break;
        case ACTION_TYPES.PERCENTAGE_DISCOUNT:
          adjustment = -context.currentPrice * (adjustmentValue / 100);
          break;
        case ACTION_TYPES.FIXED_MARKUP:
          adjustment = adjustmentValue;
          break;
        case ACTION_TYPES.FIXED_DISCOUNT:
          adjustment = -adjustmentValue;
          break;
      }
      
      return {
        newPrice: context.currentPrice + adjustment,
        appliedAdjustment: adjustment,
        metadata: {
          type: 'location_based',
          zipCode,
          rule: applicableRule,
          adjustment
        }
      };
    });

    // Service combination rule handler
    this.registerRuleHandler(RULE_TYPES.SERVICE_COMBINATION, (rule, context) => {
      const { conditions, action } = rule;
      const selectedAddOns = context.inputData.addOns || [];
      
      // Check if required service combinations are present
      const requiredCombinations = conditions.requiredCombinations || [];
      const hasRequiredCombination = requiredCombinations.some(combo => {
        return combo.services.every(service => selectedAddOns.includes(service));
      });
      
      if (!hasRequiredCombination) {
        return { newPrice: context.currentPrice };
      }
      
      let adjustment = 0;
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_DISCOUNT:
          adjustment = -context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_DISCOUNT:
          adjustment = -action.value;
          break;
        case ACTION_TYPES.PERCENTAGE_MARKUP:
          adjustment = context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_MARKUP:
          adjustment = action.value;
          break;
      }
      
      return {
        newPrice: context.currentPrice + adjustment,
        appliedAdjustment: adjustment,
        metadata: {
          type: 'service_combination',
          selectedAddOns,
          adjustment
        }
      };
    });

    // Promotional rule handler
    this.registerRuleHandler(RULE_TYPES.PROMOTIONAL, (rule, context) => {
      const { conditions, action } = rule;
      const promoCode = context.inputData.promoCode;
      
      // Check if promo code is valid
      if (!promoCode || !conditions.promoCodes || !conditions.promoCodes.includes(promoCode)) {
        return { newPrice: context.currentPrice };
      }
      
      // Check if promo is still valid (date range)
      const currentDate = new Date();
      if (conditions.validFrom && currentDate < new Date(conditions.validFrom)) {
        return { newPrice: context.currentPrice };
      }
      if (conditions.validUntil && currentDate > new Date(conditions.validUntil)) {
        return { newPrice: context.currentPrice };
      }
      
      let discountAmount = 0;
      switch (action.type) {
        case ACTION_TYPES.PERCENTAGE_DISCOUNT:
          discountAmount = context.currentPrice * (action.value / 100);
          break;
        case ACTION_TYPES.FIXED_DISCOUNT:
          discountAmount = action.value;
          break;
      }
      
      return {
        newPrice: Math.max(0, context.currentPrice - discountAmount),
        appliedDiscount: discountAmount,
        metadata: {
          type: 'promotional',
          promoCode,
          discountAmount
        }
      };
    });
  }

  /**
   * Register a custom rule handler
   */
  registerRuleHandler(ruleType, handler) {
    this.customFunctions.set(ruleType, handler);
  }

  /**
   * Add a pricing rule
   */
  addRule(rule) {
    // Validate rule structure
    if (!this.validateRule(rule)) {
      throw new Error('Invalid rule structure');
    }
    
    // Assign ID if not provided
    if (!rule.id) {
      rule.id = this.generateRuleId();
    }
    
    // Set default priority if not provided
    if (!rule.priority) {
      rule.priority = PRIORITY_LEVELS.MEDIUM;
    }
    
    // Store rule
    this.rules.set(rule.id, rule);
    
    this.log('Rule added:', rule);
    return rule.id;
  }

  /**
   * Remove a pricing rule
   */
  removeRule(ruleId) {
    const removed = this.rules.delete(ruleId);
    this.log('Rule removed:', ruleId, removed);
    return removed;
  }

  /**
   * Update a pricing rule
   */
  updateRule(ruleId, updates) {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }
    
    const updatedRule = { ...existingRule, ...updates };
    
    if (!this.validateRule(updatedRule)) {
      throw new Error('Invalid rule structure after update');
    }
    
    this.rules.set(ruleId, updatedRule);
    this.log('Rule updated:', ruleId, updatedRule);
    return updatedRule;
  }

  /**
   * Get all rules
   */
  getRules() {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    return this.rules.get(ruleId);
  }

  /**
   * Apply all applicable rules to a pricing context
   */
  async applyRules(context) {
    const applicableRules = this.getApplicableRules(context);
    
    // Sort rules by priority (lower number = higher priority)
    applicableRules.sort((a, b) => a.priority - b.priority);
    
    let currentPrice = context.currentPrice;
    const appliedRules = [];
    const executionLog = [];
    
    for (const rule of applicableRules) {
      try {
        const ruleContext = {
          ...context,
          currentPrice,
          appliedRules: [...appliedRules]
        };
        
        const result = await this.executeRule(rule, ruleContext);
        
        if (result && result.newPrice !== undefined) {
          const executionEntry = {
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            originalPrice: currentPrice,
            newPrice: result.newPrice,
            appliedAt: new Date().toISOString(),
            metadata: result.metadata || {}
          };
          
          currentPrice = result.newPrice;
          appliedRules.push(executionEntry);
          executionLog.push(executionEntry);
          
          this.log('Rule applied:', executionEntry);
        }
        
      } catch (error) {
        this.log('Error applying rule:', rule.id, error);
        
        // Continue with other rules unless configured to stop on error
        if (!this.config.continueOnError) {
          throw error;
        }
      }
    }
    
    // Store execution history
    this.executionHistory.push({
      timestamp: new Date().toISOString(),
      originalPrice: context.currentPrice,
      finalPrice: currentPrice,
      appliedRules: appliedRules,
      context: context.inputData
    });
    
    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }
    
    return {
      finalPrice: currentPrice,
      originalPrice: context.currentPrice,
      appliedRules,
      executionLog,
      totalAdjustment: currentPrice - context.currentPrice
    };
  }

  /**
   * Get applicable rules for a given context
   */
  getApplicableRules(context) {
    const applicableRules = [];
    
    for (const rule of this.rules.values()) {
      if (this.isRuleApplicable(rule, context)) {
        applicableRules.push(rule);
      }
    }
    
    return applicableRules;
  }

  /**
   * Check if a rule is applicable to the given context
   */
  isRuleApplicable(rule, context) {
    // Check if rule is enabled
    if (rule.enabled === false) {
      return false;
    }
    
    // Check date range
    const currentDate = new Date();
    if (rule.validFrom && currentDate < new Date(rule.validFrom)) {
      return false;
    }
    if (rule.validUntil && currentDate > new Date(rule.validUntil)) {
      return false;
    }
    
    // Check conditions
    if (!rule.conditions || rule.conditions.length === 0) {
      return true; // No conditions means always applicable
    }
    
    // Evaluate all conditions
    return this.evaluateConditions(rule.conditions, context);
  }

  /**
   * Evaluate rule conditions
   */
  evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    
    // Support for AND/OR logic
    const conditionGroups = Array.isArray(conditions) ? conditions : [conditions];
    
    for (const conditionGroup of conditionGroups) {
      if (conditionGroup.operator === 'OR') {
        // OR logic - at least one condition must be true
        const orResult = conditionGroup.conditions.some(condition => 
          this.evaluateCondition(condition, context)
        );
        if (!orResult) return false;
      } else {
        // AND logic (default) - all conditions must be true
        const andConditions = conditionGroup.conditions || [conditionGroup];
        const andResult = andConditions.every(condition => 
          this.evaluateCondition(condition, context)
        );
        if (!andResult) return false;
      }
    }
    
    return true;
  }

  /**
   * Evaluate a single condition
   */
  evaluateCondition(condition, context) {
    const { field, operator, value } = condition;
    const fieldValue = this.getFieldValue(field, context);
    
    switch (operator) {
      case OPERATORS.EQUALS:
        return fieldValue === value;
      case OPERATORS.NOT_EQUALS:
        return fieldValue !== value;
      case OPERATORS.GREATER_THAN:
        return Number(fieldValue) > Number(value);
      case OPERATORS.LESS_THAN:
        return Number(fieldValue) < Number(value);
      case OPERATORS.GREATER_THAN_OR_EQUAL:
        return Number(fieldValue) >= Number(value);
      case OPERATORS.LESS_THAN_OR_EQUAL:
        return Number(fieldValue) <= Number(value);
      case OPERATORS.CONTAINS:
        return Array.isArray(fieldValue) ? 
          fieldValue.includes(value) : 
          String(fieldValue).includes(value);
      case OPERATORS.NOT_CONTAINS:
        return Array.isArray(fieldValue) ? 
          !fieldValue.includes(value) : 
          !String(fieldValue).includes(value);
      case OPERATORS.IN:
        return Array.isArray(value) ? value.includes(fieldValue) : false;
      case OPERATORS.NOT_IN:
        return Array.isArray(value) ? !value.includes(fieldValue) : true;
      case OPERATORS.BETWEEN:
        return Array.isArray(value) && value.length === 2 ? 
          Number(fieldValue) >= Number(value[0]) && Number(fieldValue) <= Number(value[1]) : 
          false;
      case OPERATORS.NOT_BETWEEN:
        return Array.isArray(value) && value.length === 2 ? 
          Number(fieldValue) < Number(value[0]) || Number(fieldValue) > Number(value[1]) : 
          true;
      case OPERATORS.STARTS_WITH:
        return String(fieldValue).startsWith(String(value));
      case OPERATORS.ENDS_WITH:
        return String(fieldValue).endsWith(String(value));
      case OPERATORS.REGEX:
        const regex = new RegExp(value);
        return regex.test(String(fieldValue));
      case OPERATORS.EXISTS:
        return fieldValue !== null && fieldValue !== undefined;
      case OPERATORS.NOT_EXISTS:
        return fieldValue === null || fieldValue === undefined;
      default:
        return false;
    }
  }

  /**
   * Execute a single rule
   */
  async executeRule(rule, context) {
    const handler = this.customFunctions.get(rule.type);
    
    if (!handler) {
      throw new Error(`No handler found for rule type: ${rule.type}`);
    }
    
    return await handler(rule, context);
  }

  /**
   * Get field value from context
   */
  getFieldValue(field, context) {
    const fieldPath = field.split('.');
    let value = context;
    
    for (const part of fieldPath) {
      value = value?.[part];
    }
    
    return value;
  }

  /**
   * Validate rule structure
   */
  validateRule(rule) {
    if (!rule || typeof rule !== 'object') {
      return false;
    }
    
    // Required fields
    if (!rule.type || !rule.name) {
      return false;
    }
    
    // Validate action
    if (!rule.action || !rule.action.type) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate unique rule ID
   */
  generateRuleId() {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory() {
    this.executionHistory = [];
  }

  /**
   * Export rules configuration
   */
  exportRules() {
    return {
      rules: Array.from(this.rules.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import rules configuration
   */
  importRules(rulesConfig) {
    if (!rulesConfig || !Array.isArray(rulesConfig.rules)) {
      throw new Error('Invalid rules configuration');
    }
    
    // Clear existing rules
    this.rules.clear();
    
    // Import new rules
    for (const rule of rulesConfig.rules) {
      if (this.validateRule(rule)) {
        this.rules.set(rule.id, rule);
      }
    }
    
    this.log('Rules imported:', rulesConfig.rules.length);
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
 * Rule Builder Helper Class
 */
export class RuleBuilder {
  constructor() {
    this.rule = {
      conditions: [],
      action: {}
    };
  }

  /**
   * Set rule basic properties
   */
  setBasicProperties(id, name, type, priority = PRIORITY_LEVELS.MEDIUM) {
    this.rule.id = id;
    this.rule.name = name;
    this.rule.type = type;
    this.rule.priority = priority;
    return this;
  }

  /**
   * Add condition
   */
  addCondition(field, operator, value) {
    this.rule.conditions.push({ field, operator, value });
    return this;
  }

  /**
   * Set action
   */
  setAction(type, value, options = {}) {
    this.rule.action = { type, value, ...options };
    return this;
  }

  /**
   * Set validity period
   */
  setValidityPeriod(validFrom, validUntil) {
    this.rule.validFrom = validFrom;
    this.rule.validUntil = validUntil;
    return this;
  }

  /**
   * Set enabled status
   */
  setEnabled(enabled = true) {
    this.rule.enabled = enabled;
    return this;
  }

  /**
   * Build the rule
   */
  build() {
    return { ...this.rule };
  }
}

/**
 * Utility functions for creating common rules
 */
export const RuleUtils = {
  /**
   * Create a bulk discount rule
   */
  createBulkDiscountRule(name, bulkTiers, priority = PRIORITY_LEVELS.MEDIUM) {
    return new RuleBuilder()
      .setBasicProperties(null, name, RULE_TYPES.BULK_DISCOUNT, priority)
      .setAction(ACTION_TYPES.PERCENTAGE_DISCOUNT, 0) // Will be overridden by tier
      .build();
  },

  /**
   * Create a seasonal pricing rule
   */
  createSeasonalRule(name, months, adjustmentType, adjustmentValue, priority = PRIORITY_LEVELS.MEDIUM) {
    const rule = new RuleBuilder()
      .setBasicProperties(null, name, RULE_TYPES.SEASONAL, priority)
      .setAction(adjustmentType, adjustmentValue)
      .build();
    
    rule.conditions = { months };
    return rule;
  },

  /**
   * Create a promotional discount rule
   */
  createPromotionalRule(name, promoCodes, discountType, discountValue, validFrom, validUntil, priority = PRIORITY_LEVELS.HIGH) {
    const rule = new RuleBuilder()
      .setBasicProperties(null, name, RULE_TYPES.PROMOTIONAL, priority)
      .setAction(discountType, discountValue)
      .setValidityPeriod(validFrom, validUntil)
      .build();
    
    rule.conditions = { promoCodes, validFrom, validUntil };
    return rule;
  },

  /**
   * Create a location-based pricing rule
   */
  createLocationRule(name, zipCodes, adjustmentType, adjustmentValue, priority = PRIORITY_LEVELS.MEDIUM) {
    const rule = new RuleBuilder()
      .setBasicProperties(null, name, RULE_TYPES.LOCATION_BASED, priority)
      .setAction(adjustmentType, adjustmentValue)
      .build();
    
    rule.conditions = {
      locationRules: [{
        zipCodes,
        adjustment: adjustmentValue
      }]
    };
    return rule;
  }
};

/**
 * Factory function to create pricing rules engine instance
 */
export function createPricingRulesEngine(config) {
  return new PricingRulesEngine(config);
}

export default PricingRulesEngine; 