// functions/routes/bookings.js
// Cloud Function for automated recurring booking management

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const MAX_BATCH_SIZE = 400; // Firestore batch limit safety

/**
 * Scheduled function to generate recurring bookings daily at midnight
 * Processes all active recurring booking series and generates next occurrences
 */
exports.generateRecurringBookings = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('Europe/Stockholm')
  .onRun(async (context) => {
    console.log('Starting daily recurring bookings generation...');
    
    try {
      // Find all recurring bookings that need next occurrences
      const recurringBookingsQuery = db.collectionGroup('bookings')
        .where('isRecurring', '==', true)
        .where('deleted', '==', false);

      const snapshot = await recurringBookingsQuery.get();
      console.log(`Found ${snapshot.size} recurring booking records to process`);

      const batch = db.batch();
      let batchCount = 0;
      let totalGenerated = 0;
      const processedSeries = new Set(); // Track processed series to avoid duplicates

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const companyId = data.companyId;
        
        // Create unique series identifier
        const seriesId = `${companyId}-${data.customerId}-${data.serviceId}-${data.originalDate?.toDate?.()?.getTime() || data.date?.toDate?.()?.getTime()}`;
        
        // Skip if we've already processed this series
        if (processedSeries.has(seriesId)) {
          continue;
        }
        processedSeries.add(seriesId);

        try {
          // Check if this series is complete
          if (data.occurrenceNumber >= data.totalOccurrences) {
            console.log(`Series ${seriesId} is complete, skipping`);
            continue;
          }

          // Calculate next occurrence date
          const currentDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
          const nextDate = new Date(currentDate);

          if (data.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (data.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
            
            // Handle month-end edge cases
            const originalDay = data.originalDate?.toDate ? 
              data.originalDate.toDate().getDate() : 
              currentDate.getDate();
            const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
            nextDate.setDate(Math.min(originalDay, lastDayOfMonth));
          } else {
            console.warn(`Unknown frequency ${data.frequency} for booking ${doc.id}`);
            continue;
          }

          // Only generate if the next occurrence is within the next 7 days
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          
          if (nextDate > sevenDaysFromNow) {
            continue; // Not time to generate this occurrence yet
          }

          // Check if next occurrence already exists
          const existingBookingQuery = await db.collection('companies')
            .doc(companyId)
            .collection('bookings')
            .where('customerId', '==', data.customerId)
            .where('serviceId', '==', data.serviceId)
            .where('isRecurring', '==', true)
            .where('occurrenceNumber', '==', data.occurrenceNumber + 1)
            .where('deleted', '==', false)
            .get();

          if (!existingBookingQuery.empty) {
            console.log(`Next occurrence already exists for series ${seriesId}`);
            continue;
          }

          // Create next occurrence
          const nextOccurrenceData = {
            ...data,
            date: nextDate,
            occurrenceNumber: data.occurrenceNumber + 1,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            generatedBy: 'recurring-scheduler',
            parentBookingId: doc.id
          };

          // Add to batch
          const newBookingRef = db.collection('companies').doc(companyId).collection('bookings').doc();
          batch.set(newBookingRef, nextOccurrenceData);
          batchCount++;
          totalGenerated++;

          // Commit batch if approaching limit
          if (batchCount >= MAX_BATCH_SIZE) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} recurring bookings`);
            batchCount = 0;
          }

        } catch (bookingError) {
          console.error(`Error processing recurring booking ${doc.id}:`, bookingError);
          // Continue processing other bookings
        }
      }

      // Commit remaining bookings
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} recurring bookings`);
      }

      console.log(`Recurring bookings generation completed. Generated ${totalGenerated} new bookings.`);
      
      return { 
        success: true, 
        processedSeries: processedSeries.size,
        generatedBookings: totalGenerated 
      };

    } catch (error) {
      console.error('Error generating recurring bookings:', error);
      throw error;
    }
  });

/**
 * HTTP callable function to manually generate next occurrence for a specific recurring booking
 * Useful for immediate generation or testing
 */
