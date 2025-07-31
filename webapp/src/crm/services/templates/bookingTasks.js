/**
 * Task templates for booking-related follow-ups
 */

export const createBookingFollowUpTask = (leadData) => ({
  title: 'Follow up on new booking inquiry',
  description: `
New booking submission from ${leadData.name}

Service Details:
- Service: ${leadData.serviceConfig.serviceName}
- Area: ${leadData.serviceConfig.area} m²
- Frequency: ${leadData.serviceConfig.frequency}
- Value: ${leadData.value} SEK
${leadData.useRut ? '- RUT deduction applied' : ''}

Scheduling:
- Preferred Date: ${leadData.schedulingPreferences.preferredDate || 'Not specified'}
- Preferred Time: ${leadData.schedulingPreferences.preferredTime || 'Not specified'}

Action Items:
1. Review booking details and pricing
2. Contact customer to confirm requirements
3. Schedule service or propose alternative dates
4. Update lead status after contact

Contact Information:
- Phone: ${leadData.phone || 'Not provided'}
- Email: ${leadData.email}
- Address: ${leadData.address || 'Not provided'}
`.trim(),
  
  priority: 'high',
  category: 'booking-followup',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
  assignedTo: null, // Will be assigned by task distribution logic
  status: 'pending',
  
  metadata: {
    leadId: leadData.id,
    bookingSource: 'calculator',
    requiresRutVerification: leadData.useRut
  }
});