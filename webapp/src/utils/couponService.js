/**
 * Coupon Service - Centralized coupon validation and management
 * Handles all coupon-related operations including validation, usage tracking, and statistics
 */

import { db } from '../firebase/init';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { logger } from './logger';

// ============================================================================
// COUPON VALIDATION RESULTS
// ============================================================================

export const VALIDATION_RESULTS = {
  VALID: 'valid',
  NOT_FOUND: 'not_found',
  EXPIRED: 'expired',
  USAGE_LIMIT_EXCEEDED: 'usage_limit_exceeded',
  SERVICE_NOT_APPLICABLE: 'service_not_applicable',
  MINIMUM_ORDER_NOT_MET: 'minimum_order_not_met',
  INACTIVE: 'inactive',
  BOOKING_DATE_RESTRICTED: 'booking_date_restricted',
  INVALID_FORMAT: 'invalid_format'
};

// ============================================================================
// COUPON SERVICE CLASS
// ============================================================================

export class CouponService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Validate a coupon code for a specific booking
   * @param {string} companyId - Company ID
   * @param {string} couponCode - Coupon code to validate
   * @param {Object} bookingData - Booking data for validation context
   * @returns {Promise<Object>} Validation result
   */
  async validateCoupon(companyId, couponCode, bookingData = {}) {
    try {
      // Input validation
      if (!companyId || !couponCode) {
        return this.createValidationResult(false, VALIDATION_RESULTS.INVALID_FORMAT, 'Missing required parameters');
      }

      // Format validation
      const normalizedCode = this.normalizeCouponCode(couponCode);
      if (!this.isValidCouponFormat(normalizedCode)) {
        return this.createValidationResult(false, VALIDATION_RESULTS.INVALID_FORMAT, 'Invalid coupon code format');
      }

      // Check cache first
      const cacheKey = `${companyId}_${normalizedCode}`;
      const cachedResult = this.getCachedValidation(cacheKey);
      if (cachedResult) {
        logger.debug('Using cached coupon validation', { couponCode: normalizedCode });
        return cachedResult;
      }

      // Fetch coupon from database
      const coupon = await this.getCouponByCode(companyId, normalizedCode);
      if (!coupon) {
        const result = this.createValidationResult(false, VALIDATION_RESULTS.NOT_FOUND, 'Coupon code not found');
        this.cacheValidation(cacheKey, result);
        return result;
      }

      // Perform all validation checks
      const validationResult = await this.performValidationChecks(coupon, bookingData);
      
      // Cache the result
      this.cacheValidation(cacheKey, validationResult);
      
      logger.info('Coupon validation completed', { 
        couponCode: normalizedCode, 
        isValid: validationResult.isValid,
        result: validationResult.result 
      });

      return validationResult;

    } catch (error) {
      logger.error('Error validating coupon', { error: error.message, couponCode, companyId });
      return this.createValidationResult(false, 'system_error', 'System temporarily unavailable');
    }
  }

  /**
   * Apply a coupon to a booking and track usage
   * @param {string} companyId - Company ID
   * @param {string} couponCode - Coupon code
   * @param {string} bookingId - Booking ID
   * @param {Object} usageData - Usage tracking data
   * @returns {Promise<Object>} Application result
   */
  async applyCouponToBooking(companyId, couponCode, bookingId, usageData = {}) {
    try {
      const normalizedCode = this.normalizeCouponCode(couponCode);
      
      // Get coupon document
      const coupon = await this.getCouponByCode(companyId, normalizedCode);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      // Increment usage count
      await this.incrementUsage(companyId, coupon.id);

      // Track usage details
      await this.trackCouponUsage(companyId, coupon, bookingId, usageData);

      logger.info('Coupon applied successfully', { 
        couponCode: normalizedCode, 
        bookingId,
        couponId: coupon.id 
      });

      return {
        success: true,
        coupon: coupon,
        usageTracked: true
      };

    } catch (error) {
      logger.error('Error applying coupon', { error: error.message, couponCode, bookingId });
      throw error;
    }
  }

  /**
   * Get coupon by code from database
   * @param {string} companyId - Company ID
   * @param {string} couponCode - Normalized coupon code
   * @returns {Promise<Object|null>} Coupon document or null
   */
  async getCouponByCode(companyId, couponCode) {
    try {
      const couponsRef = collection(db, 'companies', companyId, 'coupons');
      const q = query(couponsRef, where('code', '==', couponCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };

    } catch (error) {
      logger.error('Error fetching coupon', { error: error.message, couponCode, companyId });
      throw error;
    }
  }

  /**
   * Perform all validation checks on a coupon
   * @param {Object} coupon - Coupon document
   * @param {Object} bookingData - Booking context data
   * @returns {Promise<Object>} Validation result
   */
  async performValidationChecks(coupon, bookingData) {
    // Check if coupon is active
    if (!coupon.isActive) {
      return this.createValidationResult(false, VALIDATION_RESULTS.INACTIVE, 'This coupon is no longer active');
    }

    // Check expiration
    if (this.isCouponExpired(coupon)) {
      const expiryDate = new Date(coupon.expiresAt).toLocaleDateString();
      return this.createValidationResult(false, VALIDATION_RESULTS.EXPIRED, `This coupon expired on ${expiryDate}`);
    }

    // Check usage limits
    if (this.isUsageLimitExceeded(coupon)) {
      return this.createValidationResult(false, VALIDATION_RESULTS.USAGE_LIMIT_EXCEEDED, 'This coupon has reached its usage limit');
    }

    // Check service applicability
    if (!this.isServiceApplicable(coupon, bookingData.serviceId)) {
      return this.createValidationResult(false, VALIDATION_RESULTS.SERVICE_NOT_APPLICABLE, 'This coupon is not valid for the selected service');
    }

    // Check minimum order amount
    if (!this.meetsMinimumOrder(coupon, bookingData.orderAmount)) {
      const minAmount = this.formatPrice(coupon.minimumOrderAmount || 0);
      return this.createValidationResult(false, VALIDATION_RESULTS.MINIMUM_ORDER_NOT_MET, `Minimum order of ${minAmount} required for this coupon`);
    }

    // Check booking date restrictions
    if (!this.isBookingDateValid(coupon, bookingData.bookingDate)) {
      return this.createValidationResult(false, VALIDATION_RESULTS.BOOKING_DATE_RESTRICTED, 'This coupon cannot be used for the selected booking date');
    }

    // All checks passed
    return this.createValidationResult(true, VALIDATION_RESULTS.VALID, 'Coupon is valid', coupon);
  }

  /**
   * Check if coupon is expired
   * @param {Object} coupon - Coupon document
   * @returns {boolean} True if expired
   */
  isCouponExpired(coupon) {
    if (coupon.doesntExpire || !coupon.expiresAt) {
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(coupon.expiresAt);
    return now > expiryDate;
  }

  /**
   * Check if usage limit is exceeded
   * @param {Object} coupon - Coupon document
   * @returns {boolean} True if limit exceeded
   */
  isUsageLimitExceeded(coupon) {
    if (!coupon.limitUsage || !coupon.usageLimit) {
      return false;
    }

    return (coupon.currentUsage || 0) >= coupon.usageLimit;
  }

  /**
   * Check if coupon applies to the selected service
   * @param {Object} coupon - Coupon document
   * @param {string} serviceId - Service ID
   * @returns {boolean} True if applicable
   */
  isServiceApplicable(coupon, serviceId) {
    if (!serviceId || coupon.appliesTo === 'all') {
      return true;
    }

    if (coupon.appliesTo === 'specific' && coupon.selectedServices) {
      return coupon.selectedServices.includes(serviceId);
    }

    return true;
  }

  /**
   * Check if order meets minimum amount requirement
   * @param {Object} coupon - Coupon document
   * @param {number} orderAmount - Order amount
   * @returns {boolean} True if minimum is met
   */
  meetsMinimumOrder(coupon, orderAmount) {
    if (!coupon.minimumOrderAmount || !orderAmount) {
      return true;
    }

    return orderAmount >= coupon.minimumOrderAmount;
  }

  /**
   * Check if booking date is valid for coupon restrictions
   * @param {Object} coupon - Coupon document
   * @param {string|Date} bookingDate - Booking date
   * @returns {boolean} True if valid
   */
  isBookingDateValid(coupon, bookingDate) {
    if (!coupon.restrictToExpirationDate || !coupon.expiresAt || !bookingDate) {
      return true;
    }

    const booking = new Date(bookingDate);
    const expiry = new Date(coupon.expiresAt);
    return booking <= expiry;
  }

  /**
   * Increment coupon usage count
   * @param {string} companyId - Company ID
   * @param {string} couponId - Coupon ID
   * @returns {Promise<void>}
   */
  async incrementUsage(companyId, couponId) {
    try {
      const couponRef = doc(db, 'companies', companyId, 'coupons', couponId);
      await updateDoc(couponRef, {
        currentUsage: increment(1),
        updatedAt: serverTimestamp()
      });

      logger.debug('Coupon usage incremented', { couponId });

    } catch (error) {
      logger.error('Error incrementing coupon usage', { error: error.message, couponId });
      throw error;
    }
  }

  /**
   * Track detailed coupon usage
   * @param {string} companyId - Company ID
   * @param {Object} coupon - Coupon document
   * @param {string} bookingId - Booking ID
   * @param {Object} usageData - Additional usage data
   * @returns {Promise<void>}
   */
  async trackCouponUsage(companyId, coupon, bookingId, usageData) {
    try {
      const usageRef = collection(db, 'companies', companyId, 'couponUsage');
      
      const usageRecord = {
        couponId: coupon.id,
        couponCode: coupon.code,
        bookingId,
        customerId: usageData.customerId || null,
        customerEmail: usageData.customerEmail || null,
        
        // Usage Details
        originalAmount: usageData.originalAmount || 0,
        discountAmount: usageData.discountAmount || 0,
        finalAmount: usageData.finalAmount || 0,
        
        // Booking Context
        serviceId: usageData.serviceId || null,
        serviceName: usageData.serviceName || null,
        bookingDate: usageData.bookingDate || null,
        
        // Metadata
        usedAt: serverTimestamp(),
        ipAddress: usageData.ipAddress || null,
        userAgent: usageData.userAgent || null
      };

      await addDoc(usageRef, usageRecord);
      
      logger.debug('Coupon usage tracked', { couponId: coupon.id, bookingId });

    } catch (error) {
      logger.error('Error tracking coupon usage', { error: error.message, couponId: coupon.id });
      // Don't throw - usage tracking failure shouldn't break the booking
    }
  }

  /**
   * Get coupon usage statistics
   * @param {string} companyId - Company ID
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} Usage statistics
   */
  async getCouponUsageStats(companyId, couponId) {
    try {
      const usageRef = collection(db, 'companies', companyId, 'couponUsage');
      const q = query(usageRef, where('couponId', '==', couponId));
      const snapshot = await getDocs(q);

      const usageRecords = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        totalUsage: usageRecords.length,
        totalDiscountGiven: usageRecords.reduce((sum, record) => sum + (record.discountAmount || 0), 0),
        averageOrderValue: usageRecords.length > 0 
          ? usageRecords.reduce((sum, record) => sum + (record.originalAmount || 0), 0) / usageRecords.length 
          : 0,
        uniqueCustomers: new Set(usageRecords.map(r => r.customerEmail).filter(Boolean)).size,
        usageByDate: this.groupUsageByDate(usageRecords)
      };

      return stats;

    } catch (error) {
      logger.error('Error getting coupon usage stats', { error: error.message, couponId });
      throw error;
    }
  }

  /**
   * Get all active coupons for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of active coupons
   */
  async getActiveCoupons(companyId) {
    try {
      const couponsRef = collection(db, 'companies', companyId, 'coupons');
      const q = query(couponsRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      logger.error('Error getting active coupons', { error: error.message, companyId });
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Normalize coupon code (uppercase, trim)
   * @param {string} code - Raw coupon code
   * @returns {string} Normalized code
   */
  normalizeCouponCode(code) {
    if (!code || typeof code !== 'string') {
      return '';
    }
    return code.trim().toUpperCase();
  }

  /**
   * Validate coupon code format
   * @param {string} code - Coupon code
   * @returns {boolean} True if valid format
   */
  isValidCouponFormat(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    // Must be 3-20 characters, alphanumeric only
    const formatRegex = /^[A-Z0-9]{3,20}$/;
    return formatRegex.test(code);
  }

  /**
   * Create validation result object
   * @param {boolean} isValid - Whether validation passed
   * @param {string} result - Result code
   * @param {string} message - Human-readable message
   * @param {Object} coupon - Coupon data (if valid)
   * @returns {Object} Validation result
   */
  createValidationResult(isValid, result, message, coupon = null) {
    return {
      isValid,
      result,
      message,
      coupon,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format price for display
   * @param {number} amount - Price amount
   * @returns {string} Formatted price
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Group usage records by date
   * @param {Array} usageRecords - Usage records
   * @returns {Object} Usage grouped by date
   */
  groupUsageByDate(usageRecords) {
    const grouped = {};
    
    usageRecords.forEach(record => {
      if (record.usedAt && record.usedAt.toDate) {
        const date = record.usedAt.toDate().toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });

    return grouped;
  }

  // ============================================================================
  // CACHING METHODS
  // ============================================================================

  /**
   * Get cached validation result
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached result or null
   */
  getCachedValidation(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    return null;
  }

  /**
   * Cache validation result
   * @param {string} cacheKey - Cache key
   * @param {Object} result - Validation result
   */
  cacheValidation(cacheKey, result) {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const couponService = new CouponService();
export default couponService;