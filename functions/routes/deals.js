const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Helper function to extract customer and service details from a deal
const extractJobDetailsFromDeal = (deal) => {
  return {
    customerId: deal.customerId,
    customerName: deal.customerName,
    serviceName: deal.serviceName || 'Unnamed Service',
    serviceId: deal.serviceId,
    address: deal.address,
    scheduledAt: null, // Will be set by operations team
    status: 'Pending Schedule',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    sourceType: 'deal',
    sourceDealId: deal.id,
    companyId: deal.companyId,
    notes: `Auto-created from Deal: ${deal.title || 'Untitled Deal'}`,
    // Preserve any custom fields from the deal that might be relevant
    customFields: deal.customFields || {},
    // Initialize crew assignment fields
    crewId: null,
    crewName: null,
    // Contact information
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    contactEmail: deal.contactEmail,
    // Service details
    estimatedDuration: deal.estimatedDuration || '2h', // Default to 2 hours if not specified
    price: deal.price || 0,
    currency: deal.currency || 'SEK',
    // Metadata
    metadata: {
      createdFromDeal: true,
      dealId: deal.id,
      dealTitle: deal.title,
      conversionDate: admin.firestore.FieldValue.serverTimestamp()
    }
  };
};

// Main function to handle deal status changes
exports.onDealStatusChange = functions.firestore
  .document('companies/{companyId}/deals/{dealId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const { companyId, dealId } = context.params;

    // Only proceed if status changed to "Won"
    if (beforeData.status !== 'Won' && afterData.status === 'Won') {
      const db = admin.firestore();
      
      try {
        // Prepare job data
        const jobData = extractJobDetailsFromDeal({
          ...afterData,
          id: dealId,
          companyId: companyId
        });

        // Create the job document
        const jobRef = db.collection('companies').doc(companyId)
          .collection('jobs').doc();

        await jobRef.set(jobData);

        // Update the deal with reference to created job
        await change.after.ref.update({
          metadata: {
            ...(afterData.metadata || {}),
            convertedToJob: true,
            jobId: jobRef.id,
            conversionDate: admin.firestore.FieldValue.serverTimestamp()
          }
        });

        console.log(`Successfully created job ${jobRef.id} from deal ${dealId}`);
        
        return { success: true, jobId: jobRef.id };
      } catch (error) {
        console.error('Error creating job from deal:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create job from deal', error);
      }
    }

    return null; // No action needed for other status changes
  });