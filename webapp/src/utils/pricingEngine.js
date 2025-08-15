/**
 * Centralized Pricing Engine for SwedPrime
 * Handles all pricing calculations for Swedish cleaning services
 */

import { logger } from './logger.js';
import { errorHandler, ERROR_TYPES, ERROR_SEVERITY } from './errorHandler.js';

// ============================================================================
// PRICING MODELS
// ============================================================================

export const PRICING_MODELS = {
  WINDOW: 'window',
  PER_SQM: 'per-sqm',
  PER_ROOM: 'per-room',
  FIXED: 'fixed',
  HOURLY: 'hourly'
};

// ============================================================================
// WINDOW TYPES (Swedish Industry Standard)
// ============================================================================

export const WINDOW_TYPES = {
  0: { name: 'Utan ramar - två sidor', price: 90 },
  1: { name: 'Utan ramar - fyra sidor', price: 90 },
  2: { name: 'Med ramar - två sidor', price: 120 },
  3: { name: 'Med ramar - fyra sidor', price: 120 },
  4: { name: 'Balkongfönster - två sidor', price: 150 },
  5: { name: 'Balkongfönster - fyra sidor', price: 150 },
  6: { name: 'Terrassdörrar - två sidor', price: 200 },
  7: { name: 'Terrassdörrar - fyra sidor', price: 250 }
};

// ============================================================================
// ADD-ON PRICES (Swedish Industry Standard)
// ============================================================================

export const ADDON_PRICES = {
  'Ladder needed': 500,
  'Clean window frames': 500,
  'Karmtvätt': 500,
  'Stege behövs': 500
};

// ============================================================================
// RUT CONFIGURATION
// ============================================================================

export const RUT_CONFIG = {
  PERCENTAGE: 0.30, // 30% RUT deduction
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 50000 // Annual limit
};

// ============================================================================
// PRICING ENGINE CLASS
// ============================================================================

