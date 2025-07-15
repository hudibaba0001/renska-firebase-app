/**
 * SwedPrime Advanced Pricing Engine
 * Comprehensive pricing calculation system with multiple models, validation, and rules engine
 */

// Pricing Models
export const PRICING_MODELS = {
  FLAT_RATE: 'flat_rate',
  PER_SQM_TIERED: 'per_sqm_tiered',
  PER_ROOM: 'per_room',
  HOURLY_BY_SIZE: 'hourly_by_size',
  WINDOW_BASED: 'window_based',
  FLAT_RANGE: 'flat_range',
  BULK_DISCOUNT: 'bulk_discount',
  DYNAMIC_PRICING: 'dynamic_pricing'
};

// Validation Rules
export const VALIDATION_RULES = {
  area: {
    min: 1,
    max: 1000,
    required: true,
    type: 'number'
  },
  rooms: {
    min: 1,
    max: 50,
    required: false,
    type: 'number'
  },
  frequency: {
    required: true,
    type: 'string',
    allowedValues: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
  },
  zipCode: {
    required: false,
    type: 'string',
    pattern: /^\d{5}$/
  }
};

// Error Types
export const PRICING_ERRORS = {
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  INVALID_SERVICE: 'INVALID_SERVICE',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

/**
 * Enhanced Pricing Calculator Class
 */
export class PricingEngine {
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
    this.validationRules = { ...VALIDATION_RULES, ...config.validationRules };
    this.debug = config.debug || false;
    
    // ----------------------------------------------------------------------
    // Extension processors pipeline (Phase-1: no-op)
    // Array of async functions that receive (priceObject, inputData) and must
    // return either the same object or a modified clone.  This scaffolding
    // lets us plug in future promo / surge / loyalty processors without
    // modifying core logic.
    this.extensionProcessors = [];
    // ----------------------------------------------------------------------
    
    // Initialize pricing models
    this.pricingModels = {
      [PRICING_MODELS.FLAT_RATE]: this.calculateFlatRate.bind(this),
      [PRICING_MODELS.PER_SQM_TIERED]: this.calculateTieredPricing.bind(this),
      [PRICING_MODELS.PER_ROOM]: this.calculatePerRoom.bind(this),
      [PRICING_MODELS.HOURLY_BY_SIZE]: this.calculateHourlyBySize.bind(this),
      [PRICING_MODELS.WINDOW_BASED]: this.calculateWindowBased.bind(this),
      [PRICING_MODELS.FLAT_RANGE]: this.calculateFlatRange.bind(this),
      [PRICING_MODELS.BULK_DISCOUNT]: this.calculateBulkDiscount.bind(this),
      [PRICING_MODELS.DYNAMIC_PRICING]: this.calculateDynamicPricing.bind(this)
    };
  }

  /**
   * Register an extension processor (Phase-2: promo, holiday, etc.)
   * @param {string} type - A label for the processor (for debugging)
   * @param {function} fn - Async function (result, inputData) => result
   */
  registerProcessor(type, fn) {
    this.extensionProcessors.push({ type, fn });
  }

  /**
   * Main calculation method
   */
  async calculatePrice(inputData) {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(inputData);
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        this.log('Cache hit for calculation');
        return this.cache.get(cacheKey);
      }

      // Validate input data
      const validation = this.validateInput(inputData);
      if (!validation.isValid) {
        throw new PricingError(PRICING_ERRORS.VALIDATION_ERROR, validation.errors);
      }

      // Normalize input data
      const normalizedData = this.normalizeInput(inputData);
      
      // Calculate base price
      const basePrice = await this.calculateBasePrice(normalizedData);
      
      // Apply modifiers (frequency, add-ons, discounts, etc.)
      const modifiedPrice = await this.applyModifiers(basePrice, normalizedData);
      
      // Apply rules engine
      const finalPrice = await this.applyPricingRules(modifiedPrice, normalizedData);
      
      // Create result object
      const result = {
        basePrice: basePrice.amount,
        totalPrice: finalPrice.amount,
        breakdown: finalPrice.breakdown,
        discounts: finalPrice.discounts || [],
        addOns: finalPrice.addOns || [],
        taxes: finalPrice.taxes || [],
        metadata: {
          calculatedAt: new Date().toISOString(),
          cacheKey,
          inputData: normalizedData,
          pricingModel: normalizedData.service?.pricingModel
        }
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      this.log('Price calculation completed:', result);

      // ----------------------------------------------------------------------
      // Extension processors pipeline (Phase-1: no-op)
      // Each processor can modify the result (e.g. promo, holiday, loyalty)
      let processedResult = result;
      for (const { type, fn } of this.extensionProcessors) {
        this.log(`Running extension processor: ${type}`);
        processedResult = await fn(processedResult, inputData);
      }
      // ----------------------------------------------------------------------
      return processedResult;

    } catch (error) {
      this.log('Price calculation error:', error);
      throw error;
    }
  }

  /**
   * Input validation
   */
  validateInput(inputData) {
    const errors = [];
    
    // Check required fields
    if (!inputData.service) {
      errors.push({ field: 'service', message: 'Service is required' });
    }
    
    if (!inputData.area || inputData.area <= 0) {
      errors.push({ field: 'area', message: 'Valid area is required' });
    }
    
    // Validate area range
    if (inputData.area && (inputData.area < this.validationRules.area.min || inputData.area > this.validationRules.area.max)) {
      errors.push({ 
        field: 'area', 
        message: `Area must be between ${this.validationRules.area.min} and ${this.validationRules.area.max}` 
      });
    }
    
    // Validate frequency
    if (inputData.frequency && !this.validationRules.frequency.allowedValues.includes(inputData.frequency)) {
      errors.push({ 
        field: 'frequency', 
        message: `Invalid frequency. Allowed values: ${this.validationRules.frequency.allowedValues.join(', ')}` 
      });
    }
    
    // Validate ZIP code if provided
    if (inputData.zipCode && !this.validationRules.zipCode.pattern.test(inputData.zipCode)) {
      errors.push({ 
        field: 'zipCode', 
        message: 'Invalid ZIP code format' 
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalize input data
   */
  normalizeInput(inputData) {
    return {
      service: inputData.service,
      area: Number(inputData.area),
      rooms: Number(inputData.rooms) || null,
      frequency: inputData.frequency || 'monthly',
      zipCode: inputData.zipCode || null,
      addOns: inputData.addOns || [],
      windowCleaning: inputData.windowCleaning || null,
      useRut: Boolean(inputData.useRut),
      customFields: inputData.customFields || {},
      date: inputData.date || new Date().toISOString()
    };
  }

  /**
   * Calculate base price using the service's pricing model
   */
  async calculateBasePrice(inputData) {
    const { service } = inputData;
    
    if (!service || !service.pricingModel) {
      throw new PricingError(PRICING_ERRORS.INVALID_SERVICE, 'Service or pricing model not specified');
    }
    
    const calculator = this.pricingModels[service.pricingModel];
    if (!calculator) {
      throw new PricingError(PRICING_ERRORS.INVALID_SERVICE, `Unsupported pricing model: ${service.pricingModel}`);
    }
    
    const basePrice = await calculator(inputData);
    
    return {
      amount: basePrice,
      model: service.pricingModel,
      breakdown: {
        base: basePrice,
        area: inputData.area,
        rooms: inputData.rooms
      }
    };
  }

  /**
   * Flat rate pricing model
   */
  calculateFlatRate(inputData) {
    const { service, area } = inputData;
    const pricePerSqm = service.pricingConfig?.pricePerSqm || service.pricePerSqm || 0;
    
    return Math.round(area * pricePerSqm);
  }

  /**
   * Tiered pricing model
   */
  calculateTieredPricing(inputData) {
    const { service, area } = inputData;
    const tiers = service.pricingConfig?.tiers || [];
    
    if (!tiers.length) {
      throw new PricingError(PRICING_ERRORS.INVALID_SERVICE, 'No pricing tiers configured');
    }
    
    // Find the appropriate tier
    const tier = tiers.find(t => area >= t.minArea && area <= t.maxArea);
    
    if (!tier) {
      throw new PricingError(PRICING_ERRORS.OUT_OF_RANGE, `No pricing tier found for area ${area} sqm`);
    }
    
    // Calculate price based on tier type
    if (tier.type === 'per_sqm') {
      return Math.round(area * tier.pricePerSqm);
    } else if (tier.type === 'flat_rate') {
      return tier.price;
    } else {
      // Default to flat rate
      return tier.price || Math.round(area * (tier.pricePerSqm || 0));
    }
  }

  /**
   * Per room pricing model
   */
  calculatePerRoom(inputData) {
    const { service, rooms, area } = inputData;
    const roomTypes = service.pricingConfig?.roomTypes || {};
    
    // If specific room types are provided, use them
    if (inputData.roomBreakdown && Object.keys(inputData.roomBreakdown).length > 0) {
      let total = 0;
      for (const [roomType, count] of Object.entries(inputData.roomBreakdown)) {
        const roomPrice = roomTypes[roomType]?.price || 0;
        total += roomPrice * count;
      }
      return Math.round(total);
    }
    
    // Otherwise, use room count or estimate from area
    const roomCount = rooms || Math.max(1, Math.floor(area / 25)); // Estimate: 25 sqm per room
    const pricePerRoom = service.pricingConfig?.pricePerRoom || 300;
    
    return Math.round(roomCount * pricePerRoom);
  }

  /**
   * Hourly by size pricing model
   */
  calculateHourlyBySize(inputData) {
    const { service, area } = inputData;
    const hourRates = service.pricingConfig?.hourRates || [];
    
    if (!hourRates.length) {
      throw new PricingError(PRICING_ERRORS.INVALID_SERVICE, 'No hourly rates configured');
    }
    
    // Find the appropriate rate
    const rate = hourRates.find(r => area >= r.minArea && area <= r.maxArea);
    
    if (!rate) {
      throw new PricingError(PRICING_ERRORS.OUT_OF_RANGE, `No hourly rate found for area ${area} sqm`);
    }
    
    return Math.round(rate.hours * rate.pricePerHour);
  }

  /**
   * Window-based pricing model
   */
  calculateWindowBased(inputData) {
    const { service, windowCleaning } = inputData;
    
    if (!windowCleaning) {
      return 0;
    }
    
    const windowPrices = service.pricingConfig?.windowPrices || {};
    let total = 0;
    
    // Calculate based on window quantities
    for (const [windowType, quantity] of Object.entries(windowCleaning)) {
      const price = windowPrices[windowType] || 0;
      total += price * quantity;
    }
    
    // Apply minimum charge if configured
    const minimumCharge = service.pricingConfig?.minimumCharge || 0;
    
    return Math.round(Math.max(total, minimumCharge));
  }

  /**
   * Flat range pricing model
   */
  calculateFlatRange(inputData) {
    const { service, area } = inputData;
    const ranges = service.pricingConfig?.ranges || [];
    
    if (!ranges.length) {
      throw new PricingError(PRICING_ERRORS.INVALID_SERVICE, 'No pricing ranges configured');
    }
    
    // Find the appropriate range
    const range = ranges.find(r => area >= r.minArea && area <= r.maxArea);
    
    if (!range) {
      throw new PricingError(PRICING_ERRORS.OUT_OF_RANGE, `No pricing range found for area ${area} sqm`);
    }
    
    return range.price;
  }

  /**
   * Bulk discount pricing model
   */
  calculateBulkDiscount(inputData) {
    const { service, area } = inputData;
    const basePrice = area * (service.pricingConfig?.basePrice || 10);
    const discounts = service.pricingConfig?.bulkDiscounts || [];
    
    // Find applicable discount
    const discount = discounts
      .filter(d => area >= d.minArea)
      .sort((a, b) => b.minArea - a.minArea)[0]; // Get the highest applicable discount
    
    if (discount) {
      const discountAmount = basePrice * (discount.percentage / 100);
      return Math.round(basePrice - discountAmount);
    }
    
    return Math.round(basePrice);
  }

  /**
   * Dynamic pricing model (time-based, demand-based, etc.)
   */
  calculateDynamicPricing(inputData) {
    const { service, date } = inputData;
    const basePrice = this.calculateFlatRate(inputData);
    const dynamicConfig = service.pricingConfig?.dynamicPricing || {};
    
    let multiplier = 1;
    
    // Time-based pricing
    if (dynamicConfig.timeBasedPricing) {
      const hour = new Date(date).getHours();
      const timeMultiplier = dynamicConfig.timeBasedPricing.find(
        t => hour >= t.startHour && hour <= t.endHour
      )?.multiplier || 1;
      multiplier *= timeMultiplier;
    }
    
    // Seasonal pricing
    if (dynamicConfig.seasonalPricing) {
      const month = new Date(date).getMonth() + 1;
      const seasonMultiplier = dynamicConfig.seasonalPricing.find(
        s => s.months.includes(month)
      )?.multiplier || 1;
      multiplier *= seasonMultiplier;
    }
    
    // Demand-based pricing (would require real-time data)
    if (dynamicConfig.demandBasedPricing) {
      // This would integrate with booking data to adjust prices based on demand
      // For now, we'll use a simple random multiplier as a placeholder
      multiplier *= dynamicConfig.demandBasedPricing.baseMultiplier || 1;
    }
    
    return Math.round(basePrice * multiplier);
  }

  /**
   * Apply modifiers (frequency, add-ons, etc.)
   */
  async applyModifiers(basePrice, inputData) {
    let total = basePrice.amount;
    const breakdown = { ...basePrice.breakdown };
    const addOns = [];
    const discounts = [];
    
    // Apply frequency multiplier
    if (inputData.frequency) {
      const frequencyMultiplier = this.config.frequencyMultipliers?.[inputData.frequency] || 1;
      if (frequencyMultiplier !== 1) {
        const frequencyAdjustment = total * (frequencyMultiplier - 1);
        total += frequencyAdjustment;
        breakdown.frequency = {
          multiplier: frequencyMultiplier,
          adjustment: frequencyAdjustment
        };
      }
    }
    
    // Apply add-ons
    if (inputData.addOns && inputData.addOns.length > 0) {
      const addOnPrices = this.config.addOnPrices || {};
      for (const addOn of inputData.addOns) {
        const price = addOnPrices[addOn] || 0;
        if (price > 0) {
          total += price;
          addOns.push({
            name: addOn,
            price: price
          });
        }
      }
      breakdown.addOns = addOns.reduce((sum, addon) => sum + addon.price, 0);
    }
    
    // Apply window cleaning
    if (inputData.windowCleaning) {
      const windowPrice = this.calculateWindowBased(inputData);
      if (windowPrice > 0) {
        total += windowPrice;
        breakdown.windowCleaning = windowPrice;
      }
    }
    
    // Apply RUT discount
    if (inputData.useRut && inputData.zipCode) {
      const rutEligible = this.isRutEligible(inputData.zipCode);
      if (rutEligible) {
        const rutPercentage = this.config.rutPercentage || 0.3;
        const rutDiscount = total * rutPercentage;
        total -= rutDiscount;
        discounts.push({
          type: 'RUT',
          percentage: rutPercentage * 100,
          amount: rutDiscount
        });
        breakdown.rutDiscount = -rutDiscount;
      }
    }
    
    return {
      amount: Math.round(total),
      breakdown,
      addOns,
      discounts
    };
  }

  /**
   * Apply pricing rules engine
   */
  async applyPricingRules(price, inputData) {
    const rules = this.config.pricingRules || [];
    let finalPrice = { ...price };
    
    for (const rule of rules) {
      if (this.evaluateRule(rule, inputData, finalPrice)) {
        finalPrice = this.applyRule(rule, finalPrice, inputData);
      }
    }
    
    return finalPrice;
  }

  /**
   * Evaluate if a pricing rule should be applied
   */
  evaluateRule(rule, inputData, currentPrice) {
    const { conditions } = rule;
    
    if (!conditions || conditions.length === 0) {
      return true;
    }
    
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const fieldValue = this.getFieldValue(field, inputData, currentPrice);
      
      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'not_equals':
          return fieldValue !== value;
        case 'greater_than':
          return fieldValue > value;
        case 'less_than':
          return fieldValue < value;
        case 'greater_than_or_equal':
          return fieldValue >= value;
        case 'less_than_or_equal':
          return fieldValue <= value;
        case 'contains':
          return Array.isArray(fieldValue) ? fieldValue.includes(value) : String(fieldValue).includes(value);
        case 'in':
          return Array.isArray(value) ? value.includes(fieldValue) : false;
        default:
          return false;
      }
    });
  }

  /**
   * Apply a pricing rule
   */
  applyRule(rule, currentPrice, inputData) {
    const { action } = rule;
    let newPrice = { ...currentPrice };
    
    switch (action.type) {
      case 'multiply':
        newPrice.amount = Math.round(newPrice.amount * action.value);
        break;
      case 'add':
        newPrice.amount += action.value;
        break;
      case 'subtract':
        newPrice.amount = Math.max(0, newPrice.amount - action.value);
        break;
      case 'set_minimum':
        newPrice.amount = Math.max(newPrice.amount, action.value);
        break;
      case 'set_maximum':
        newPrice.amount = Math.min(newPrice.amount, action.value);
        break;
      case 'discount_percentage':
        const discountAmount = newPrice.amount * (action.value / 100);
        newPrice.amount -= discountAmount;
        newPrice.discounts = newPrice.discounts || [];
        newPrice.discounts.push({
          type: rule.name || 'Rule Discount',
          percentage: action.value,
          amount: discountAmount
        });
        break;
    }
    
    return newPrice;
  }

  /**
   * Get field value for rule evaluation
   */
  getFieldValue(field, inputData, currentPrice) {
    const fieldPath = field.split('.');
    let value = fieldPath[0] === 'price' ? currentPrice : inputData;
    
    for (const part of fieldPath) {
      value = value?.[part];
    }
    
    return value;
  }

  /**
   * Check if ZIP code is eligible for RUT discount
   */
  isRutEligible(zipCode) {
    const rutEligibleZips = this.config.rutEligibleZips || [];
    return rutEligibleZips.includes(zipCode);
  }

  /**
   * Generate cache key for pricing calculation
   */
  generateCacheKey(inputData) {
    const keyData = {
      service: inputData.service?.id,
      area: inputData.area,
      rooms: inputData.rooms,
      frequency: inputData.frequency,
      addOns: inputData.addOns?.sort(),
      zipCode: inputData.zipCode,
      useRut: inputData.useRut,
      date: inputData.date ? new Date(inputData.date).toDateString() : null
    };
    
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Clear pricing cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
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
 * Custom error class for pricing errors
 */
export class PricingError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'PricingError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Utility functions
 */
export const PricingUtils = {
  /**
   * Format price for display
   */
  formatPrice(amount, currency = 'SEK') {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Calculate percentage
   */
  calculatePercentage(amount, percentage) {
    return Math.round(amount * (percentage / 100));
  },

  /**
   * Calculate tax amount
   */
  calculateTax(amount, taxRate) {
    return Math.round(amount * (taxRate / 100));
  },

  /**
   * Round to nearest currency unit
   */
  roundPrice(amount, precision = 0) {
    return Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision);
  }
};

/**
 * Factory function to create pricing engine instance
 */
export function createPricingEngine(config) {
  return new PricingEngine(config);
}

export default PricingEngine; 