/**
 * SwedPrime Advanced Pricing Features
 * Dynamic pricing, promotional codes, seasonal adjustments, and advanced features
 */

// Feature Types
export const FEATURE_TYPES = {
  DYNAMIC_PRICING: 'dynamic_pricing',
  PROMOTIONAL_CODES: 'promotional_codes',
  SEASONAL_ADJUSTMENTS: 'seasonal_adjustments',
  LOYALTY_PROGRAM: 'loyalty_program',
  AB_TESTING: 'ab_testing',
  DEMAND_BASED_PRICING: 'demand_based_pricing',
  COMPETITOR_PRICING: 'competitor_pricing',
  GEOGRAPHIC_PRICING: 'geographic_pricing',
  TIME_SENSITIVE_OFFERS: 'time_sensitive_offers'
};

// Pricing Strategies
export const PRICING_STRATEGIES = {
  PENETRATION: 'penetration', // Lower prices to gain market share
  SKIMMING: 'skimming', // Higher prices for premium positioning
  COMPETITIVE: 'competitive', // Match competitor prices
  VALUE_BASED: 'value_based', // Price based on perceived value
  COST_PLUS: 'cost_plus', // Cost + margin
  DYNAMIC: 'dynamic' // Real-time price adjustments
};

// Promotional Code Types
export const PROMO_CODE_TYPES = {
  PERCENTAGE_DISCOUNT: 'percentage_discount',
  FIXED_DISCOUNT: 'fixed_discount',
  FREE_SERVICE: 'free_service',
  BOGO: 'buy_one_get_one',
  TIERED_DISCOUNT: 'tiered_discount',
  FIRST_TIME_CUSTOMER: 'first_time_customer',
  REFERRAL: 'referral',
  SEASONAL: 'seasonal'
};

/**
 * Advanced Pricing Features Manager
 */
export class AdvancedPricingFeatures {
  constructor(config = {}) {
    this.config = config;
    this.features = new Map();
    this.promotionalCodes = new Map();
    this.loyaltyPrograms = new Map();
    this.abTests = new Map();
    this.pricingHistory = [];
    this.demandData = new Map();
    this.competitorData = new Map();
    this.debug = config.debug || false;
    
    // Initialize default features
    this.initializeFeatures();
  }

  /**
   * Initialize default features
   */
  initializeFeatures() {
    // Dynamic pricing feature
    this.registerFeature(FEATURE_TYPES.DYNAMIC_PRICING, {
      name: 'Dynamic Pricing',
      enabled: true,
      processor: this.processDynamicPricing.bind(this)
    });

    // Promotional codes feature
    this.registerFeature(FEATURE_TYPES.PROMOTIONAL_CODES, {
      name: 'Promotional Codes',
      enabled: true,
      processor: this.processPromotionalCodes.bind(this)
    });

    // Seasonal adjustments feature
    this.registerFeature(FEATURE_TYPES.SEASONAL_ADJUSTMENTS, {
      name: 'Seasonal Adjustments',
      enabled: true,
      processor: this.processSeasonalAdjustments.bind(this)
    });

    // Loyalty program feature
    this.registerFeature(FEATURE_TYPES.LOYALTY_PROGRAM, {
      name: 'Loyalty Program',
      enabled: true,
      processor: this.processLoyaltyProgram.bind(this)
    });

    // A/B testing feature
    this.registerFeature(FEATURE_TYPES.AB_TESTING, {
      name: 'A/B Testing',
      enabled: true,
      processor: this.processABTesting.bind(this)
    });

    // Demand-based pricing
    this.registerFeature(FEATURE_TYPES.DEMAND_BASED_PRICING, {
      name: 'Demand-Based Pricing',
      enabled: false, // Disabled by default
      processor: this.processDemandBasedPricing.bind(this)
    });

    // Geographic pricing
    this.registerFeature(FEATURE_TYPES.GEOGRAPHIC_PRICING, {
      name: 'Geographic Pricing',
      enabled: true,
      processor: this.processGeographicPricing.bind(this)
    });
  }

  /**
   * Register a feature
   */
  registerFeature(type, feature) {
    this.features.set(type, feature);
    this.log(`Feature registered: ${feature.name}`);
  }

