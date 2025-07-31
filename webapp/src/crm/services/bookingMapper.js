// Utility to map booking calculator data to CRM lead format
import { sanitizeData } from '../../utils/secureLogger';

// Map service configuration to structured lead data
const mapServiceConfig = (bookingData) => {
  const {
    serviceId,
    serviceName,
    area,
    rooms,
    frequency,
    addOns = [],
    windowTypes = {},
    customFees = []
  } = bookingData;

  return {
    serviceConfig: {
      serviceId,
      serviceName,
      area: Number(area) || 0,
      rooms: Number(rooms) || 0,
      frequency,
      addOns: addOns.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price) || 0
      })),
      windowTypes: Object.entries(windowTypes).map(([type, count]) => ({
        type,
        count: Number(count) || 0
      })),
      customFees: customFees.map(fee => ({
        name: fee.name,
        amount: Number(fee.amount) || 0,
        type: fee.type
      }))
    }
  };
};

// Map pricing information to lead value and metadata
const mapPricingInfo = (bookingData) => {
  const {
    originalPrice = 0,
    finalPrice = 0,
    rutDiscount = 0,
    customFees = []
  } = bookingData.pricingInfo || {};

  return {
    value: finalPrice, // Lead's potential value
    pricingDetails: {
      originalPrice: Number(originalPrice),
      finalPrice: Number(finalPrice),
      rutDiscount: Number(rutDiscount),
      customFees: customFees.map(fee => ({
        name: fee.name,
        amount: Number(fee.amount)
      }))
    }
  };
};

// Map customer information to lead contact details
const mapCustomerInfo = (bookingData) => {
  const {
    name,
    email,
    phone,
    address,
    personnummer,
    useRut
  } = bookingData.customerInfo || {};

  return {
    name: name?.trim(),
    email: email?.trim().toLowerCase(),
    phone: phone?.trim(),
    address: address?.trim(),
    personnummer: personnummer?.trim(),
    useRut: !!useRut
  };
};

// Map scheduling preferences
const mapSchedulingInfo = (bookingData) => {
  const {
    preferredDate,
    preferredTime,
    alternativeDates = [],
    specialInstructions
  } = bookingData;

  return {
    schedulingPreferences: {
      preferredDate,
      preferredTime,
      alternativeDates,
      specialInstructions: specialInstructions?.trim()
    }
  };
};

/**
 * Maps booking calculator data to CRM lead format
 * @param {Object} bookingData - Raw data from booking calculator
 * @returns {Object} Formatted lead data for CRM
 */
export const mapBookingToLead = (bookingData) => {
  // Sanitize incoming data
  const sanitizedData = sanitizeData(bookingData);

  const leadData = {
    // Basic lead information
    source: 'booking-calculator',
    status: 'new',
    type: 'service-booking',
    
    // Map customer details
    ...mapCustomerInfo(sanitizedData),
    
    // Map service configuration
    ...mapServiceConfig(sanitizedData),
    
    // Map pricing information
    ...mapPricingInfo(sanitizedData),
    
    // Map scheduling preferences
    ...mapSchedulingInfo(sanitizedData),
    
    // Metadata
    metadata: {
      submittedAt: new Date().toISOString(),
      calculatorVersion: '2.0',
      originalBookingData: sanitizedData // Store original data for reference
    }
  };

  return leadData;
};

/**
 * Validates mapped lead data before creation
 * @param {Object} leadData - Mapped lead data
 * @returns {Object} Validation result { isValid, errors }
 */
export const validateMappedLead = (leadData) => {
  const errors = [];

  // Required fields
  if (!leadData.name) errors.push('Customer name is required');
  if (!leadData.email) errors.push('Customer email is required');
  if (!leadData.serviceConfig.serviceId) errors.push('Service selection is required');
  if (!leadData.value) errors.push('Booking value is required');

  // RUT validation
  if (leadData.useRut && !leadData.personnummer) {
    errors.push('Personnummer is required for RUT deduction');
  }

  // Service area validation
  if (leadData.serviceConfig.area <= 0) {
    errors.push('Service area must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  mapBookingToLead,
  validateMappedLead
};