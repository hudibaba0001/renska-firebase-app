import { createLead } from './leadService';
import { createTask } from './taskService';
import { mapBookingToLead, validateMappedLead } from './mappers/bookingToLead';
import { createBookingFollowUpTask } from './templates/bookingTasks';
import { secureLogger } from '../../utils/secureLogger';

/**
 * Creates a CRM lead from booking calculator submission
 */
export const createLeadFromBooking = async (companyId, bookingData) => {
  try {
    secureLogger.info('Creating lead from booking submission', { companyId });
    
    // Map booking data to lead format
    const mappedLead = mapBookingToLead(bookingData);
    
    // Validate mapped data
    const { isValid, errors } = validateMappedLead(mappedLead);
    if (!isValid) {
      throw new Error(`Invalid booking data: ${errors.join(', ')}`);
    }
    
    // Create the lead
    const lead = await createLead(companyId, mappedLead);
    secureLogger.info('Lead created successfully', { leadId: lead.id });
    
    // Create follow-up task
    const taskData = createBookingFollowUpTask({
      ...mappedLead,
      id: lead.id
    });
    
    const task = await createTask(companyId, taskData);
    secureLogger.info('Follow-up task created', { taskId: task.id, leadId: lead.id });
    
    return {
      lead,
      task,
      message: 'Lead and follow-up task created successfully'
    };
    
  } catch (error) {
    secureLogger.error('Failed to create lead from booking', {
      error,
      companyId,
      bookingData: { // Log safe subset of data
        serviceId: bookingData.serviceId,
        area: bookingData.area,
        frequency: bookingData.frequency
      }
    });
    throw error;
  }
};