exports.generateSingleRecurringBooking = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyId, bookingId } = data;
  
  if (!companyId || !bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'Company ID and Booking ID are required');
  }

  // Verify user has access to this company
  const token = context.auth.token;
  if (!token.superAdmin && (!token.adminOf || !token.adminOf.includes(companyId))) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    // Get the recurring booking
    const bookingDoc = await db.doc(`companies/${companyId}/bookings/${bookingId}`).get();
    
    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const bookingData = bookingDoc.data();
    
    if (!bookingData.isRecurring) {
      throw new functions.https.HttpsError('invalid-argument', 'Booking is not a recurring booking');
    }

    if (bookingData.deleted) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot generate from deleted booking');
    }

    if (bookingData.occurrenceNumber >= bookingData.totalOccurrences) {
      throw new functions.https.HttpsError('invalid-argument', 'Recurring series is complete');
    }

    // Calculate next occurrence date
    const currentDate = bookingData.date?.toDate ? bookingData.date.toDate() : new Date(bookingData.date);
    const nextDate = new Date(currentDate);

    if (bookingData.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (bookingData.frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      // Handle month-end edge cases
      const originalDay = bookingData.originalDate?.toDate ? 
        bookingData.originalDate.toDate().getDate() : 
        currentDate.getDate();
      const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(originalDay, lastDayOfMonth));
    } else {
      throw new functions.https.HttpsError('invalid-argument', `Unknown frequency: ${bookingData.frequency}`);
    }

    // Check if next occurrence already exists
    const existingBookingQuery = await db.collection('companies')
      .doc(companyId)
      .collection('bookings')
      .where('customerId', '==', bookingData.customerId)
      .where('serviceId', '==', bookingData.serviceId)
      .where('isRecurring', '==', true)
      .where('occurrenceNumber', '==', bookingData.occurrenceNumber + 1)
      .where('deleted', '==', false)
      .get();

    if (!existingBookingQuery.empty) {
      throw new functions.https.HttpsError('already-exists', 'Next occurrence already exists');
    }

    // Create next occurrence
    const nextOccurrenceData = {
      ...bookingData,
      date: nextDate,
      occurrenceNumber: bookingData.occurrenceNumber + 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedBy: 'manual-generation',
      generatedByUser: context.auth.uid,
      parentBookingId: bookingId
    };

    // Create the new booking
    const newBookingRef = db.collection('companies').doc(companyId).collection('bookings').doc();
    await newBookingRef.set(nextOccurrenceData);

    console.log(`Manual recurring booking generated: ${newBookingRef.id} for company ${companyId}`);

    return {
      success: true,
      newBookingId: newBookingRef.id,
      nextDate: nextDate.toISOString(),
      occurrenceNumber: nextOccurrenceData.occurrenceNumber,
      totalOccurrences: nextOccurrenceData.totalOccurrences
    };

  } catch (error) {
    console.error(`Error generating single recurring booking:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to generate recurring booking', error.message);
  }
});

/**
 * HTTP callable function to update all future occurrences of a recurring booking series
 * Useful when modifying recurring booking details
 */
exports.updateRecurringSeries = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyId, bookingId, updates } = data;
  
  if (!companyId || !bookingId || !updates) {
    throw new functions.https.HttpsError('invalid-argument', 'Company ID, Booking ID, and updates are required');
  }

  // Verify user has access to this company
  const token = context.auth.token;
  if (!token.superAdmin && (!token.adminOf || !token.adminOf.includes(companyId))) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    // Get the original booking
    const originalBookingDoc = await db.doc(`companies/${companyId}/bookings/${bookingId}`).get();
    
    if (!originalBookingDoc.exists || !originalBookingDoc.data().isRecurring) {
      throw new functions.https.HttpsError('not-found', 'Recurring booking not found');
    }

    const originalData = originalBookingDoc.data();

    // Find all future occurrences in this series
    const futureOccurrencesQuery = await db.collection('companies')
      .doc(companyId)
      .collection('bookings')
      .where('customerId', '==', originalData.customerId)
      .where('serviceId', '==', originalData.serviceId)
      .where('isRecurring', '==', true)
      .where('occurrenceNumber', '>', originalData.occurrenceNumber)
      .where('deleted', '==', false)
      .get();

    const batch = db.batch();
    let updateCount = 0;

    // Update all future occurrences
    futureOccurrencesQuery.docs.forEach(doc => {
      const updateData = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
        seriesUpdated: true
      };

      batch.update(doc.ref, updateData);
      updateCount++;
    });

    // Also update the original booking
    const originalUpdateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid,
      seriesUpdated: true
    };
    batch.update(originalBookingDoc.ref, originalUpdateData);
    updateCount++;

    await batch.commit();

    console.log(`Updated ${updateCount} bookings in recurring series for company ${companyId}`);

    return {
      success: true,
      updatedBookings: updateCount,
      seriesId: `${originalData.customerId}-${originalData.serviceId}-${originalData.originalDate?.toDate?.()?.getTime()}`
    };

  } catch (error) {
    console.error(`Error updating recurring series:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update recurring series', error.message);
  }
});

/**
 * HTTP callable function to cancel a recurring booking series
 * Soft-deletes all future occurrences while preserving past bookings
 */
exports.cancelRecurringSeries = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyId, bookingId, reason } = data;
  
  if (!companyId || !bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'Company ID and Booking ID are required');
  }

  // Verify user has access to this company
  const token = context.auth.token;
  if (!token.superAdmin && (!token.adminOf || !token.adminOf.includes(companyId))) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    // Get the original booking
    const originalBookingDoc = await db.doc(`companies/${companyId}/bookings/${bookingId}`).get();
    
    if (!originalBookingDoc.exists || !originalBookingDoc.data().isRecurring) {
      throw new functions.https.HttpsError('not-found', 'Recurring booking not found');
    }

    const originalData = originalBookingDoc.data();
    const now = new Date();

    // Find all future occurrences in this series
    const futureOccurrencesQuery = await db.collection('companies')
      .doc(companyId)
      .collection('bookings')
      .where('customerId', '==', originalData.customerId)
      .where('serviceId', '==', originalData.serviceId)
      .where('isRecurring', '==', true)
      .where('deleted', '==', false)
      .get();

    const batch = db.batch();
    let cancelledCount = 0;

    // Cancel all future occurrences (including current if it's in the future)
    futureOccurrencesQuery.docs.forEach(doc => {
      const bookingData = doc.data();
      const bookingDate = bookingData.date?.toDate ? bookingData.date.toDate() : new Date(bookingData.date);
      
      // Only cancel future bookings
      if (bookingDate >= now) {
        const cancelData = {
          deleted: true,
          deletedAt: admin.firestore.FieldValue.serverTimestamp(),
          deletedBy: context.auth.uid,
          cancellationReason: reason || 'Series cancelled',
          seriesCancelled: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.update(doc.ref, cancelData);
        cancelledCount++;
      }
    });

    await batch.commit();

    console.log(`Cancelled ${cancelledCount} future bookings in recurring series for company ${companyId}`);

    return {
      success: true,
      cancelledBookings: cancelledCount,
      reason: reason || 'Series cancelled',
      seriesId: `${originalData.customerId}-${originalData.serviceId}-${originalData.originalDate?.toDate?.()?.getTime()}`
    };

  } catch (error) {
    console.error(`Error cancelling recurring series:`, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to cancel recurring series', error.message);
  }
});