  /**
   * Apply all enabled features to pricing
   */
  async applyAdvancedFeatures(pricingContext) {
    let result = {
      originalPrice: pricingContext.currentPrice,
      adjustedPrice: pricingContext.currentPrice,
      appliedFeatures: [],
      metadata: {}
    };

    for (const [type, feature] of this.features) {
      if (!feature.enabled) continue;

      try {
        const featureResult = await feature.processor(pricingContext, result);
        
        if (featureResult && featureResult.adjustedPrice !== undefined) {
          result.adjustedPrice = featureResult.adjustedPrice;
          result.appliedFeatures.push({
            type,
            name: feature.name,
            adjustment: featureResult.adjustedPrice - result.originalPrice,
            metadata: featureResult.metadata || {}
          });
          
          if (featureResult.metadata) {
            result.metadata[type] = featureResult.metadata;
          }
        }
      } catch (error) {
        this.log(`Error applying feature ${feature.name}:`, error);
        
        if (!this.config.continueOnFeatureError) {
          throw error;
        }
      }
    }

    // Record pricing history
    this.recordPricingHistory(pricingContext, result);

    return result;
  }

  /**
   * Process dynamic pricing
   */
  async processDynamicPricing(context, currentResult) {
    const config = this.config.dynamicPricing || {};
    let multiplier = 1;
    const metadata = {};

    // Time-based adjustments
    if (config.timeBasedPricing) {
      const timeMultiplier = this.calculateTimeBasedMultiplier(context.inputData.date);
      multiplier *= timeMultiplier;
      metadata.timeMultiplier = timeMultiplier;
    }

    // Day of week adjustments
    if (config.dayOfWeekPricing) {
      const dayMultiplier = this.calculateDayOfWeekMultiplier(context.inputData.date);
      multiplier *= dayMultiplier;
      metadata.dayMultiplier = dayMultiplier;
    }

    // Market conditions
    if (config.marketConditions) {
      const marketMultiplier = await this.calculateMarketConditionsMultiplier(context);
      multiplier *= marketMultiplier;
      metadata.marketMultiplier = marketMultiplier;
    }

    const adjustedPrice = Math.round(currentResult.adjustedPrice * multiplier);

    return {
      adjustedPrice,
      metadata: {
        ...metadata,
        totalMultiplier: multiplier,
        originalPrice: currentResult.adjustedPrice
      }
    };
  }

  /**
   * Process promotional codes
   */
  async processPromotionalCodes(context, currentResult) {
    const promoCode = context.inputData.promoCode;
    
    if (!promoCode) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    const promotion = this.promotionalCodes.get(promoCode.toUpperCase());
    
    if (!promotion || !this.isPromotionValid(promotion)) {
      return { 
        adjustedPrice: currentResult.adjustedPrice,
        metadata: { error: 'Invalid or expired promotional code' }
      };
    }

    let discount = 0;
    const metadata = {
      promoCode,
      promotionType: promotion.type,
      promotionName: promotion.name
    };

    switch (promotion.type) {
      case PROMO_CODE_TYPES.PERCENTAGE_DISCOUNT:
        discount = currentResult.adjustedPrice * (promotion.value / 100);
        break;
      
      case PROMO_CODE_TYPES.FIXED_DISCOUNT:
        discount = Math.min(promotion.value, currentResult.adjustedPrice);
        break;
      
      case PROMO_CODE_TYPES.TIERED_DISCOUNT:
        discount = this.calculateTieredDiscount(
          currentResult.adjustedPrice, 
          promotion.tiers
        );
        break;
      
      case PROMO_CODE_TYPES.FIRST_TIME_CUSTOMER:
        if (context.inputData.isFirstTimeCustomer) {
          discount = currentResult.adjustedPrice * (promotion.value / 100);
        }
        break;
    }

    // Apply minimum order requirements
    if (promotion.minimumOrder && currentResult.adjustedPrice < promotion.minimumOrder) {
      return {
        adjustedPrice: currentResult.adjustedPrice,
        metadata: { 
          error: `Minimum order of ${promotion.minimumOrder} required for this promotion` 
        }
      };
    }

    // Apply maximum discount limit
    if (promotion.maxDiscount) {
      discount = Math.min(discount, promotion.maxDiscount);
    }

    const adjustedPrice = Math.max(0, currentResult.adjustedPrice - discount);
    metadata.discountAmount = discount;

    // Update usage count
    this.updatePromotionUsage(promoCode);

    return {
      adjustedPrice,
      metadata
    };
  }