export class PricingEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Calculate total price for a booking
   */
  calculateBookingPrice(bookingData, serviceConfig) {
    try {
      logger.debug('Starting price calculation', { 
        serviceType: serviceConfig.pricingModel,
        hasWindows: this.hasWindowData(bookingData),
        hasAddons: this.hasAddonData(bookingData)
      });

      let basePrice = 0;
      let breakdown = {};

      // Calculate base service price
      switch (serviceConfig.pricingModel) {
        case PRICING_MODELS.WINDOW: {
          const windowResult = this.calculateWindowPrice(bookingData);
          basePrice = windowResult.total;
          breakdown.windows = windowResult;
          break;
        }

        case PRICING_MODELS.PER_SQM:
          basePrice = this.calculatePerSqmPrice(bookingData, serviceConfig);
          breakdown.area = bookingData.area;
          breakdown.pricePerSqm = serviceConfig.pricePerSqm || 50;
          break;

        case PRICING_MODELS.PER_ROOM:
          basePrice = this.calculatePerRoomPrice(bookingData, serviceConfig);
          breakdown.rooms = bookingData.rooms;
          breakdown.pricePerRoom = serviceConfig.pricePerRoom || 300;
          break;

        case PRICING_MODELS.FIXED:
          basePrice = serviceConfig.fixedPrice || 0;
          breakdown.fixedPrice = basePrice;
          break;

        case PRICING_MODELS.HOURLY:
          basePrice = this.calculateHourlyPrice(bookingData, serviceConfig);
          breakdown.hours = serviceConfig.hours || 3;
          breakdown.hourlyRate = serviceConfig.hourlyRate || 400;
          break;

        default:
          throw new Error(`Unsupported pricing model: ${serviceConfig.pricingModel}`);
      }

      // Apply minimum price if configured
      if (serviceConfig.minPrice && basePrice < serviceConfig.minPrice) {
        breakdown.minimumPriceApplied = true;
        breakdown.originalPrice = basePrice;
        basePrice = serviceConfig.minPrice;
      }

      // Calculate add-ons
      const addonsResult = this.calculateAddonsPrice(bookingData);
      const addonsPrice = addonsResult.total;
      breakdown.addons = addonsResult;

      // Calculate subtotal
      const subtotal = basePrice + addonsPrice;
      breakdown.subtotal = subtotal;

      // Apply RUT discount if eligible
      let rutDiscount = 0;
      let finalPrice = subtotal;

      if (bookingData.rutApplied && this.isRutEligible(bookingData)) {
        rutDiscount = this.calculateRutDiscount(subtotal);
        finalPrice = subtotal - rutDiscount;
        breakdown.rutDiscount = rutDiscount;
      }

      // Apply custom fees if any
      const customFees = this.calculateCustomFees(serviceConfig);
      const customFeesTotal = customFees.total;
      finalPrice += customFeesTotal;
      breakdown.customFees = customFees;

      // Apply frequency multiplier if applicable
      if (bookingData.frequency && serviceConfig.frequencyMultipliers) {
        const multiplier = serviceConfig.frequencyMultipliers[bookingData.frequency] || 1;
        if (multiplier !== 1) {
          const frequencyAdjustment = finalPrice * (multiplier - 1);
          finalPrice += frequencyAdjustment;
          breakdown.frequency = {
            type: bookingData.frequency,
            multiplier,
            adjustment: frequencyAdjustment
          };
        }
      }

      // Apply coupons if any
      let couponDiscount = 0;
      if (bookingData.couponCode) {
        couponDiscount = this.calculateCouponDiscount(finalPrice, bookingData.couponCode);
        finalPrice -= couponDiscount;
        breakdown.couponDiscount = couponDiscount;
      }

      const result = {
        basePrice,
        addonsPrice,
        subtotal,
        rutDiscount,
        customFeesTotal,
        couponDiscount,
        finalPrice: Math.round(finalPrice),
        breakdown
      };

      logger.debug('Price calculation completed', { 
        finalPrice: result.finalPrice,
        breakdown: Object.keys(breakdown)
      });

      return result;

    } catch (error) {
      errorHandler.handleError(error, {
        bookingData,
        serviceConfig
      }, {
        type: ERROR_TYPES.PRICING_ERROR,
        severity: ERROR_SEVERITY.HIGH
      });
      throw error;
    }
  }

  /**
   * Calculate window cleaning price
   */
  calculateWindowPrice(bookingData) {
    const windowData = {};
    let total = 0;
    let regularWindowCount = 0;

    // Calculate price for each window type
    for (let i = 0; i <= 7; i++) {
      const quantity = bookingData[`window_${i}`] || 0;
      if (quantity > 0) {
        const windowType = WINDOW_TYPES[i];
        const price = windowType.price * quantity;
        total += price;
        
        // Count regular windows (types 0-5) for minimum price calculation
        if (i < 6) {
          regularWindowCount += quantity;
        }

        windowData[`window_${i}`] = {
          type: windowType.name,
          quantity,
          price: windowType.price,
          total: price
        };
      }
    }

    // Apply minimum price for regular windows (Swedish industry standard)
    const minimumPrice = 900;
    const finalTotal = (regularWindowCount > 0 && total < minimumPrice) ? minimumPrice : total;

    return {
      windowData,
      subtotal: total,
      minimumPriceApplied: regularWindowCount > 0 && total < minimumPrice,
      minimumPrice,
      regularWindowCount,
      total: finalTotal
    };
  }

  /**
   * Calculate per square meter price
   */
  calculatePerSqmPrice(bookingData, serviceConfig) {
    const area = bookingData.area || 0;
    const pricePerSqm = serviceConfig.pricePerSqm || 50;
    return area * pricePerSqm;
  }

  /**
   * Calculate per room price
   */
  calculatePerRoomPrice(bookingData, serviceConfig) {
    const rooms = bookingData.rooms || 0;
    const pricePerRoom = serviceConfig.pricePerRoom || 300;
    return rooms * pricePerRoom;
  }

  /**
   * Calculate hourly price
   */
  calculateHourlyPrice(bookingData, serviceConfig) {
    const hours = serviceConfig.hours || 3;
    const hourlyRate = serviceConfig.hourlyRate || 400;
    return hours * hourlyRate;
  }

  /**
   * Calculate add-ons price
   */
  calculateAddonsPrice(bookingData) {
    const addons = {};
    let total = 0;

    // Check for add-ons in booking data
    for (const [addonName, price] of Object.entries(ADDON_PRICES)) {
      const addonKey = `addon_${addonName.replace(/ /g, '_')}`;
      const isSelected = bookingData[addonKey] === true;

      if (isSelected) {
        addons[addonName] = {
          price,
          rutEligible: true // Most add-ons are RUT eligible
        };
        total += price;
      }
    }

    return {
      addons,
      total
    };
  }

  /**
   * Calculate custom fees
   */
  calculateCustomFees(serviceConfig) {
    const fees = {};
    let total = 0;

    if (serviceConfig.customFees && Array.isArray(serviceConfig.customFees)) {
      serviceConfig.customFees.forEach(fee => {
        fees[fee.name] = {
          amount: fee.amount || 0,
          rutEligible: fee.rutEligible !== false
        };
        total += fee.amount || 0;
      });
    }

    return {
      fees,
      total
    };
  }

  /**
   * Calculate RUT discount
   */
  calculateRutDiscount(amount) {
    return Math.round(amount * RUT_CONFIG.PERCENTAGE);
  }

  /**
   * Calculate coupon discount
   */
  calculateCouponDiscount(_amount, _couponCode) {
    // This would integrate with coupon validation system
    // For now, return 0
    return 0;
  }

  /**
   * Check if booking has window data
   */
  hasWindowData(bookingData) {
    for (let i = 0; i <= 7; i++) {
      if (bookingData[`window_${i}`] > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if booking has addon data
   */
  hasAddonData(bookingData) {
    for (const addonName of Object.keys(ADDON_PRICES)) {
      const addonKey = `addon_${addonName.replace(/ /g, '_')}`;
      if (bookingData[addonKey] === true) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if booking is RUT eligible
   */
  isRutEligible(bookingData) {
    // Basic RUT eligibility check
    // In production, this would check personal number format and other criteria
    return bookingData.personalNumber && 
           bookingData.personalNumber.length >= 10 && 
           bookingData.personalNumber.length <= 12;
  }

  /**
   * Get cached price calculation
   */
  getCachedPrice(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    return null;
  }

  /**
   * Cache price calculation
   */
  cachePrice(cacheKey, result) {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Generate cache key for price calculation
   */
  generateCacheKey(bookingData, serviceConfig) {
    const keyData = {
      ...bookingData,
      serviceId: serviceConfig.id,
      pricingModel: serviceConfig.pricingModel
    };
    return JSON.stringify(keyData);
  }

  /**
   * Clear price cache
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
      timeout: this.cacheTimeout
    };
  }
}

// ============================================================================
// GLOBAL PRICING ENGINE INSTANCE
// ============================================================================

export const pricingEngine = new PricingEngine();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format price in Swedish currency
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate price with RUT discount
 */
export function calculatePriceWithRut(price, rutApplied = false) {
  if (!rutApplied) {
    return price;
  }
  return Math.round(price * (1 - RUT_CONFIG.PERCENTAGE));
}

/**
 * Validate pricing configuration
 */
export function validatePricingConfig(config) {
  const errors = [];

  if (!config.pricingModel) {
    errors.push('Pricing model is required');
  }

  if (!Object.values(PRICING_MODELS).includes(config.pricingModel)) {
    errors.push(`Invalid pricing model: ${config.pricingModel}`);
  }

  if (config.minPrice && config.minPrice < 0) {
    errors.push('Minimum price cannot be negative');
  }

  if (config.pricingModel === PRICING_MODELS.PER_SQM && !config.pricePerSqm) {
    errors.push('Price per square meter is required for per-sqm pricing');
  }

  if (config.pricingModel === PRICING_MODELS.PER_ROOM && !config.pricePerRoom) {
    errors.push('Price per room is required for per-room pricing');
  }

  if (config.pricingModel === PRICING_MODELS.FIXED && !config.fixedPrice) {
    errors.push('Fixed price is required for fixed pricing');
  }

  return errors;
}

/**
 * Pricing utility functions
 */
export const PricingUtils = {
  formatPrice,
  calculatePriceWithRut,
  validatePricingConfig,
  
  /**
   * Get window type name by ID
   */
  getWindowTypeName(windowTypeId) {
    return WINDOW_TYPES[windowTypeId]?.name || 'Okänd fönstertyp';
  },
  
  /**
   * Get window type price by ID
   */
  getWindowTypePrice(windowTypeId) {
    return WINDOW_TYPES[windowTypeId]?.price || 0;
  },
  
  /**
   * Get addon price by name
   */
  getAddonPrice(addonName) {
    return ADDON_PRICES[addonName] || 0;
  },
  
  /**
   * Calculate minimum price enforcement
   */
  enforceMinimumPrice(calculatedPrice, minimumPrice) {
    return Math.max(calculatedPrice, minimumPrice || 0);
  },
  
  /**
   * Get all available window types
   */
  getAvailableWindowTypes() {
    return Object.entries(WINDOW_TYPES).map(([id, type]) => ({
      id: parseInt(id),
      ...type
    }));
  },
  
  /**
   * Get all available addons
   */
  getAvailableAddons() {
    return Object.entries(ADDON_PRICES).map(([name, price]) => ({
      name,
      price
    }));
  }
};

// Export default instance
export default pricingEngine;