/**
 * Maps booking calculator data to CRM lead format
 */
import { sanitizeData } from '../../../utils/secureLogger';

// Map customer information to lead contact details
const mapCustomerInfo = (bookingData) => ({
  name: bookingData.customerName?.trim(),
  email: bookingData.customerEmail?.trim().toLowerCase(),
  phone: bookingData.customerPhone?.trim(),
  address: bookingData.customerAddress?.trim(),
  personnummer: bookingData.personnummer?.trim(),
  useRut: !!bookingData.useRut
});

// Map service details to lead service configuration
const mapServiceDetails = (bookingData) => ({
  serviceConfig: {
    serviceId: bookingData.serviceId,
    serviceName: bookingData.serviceName,
    area: Number(bookingData.area) || 0,
    rooms: Number(bookingData.rooms) || 0,
    frequency: bookingData.frequency || 'one-time',
    addOns: (bookingData.addOns || []).map(addon => ({
      id: addon.id,
      name: addon.name,
      price: Number(addon.price) || 0
    })),
    windowTypes: Object.entries(bookingData.windowTypes || {}).map(([type, count]) => ({
      type,
      count: Number(count) || 0
    }))
  }
});

// Map pricing information to lead value
const mapPricingInfo = (bookingData) => ({
  value: Number(bookingData.finalPrice) || 0, // Lead's potential value
  pricingDetails: {
    originalPrice: Number(bookingData.originalPrice) || 0,
    finalPrice: Number(bookingData.finalPrice) || 0,
    rutDiscount: Number(bookingData.rutDiscount) || 0,
    customFees: (bookingData.customFees || []).map(fee => ({
      name: fee.name,
      amount: Number(fee.amount) || 0
    }))
  }
});

// Map scheduling preferences
const mapSchedulingInfo = (bookingData) => ({
  schedulingPreferences: {
    preferredDate: bookingData.date,
    preferredTime: bookingData.time,
    specialInstructions: bookingData.specialInstructions?.trim()
  }
});

/**
 * Validates the mapped lead data
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

/**
 * Maps booking calculator data to CRM lead format
 */
export const mapBookingToLead = (bookingData) => {
  // Sanitize incoming data
  const sanitizedData = sanitizeData(bookingData);

  const leadData = {
    // Basic lead information
    source: 'booking-calculator',
    status: 'new',
    type: 'service-booking',
    
    // Map all sections
    ...mapCustomerInfo(sanitizedData),
    ...mapServiceDetails(sanitizedData),
    ...mapPricingInfo(sanitizedData),
    ...mapSchedulingInfo(sanitizedData),
    
    // Metadata
    metadata: {
      submittedAt: new Date().toISOString(),
      calculatorVersion: '2.0',
      originalBookingData: sanitizedData // Store sanitized data for reference
    }
  };

  return leadData;
};