  /**
   * Process seasonal adjustments
   */
  async processSeasonalAdjustments(context, currentResult) {
    const config = this.config.seasonalAdjustments || {};
    const currentDate = new Date(context.inputData.date || new Date());
    const month = currentDate.getMonth() + 1;
    const season = this.getSeason(month);
    
    let multiplier = 1;
    const metadata = { season, month };

    // Monthly adjustments
    if (config.monthlyMultipliers && config.monthlyMultipliers[month]) {
      multiplier *= config.monthlyMultipliers[month];
      metadata.monthlyMultiplier = config.monthlyMultipliers[month];
    }

    // Seasonal adjustments
    if (config.seasonalMultipliers && config.seasonalMultipliers[season]) {
      multiplier *= config.seasonalMultipliers[season];
      metadata.seasonalMultiplier = config.seasonalMultipliers[season];
    }

    // Holiday adjustments
    if (config.holidayAdjustments) {
      const holidayMultiplier = this.getHolidayMultiplier(currentDate, config.holidayAdjustments);
      if (holidayMultiplier !== 1) {
        multiplier *= holidayMultiplier;
        metadata.holidayMultiplier = holidayMultiplier;
      }
    }

    const adjustedPrice = Math.round(currentResult.adjustedPrice * multiplier);

    return {
      adjustedPrice,
      metadata: {
        ...metadata,
        totalMultiplier: multiplier
      }
    };
  }

  /**
   * Process loyalty program
   */
  async processLoyaltyProgram(context, currentResult) {
    const customerId = context.inputData.customerId;
    
    if (!customerId) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    const loyaltyData = await this.getLoyaltyData(customerId);
    
    if (!loyaltyData) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    const config = this.config.loyaltyProgram || {};
    let discount = 0;
    const metadata = {
      loyaltyTier: loyaltyData.tier,
      loyaltyPoints: loyaltyData.points,
      totalBookings: loyaltyData.totalBookings
    };

    // Tier-based discounts
    if (config.tierDiscounts && config.tierDiscounts[loyaltyData.tier]) {
      const tierDiscount = config.tierDiscounts[loyaltyData.tier];
      discount = currentResult.adjustedPrice * (tierDiscount / 100);
      metadata.tierDiscount = tierDiscount;
    }

    // Points redemption
    if (context.inputData.redeemPoints && loyaltyData.points >= config.pointsThreshold) {
      const pointsDiscount = Math.min(
        loyaltyData.points * config.pointValue,
        currentResult.adjustedPrice * 0.5 // Max 50% discount from points
      );
      discount += pointsDiscount;
      metadata.pointsRedeemed = Math.floor(pointsDiscount / config.pointValue);
    }

    // Frequency bonus
    if (config.frequencyBonus && loyaltyData.totalBookings >= config.frequencyBonus.threshold) {
      const frequencyDiscount = currentResult.adjustedPrice * (config.frequencyBonus.discount / 100);
      discount += frequencyDiscount;
      metadata.frequencyBonus = config.frequencyBonus.discount;
    }

    const adjustedPrice = Math.max(0, currentResult.adjustedPrice - discount);
    metadata.totalDiscount = discount;

    return {
      adjustedPrice,
      metadata
    };
  }

  /**
   * Process A/B testing
   */
  async processABTesting(context, currentResult) {
    const config = this.config.abTesting || {};
    
    if (!config.enabled || !config.experiments) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    const customerId = context.inputData.customerId || context.inputData.sessionId;
    const activeExperiments = config.experiments.filter(exp => 
      exp.active && this.isExperimentValid(exp)
    );

    if (activeExperiments.length === 0) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    let adjustedPrice = currentResult.adjustedPrice;
    const metadata = { experiments: [] };

    for (const experiment of activeExperiments) {
      const variant = this.getExperimentVariant(customerId, experiment);
      
      if (variant && variant.priceMultiplier !== 1) {
        adjustedPrice = Math.round(adjustedPrice * variant.priceMultiplier);
        
        metadata.experiments.push({
          experimentId: experiment.id,
          variantId: variant.id,
          priceMultiplier: variant.priceMultiplier
        });

        // Track experiment exposure
        this.trackExperimentExposure(experiment.id, variant.id, customerId);
      }
    }

    return {
      adjustedPrice,
      metadata
    };
  }

  /**
   * Process demand-based pricing
   */
  async processDemandBasedPricing(context, currentResult) {
    const config = this.config.demandBasedPricing || {};
    
    if (!config.enabled) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    const demandData = await this.getDemandData(context);
    let multiplier = 1;
    const metadata = { demandLevel: demandData.level };

    // Adjust based on current demand
    switch (demandData.level) {
      case 'very_high':
        multiplier = config.veryHighDemandMultiplier || 1.3;
        break;
      case 'high':
        multiplier = config.highDemandMultiplier || 1.15;
        break;
      case 'normal':
        multiplier = 1;
        break;
      case 'low':
        multiplier = config.lowDemandMultiplier || 0.9;
        break;
      case 'very_low':
        multiplier = config.veryLowDemandMultiplier || 0.8;
        break;
    }

    // Apply capacity constraints
    if (demandData.capacityUtilization > 0.9) {
      multiplier *= config.capacityConstraintMultiplier || 1.2;
      metadata.capacityConstrained = true;
    }

    const adjustedPrice = Math.round(currentResult.adjustedPrice * multiplier);
    metadata.demandMultiplier = multiplier;

    return {
      adjustedPrice,
      metadata
    };
  }

