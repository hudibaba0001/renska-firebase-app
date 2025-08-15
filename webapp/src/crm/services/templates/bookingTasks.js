/**
 * Task templates for booking-related CRM tasks
 */
import { createTask } from '../taskService';

/**
 * Creates a follow-up task for a new booking lead
 * @param {string} companyId - Company ID
 * @param {string} leadId - Lead ID
 * @param {Object} leadData - Mapped lead data
 * @param {Object} options - Additional task options (priority, dueDate)
 * @returns {Promise<Object>} Created task
 */
export const createFollowUpTaskForBookingLead = async (companyId, leadId, leadData, options = {}) => {
  const {
    priority = 'high',
    dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Default: Due in 24 hours
  } = options;

  // Format service details
  const serviceDetails = [
    `Service: ${leadData.serviceConfig.serviceName}`,
    `Area: ${leadData.serviceConfig.area}m²`,
    leadData.serviceConfig.rooms && `Rooms: ${leadData.serviceConfig.rooms}`,
    leadData.serviceConfig.frequency && `Frequency: ${leadData.serviceConfig.frequency}`,
    leadData.serviceConfig.addOns?.length > 0 && 
      `Add-ons: ${leadData.serviceConfig.addOns.map(a => a.name).join(', ')}`,
    leadData.serviceConfig.windowTypes?.length > 0 &&
      `Windows: ${leadData.serviceConfig.windowTypes.map(w => `${w.type} (${w.count})`).join(', ')}`
  ].filter(Boolean).join('\n');

  // Format pricing details
  const pricingDetails = [
    `Original Price: ${leadData.pricingDetails.originalPrice} SEK`,
    `Final Price: ${leadData.pricingDetails.finalPrice} SEK`,
    leadData.pricingDetails.rutDiscount > 0 && 
      `RUT Discount: ${leadData.pricingDetails.rutDiscount} SEK`,
    leadData.pricingDetails.customFees?.length > 0 &&
      `Custom Fees: ${leadData.pricingDetails.customFees.map(f => `${f.name}: ${f.amount} SEK`).join(', ')}`
  ].filter(Boolean).join('\n');

  // Format scheduling preferences
  const schedulingDetails = [
    leadData.schedulingPreferences.preferredDate && 
      `Preferred Date: ${new Date(leadData.schedulingPreferences.preferredDate).toLocaleDateString()}`,
    leadData.schedulingPreferences.preferredTime &&
      `Preferred Time: ${leadData.schedulingPreferences.preferredTime}`,
    leadData.schedulingPreferences.specialInstructions &&
      `Special Instructions: ${leadData.schedulingPreferences.specialInstructions}`
  ].filter(Boolean).join('\n');

  const taskData = {
    title: `Follow up on booking from ${leadData.name}`,
    description: [
      `New booking submission from ${leadData.name}`,
      `Email: ${leadData.email}`,
      leadData.phone && `Phone: ${leadData.phone}`,
      leadData.address && `Address: ${leadData.address}`,
      '',
      '=== Service Details ===',
      serviceDetails,
      '',
      '=== Pricing ===',
      pricingDetails,
      '',
      '=== Scheduling ===',
      schedulingDetails,
      '',
      '=== Action Items ===',
      '1. Review booking details and verify pricing',
      '2. Contact customer to confirm requirements',
      '3. Schedule service or propose alternative dates',
      '4. Update lead status after contact'
    ].filter(Boolean).join('\n'),
    priority,
    dueDate: dueDate.toISOString(),
    status: 'pending',
    type: 'booking-follow-up',
    leadId,
    metadata: {
      source: 'booking-calculator',
      bookingValue: leadData.pricingDetails.finalPrice,
      requiresRut: leadData.useRut || false
    }
  };

  try {
    const task = await createTask(companyId, taskData);
    console.log('✅ Created follow-up task for booking lead:', task.id);
    return task;
  } catch (error) {
    console.error('Failed to create follow-up task:', error);
    // We don't throw here to avoid failing the entire lead creation
    // Instead, we log the error and return null
    return null;
  }
};