  /**
   * Process geographic pricing
   */
  async processGeographicPricing(context, currentResult) {
    const config = this.config.geographicPricing || {};
    const zipCode = context.inputData.zipCode;
    
    if (!zipCode || !config.enabled) {
      return { adjustedPrice: currentResult.adjustedPrice };
    }

    let multiplier = 1;
    const metadata = { zipCode };

    // ZIP code based adjustments
    if (config.zipCodeMultipliers && config.zipCodeMultipliers[zipCode]) {
      multiplier = config.zipCodeMultipliers[zipCode];
      metadata.zipCodeMultiplier = multiplier;
    }

    // Regional adjustments
    const region = this.getRegionFromZipCode(zipCode);
    if (config.regionalMultipliers && config.regionalMultipliers[region]) {
      multiplier *= config.regionalMultipliers[region];
      metadata.region = region;
      metadata.regionalMultiplier = config.regionalMultipliers[region];
    }

    // Cost of living adjustments
    if (config.costOfLivingAdjustments) {
      const colIndex = await this.getCostOfLivingIndex(zipCode);
      if (colIndex) {
        const colMultiplier = 0.8 + (colIndex * 0.4); // Scale between 0.8 and 1.2
        multiplier *= colMultiplier;
        metadata.costOfLivingIndex = colIndex;
        metadata.costOfLivingMultiplier = colMultiplier;
      }
    }

    const adjustedPrice = Math.round(currentResult.adjustedPrice * multiplier);
    metadata.totalMultiplier = multiplier;

    return {
      adjustedPrice,
      metadata
    };
  }

  /**
   * Create promotional code
   */
  createPromotionalCode(codeData) {
    const code = {
      id: codeData.id || this.generatePromoCodeId(),
      code: codeData.code.toUpperCase(),
      name: codeData.name,
      type: codeData.type,
      value: codeData.value,
      validFrom: new Date(codeData.validFrom),
      validUntil: new Date(codeData.validUntil),
      usageLimit: codeData.usageLimit || null,
      usageCount: 0,
      minimumOrder: codeData.minimumOrder || 0,
      maxDiscount: codeData.maxDiscount || null,
      applicableServices: codeData.applicableServices || [],
      enabled: codeData.enabled !== false,
      tiers: codeData.tiers || null, // For tiered discounts
      createdAt: new Date(),
      metadata: codeData.metadata || {}
    };

    this.promotionalCodes.set(code.code, code);
    this.log(`Promotional code created: ${code.code}`);
    
    return code;
  }

  /**
   * Create loyalty program
   */
  createLoyaltyProgram(programData) {
    const program = {
      id: programData.id || this.generateLoyaltyProgramId(),
      name: programData.name,
      tiers: programData.tiers || [],
      pointsPerDollar: programData.pointsPerDollar || 1,
      pointValue: programData.pointValue || 0.01,
      tierThresholds: programData.tierThresholds || {},
      tierDiscounts: programData.tierDiscounts || {},
      frequencyBonus: programData.frequencyBonus || null,
      enabled: programData.enabled !== false,
      createdAt: new Date()
    };

    this.loyaltyPrograms.set(program.id, program);
    this.log(`Loyalty program created: ${program.name}`);
    
    return program;
  }

  /**
   * Create A/B test experiment
   */
  createABTestExperiment(experimentData) {
    const experiment = {
      id: experimentData.id || this.generateExperimentId(),
      name: experimentData.name,
      description: experimentData.description,
      variants: experimentData.variants,
      trafficAllocation: experimentData.trafficAllocation || {},
      startDate: new Date(experimentData.startDate),
      endDate: new Date(experimentData.endDate),
      active: experimentData.active !== false,
      targetAudience: experimentData.targetAudience || {},
      metrics: experimentData.metrics || [],
      createdAt: new Date()
    };

    this.abTests.set(experiment.id, experiment);
    this.log(`A/B test experiment created: ${experiment.name}`);
    
    return experiment;
  }

  /**
   * Helper methods
   */

  calculateTimeBasedMultiplier(date) {
    const hour = new Date(date).getHours();
    const config = this.config.dynamicPricing?.timeBasedPricing || {};
    
    // Peak hours (typically 9-17)
    if (hour >= 9 && hour <= 17) {
      return config.peakHoursMultiplier || 1.1;
    }
    
    // Off-peak hours
    return config.offPeakHoursMultiplier || 0.95;
  }

  calculateDayOfWeekMultiplier(date) {
    const day = new Date(date).getDay();
    const config = this.config.dynamicPricing?.dayOfWeekPricing || {};
    
    // Weekend premium
    if (day === 0 || day === 6) {
      return config.weekendMultiplier || 1.15;
    }
    
    // Weekday pricing
    return config.weekdayMultiplier || 1;
  }

  async calculateMarketConditionsMultiplier(context) {
    // This would integrate with external market data APIs
    // For now, return a base multiplier
    return 1;
  }

  isPromotionValid(promotion) {
    const now = new Date();
    const isWithinDateRange = now >= promotion.validFrom && now <= promotion.validUntil;
    const isUnderUsageLimit = !promotion.usageLimit || promotion.usageCount < promotion.usageLimit;
    
    return promotion.enabled && isWithinDateRange && isUnderUsageLimit;
  }

  calculateTieredDiscount(price, tiers) {
    for (const tier of tiers.sort((a, b) => b.threshold - a.threshold)) {
      if (price >= tier.threshold) {
        return price * (tier.discount / 100);
      }
    }
    return 0;
  }

  updatePromotionUsage(promoCode) {
    const promotion = this.promotionalCodes.get(promoCode.toUpperCase());
    if (promotion) {
      promotion.usageCount++;
    }
  }

  getSeason(month) {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  getHolidayMultiplier(date, holidayAdjustments) {
    // Check if date is a holiday and return appropriate multiplier
    // This would integrate with a holiday calendar API
    return 1;
  }

  async getLoyaltyData(customerId) {
    // This would fetch from customer database
    // For now, return mock data
    return {
      tier: 'silver',
      points: 1250,
      totalBookings: 15
    };
  }

  getExperimentVariant(userId, experiment) {
    // Simple hash-based assignment for consistent variant assignment
    const hash = this.simpleHash(userId + experiment.id);
    const variants = experiment.variants;
    const variantIndex = hash % variants.length;
    
    return variants[variantIndex];
  }

  isExperimentValid(experiment) {
    const now = new Date();
    return experiment.active && 
           now >= experiment.startDate && 
           now <= experiment.endDate;
  }

  trackExperimentExposure(experimentId, variantId, userId) {
    // Track experiment exposure for analysis
    this.log(`Experiment exposure: ${experimentId}, variant: ${variantId}, user: ${userId}`);
  }

  async getDemandData(context) {
    // This would integrate with booking system to get real demand data
    return {
      level: 'normal',
      capacityUtilization: 0.7
    };
  }

  getRegionFromZipCode(zipCode) {
    // Simple region mapping - would use actual geographic data
    const firstDigit = zipCode.charAt(0);
    const regionMap = {
      '0': 'northeast',
      '1': 'northeast',
      '2': 'northeast',
      '3': 'southeast',
      '4': 'southeast',
      '5': 'central',
      '6': 'central',
      '7': 'southwest',
      '8': 'west',
      '9': 'west'
    };
    
    return regionMap[firstDigit] || 'unknown';
  }

  async getCostOfLivingIndex(zipCode) {
    // This would integrate with cost of living data APIs
    return Math.random() * 0.4 + 0.8; // Mock data between 0.8 and 1.2
  }

  recordPricingHistory(context, result) {
    const record = {
      timestamp: new Date().toISOString(),
      originalPrice: result.originalPrice,
      adjustedPrice: result.adjustedPrice,
      appliedFeatures: result.appliedFeatures,
      context: {
        service: context.service?.id,
        area: context.inputData?.area,
        zipCode: context.inputData?.zipCode
      }
    };

    this.pricingHistory.push(record);
    
    // Keep only last 1000 records
    if (this.pricingHistory.length > 1000) {
      this.pricingHistory.shift();
    }
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  generatePromoCodeId() {
    return `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLoyaltyProgramId() {
    return `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateExperimentId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(...args) {
    if (this.debug) {
      // Debug logging handled by constructor debug flag
    }
  }
}

/**
 * Factory function to create advanced pricing features instance
 */
export function createAdvancedPricingFeatures(config) {
  return new AdvancedPricingFeatures(config);
}

export default AdvancedPricingFeatures; 