// functions/cascadeDelete.js
// This Cloud Function handles the soft-deletion of subcollections
// when a parent company document is soft-deleted.

const {onDocumentUpdated} = require('firebase-functions/v2/firestore');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const {onCall, onRequest, HttpsError} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Max documents to process in a single batch operation for cascade delete.
// Firestore batch write limit is 500, but keeping it slightly lower is safer.
const MAX_DOCS_PER_BATCH = 400;

/**
 * Cloud Function triggered when a 'company' document is updated.
 * It checks if the 'deleted' field has been set to 'true'.
 * If so, it initiates a soft-delete of all documents in its 'services',
 * 'customers', and 'bookings' subcollections.
 */
exports.cascadeSoftDeleteCompanyData = onDocumentUpdated('companies/{companyId}', async (event) => {
  const companyId = event.params.companyId;
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Ensure the 'deleted' flag changed from false/undefined to true
  if ((!beforeData.deleted || beforeData.deleted === false) && afterData.deleted === true) {
    console.log(`Company ${companyId} soft-deleted. Initiating cascade soft-delete for its subcollections.`);

    // Get the user who initiated the delete, or default to system
    const userId = afterData.deletedBy || 'function_system';

    const subcollectionsToSoftDelete = ['services', 'customers', 'bookings', 'coupons'];

    for (const subcollectionName of subcollectionsToSoftDelete) {
      console.log(`Soft-deleting documents in subcollection: ${subcollectionName} for company ${companyId}`);

      const collectionRef = db.collection('companies').doc(companyId).collection(subcollectionName);
      let querySnapshot;
      let lastDoc = null;
      let totalSoftDeleted = 0;

      do {
        // Query for non-deleted documents in batches
        let query = collectionRef
          .where('deleted', '==', false)
          .limit(MAX_DOCS_PER_BATCH);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        querySnapshot = await query.get();

        if (querySnapshot.empty) {
          console.log(`No more non-deleted documents found in ${subcollectionName} for company ${companyId}.`);
          break; // No documents or all processed for this subcollection
        }

        const batch = db.batch();

        querySnapshot.docs.forEach(docSnapshot => {
          const docData = docSnapshot.data(); // Get data for logging

          batch.update(docSnapshot.ref, {
            deleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
            deletedBy: userId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // TODO: Log personnummer for RUT audit trail if present in the deleted subcollection document
          if (docData.personnummer) {
            console.log(`  Auditing personnummer ${docData.personnummer} from ${docSnapshot.ref.path} during cascade delete.`);
          }
        });

        try {
          await batch.commit(); // Commit the current batch
          totalSoftDeleted += querySnapshot.size;
          lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; // Get the last document for the next batch
          console.log(`Soft-deleted ${querySnapshot.size} documents in batch for ${subcollectionName}. Total: ${totalSoftDeleted}`);
        } catch (batchError) {
          console.error(`Error committing batch for ${subcollectionName} in company ${companyId}:`, batchError);
          // Depending on severity, you might re-throw, log to a dedicated error system, or implement retry logic.
          // For now, we log and continue to the next subcollection, but note this is a potential partial failure.
          break; // Stop processing this subcollection on error to prevent cascading issues.
        }

        // Continue if the batch was full, indicating more documents might exist
      } while (querySnapshot.size === MAX_DOCS_PER_BATCH);

      console.log(`Finished soft-deleting all non-deleted documents in ${subcollectionName} for company ${companyId}. Total soft-deleted in this subcollection: ${totalSoftDeleted}`);
    }

    console.log(`Cascade soft-delete completed for company ${companyId}.`);
    
    // TODO: Integration hooks for third-party services
    // TODO: Send email notification via SendGrid to company admins about cascade delete
    // Example: await sendCascadeDeleteNotification(companyId, userId, subcollectionsToSoftDelete);
    
    // TODO: Sync deleted bookings with Calendly to remove from external calendars
    // Example: await syncDeletedBookingsWithCalendly(companyId, deletedBookings);
    
    // TODO: Notify accounting systems about RUT-eligible booking deletions
    // Example: await notifyAccountingSystemOfRUTDeletions(companyId, rutEligibleBookings);
    
  } else {
    console.log(`Company ${companyId} updated but 'deleted' field did not change to true. No cascade delete needed.`);
  }
});

/**
 * Scheduled Cloud Function that runs weekly on Sundays at 2 AM
 * to permanently delete documents that have been soft-deleted for 30+ days.
 * This ensures GDPR compliance and prevents data retention issues.
 */
exports.cleanupExpiredSoftDeletes = onSchedule({
  schedule: '0 2 * * 0', // Run every Sunday at 2 AM
  timeZone: 'Europe/Stockholm' // Adjust timezone as needed
}, async (event) => {
  console.log('Starting cleanup of expired soft-deleted documents...');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const collectionsToCleanup = [
    { name: 'companies', path: 'companies' },
    { name: 'services', path: 'companies/{companyId}/services' },
    { name: 'customers', path: 'companies/{companyId}/customers' },
    { name: 'bookings', path: 'companies/{companyId}/bookings' },
    { name: 'coupons', path: 'companies/{companyId}/coupons' },
    { name: 'users', path: 'users' }
  ];

  let totalDeleted = 0;

  for (const collection of collectionsToCleanup) {
    console.log(`Cleaning up expired soft-deletes in ${collection.name}...`);

    try {
      if (collection.name === 'companies' || collection.name === 'users') {
        // Handle top-level collections
        const collectionRef = db.collection(collection.name);
        let querySnapshot;
        let lastDoc = null;

        do {
          let query = collectionRef
            .where('deleted', '==', true)
            .where('deletedAt', '<', thirtyDaysAgo)
            .limit(MAX_DOCS_PER_BATCH);

          if (lastDoc) {
            query = query.startAfter(lastDoc);
          }

          querySnapshot = await query.get();

          if (!querySnapshot.empty) {
            const batch = db.batch();
            querySnapshot.docs.forEach(docSnapshot => {
              batch.delete(docSnapshot.ref);
            });

            await batch.commit();
            totalDeleted += querySnapshot.size;
            console.log(`Permanently deleted ${querySnapshot.size} expired documents from ${collection.name}`);
            lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
          }
        } while (querySnapshot && querySnapshot.size === MAX_DOCS_PER_BATCH);
      } else {
        // Handle subcollections - we need to iterate through all companies
        const companiesRef = db.collection('companies');
        const companiesSnapshot = await companiesRef.get();

        for (const companyDoc of companiesSnapshot.docs) {
          const companyId = companyDoc.id;
          const subcollectionRef = db.collection('companies').doc(companyId).collection(collection.name);
          let querySnapshot;
          let lastDoc = null;

          do {
            let query = subcollectionRef
              .where('deleted', '==', true)
              .where('deletedAt', '<', thirtyDaysAgo)
              .limit(MAX_DOCS_PER_BATCH);

            if (lastDoc) {
              query = query.startAfter(lastDoc);
            }

            querySnapshot = await query.get();

            if (!querySnapshot.empty) {
              const batch = db.batch();
              querySnapshot.docs.forEach(docSnapshot => {
                batch.delete(docSnapshot.ref);
              });

              await batch.commit();
              totalDeleted += querySnapshot.size;
              console.log(`Permanently deleted ${querySnapshot.size} expired documents from ${collection.name} in company ${companyId}`);
              lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            }
          } while (querySnapshot && querySnapshot.size === MAX_DOCS_PER_BATCH);
        }
      }
    } catch (error) {
      console.error(`Error cleaning up ${collection.name}:`, error);
      // Continue with other collections even if one fails
    }
  }

  console.log(`Cleanup completed. Total documents permanently deleted: ${totalDeleted}`);
  return { success: true, totalDeleted };
});

/**
 * Utility function to manually trigger cascade delete for a specific company.
 * This can be useful for testing or manual cleanup operations.
 * 
 * Usage: Call this function with a company ID to trigger cascade delete.
 */
exports.manualCascadeDelete = onCall(async (request) => {
  // Verify the user has admin privileges
  if (!request.auth || !request.auth.token.superAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Only super admins can manually trigger cascade deletes.'
    );
  }

  const { companyId } = request.data;

  if (!companyId) {
    throw new HttpsError(
      'invalid-argument',
      'Company ID is required.'
    );
  }

  try {
    console.log(`Manual cascade delete initiated for company: ${companyId}`);

    // First, soft-delete the company document
    const companyRef = db.collection('companies').doc(companyId);
    await companyRef.update({
      deleted: true,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // The cascade delete will be triggered automatically by the onUpdate function
    console.log(`Manual cascade delete completed for company: ${companyId}`);

    return { success: true, message: `Cascade delete initiated for company ${companyId}` };
  } catch (error) {
    console.error(`Error in manual cascade delete for company ${companyId}:`, error);
    throw new HttpsError(
      'internal',
      'Failed to execute cascade delete.',
      error.message
    );
  }
});

/**
 * Function to restore a soft-deleted company and its subcollections.
 * This provides a way to undo accidental deletions within a reasonable timeframe.
 */
exports.restoreSoftDeletedCompany = onCall(async (request) => {
  // Verify the user has admin privileges
  if (!request.auth || !request.auth.token.superAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Only super admins can restore deleted companies.'
    );
  }

  const { companyId } = request.data;

  if (!companyId) {
    throw new HttpsError(
      'invalid-argument',
      'Company ID is required.'
    );
  }

  try {
    console.log(`Restoring soft-deleted company: ${companyId}`);

    // First, restore the company document
    const companyRef = db.collection('companies').doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists || !companyDoc.data().deleted) {
      throw new HttpsError(
        'not-found',
        'Company not found or not deleted.'
      );
    }

    await companyRef.update({
      deleted: false,
      deletedAt: admin.firestore.FieldValue.delete(),
      deletedBy: admin.firestore.FieldValue.delete(),
      restoredAt: admin.firestore.FieldValue.serverTimestamp(),
      restoredBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Restore subcollections
    const subcollectionsToRestore = ['services', 'customers', 'bookings', 'coupons'];

    for (const subcollectionName of subcollectionsToRestore) {
      console.log(`Restoring documents in subcollection: ${subcollectionName} for company ${companyId}`);

      const collectionRef = db.collection('companies').doc(companyId).collection(subcollectionName);
      let querySnapshot;
      let lastDoc = null;
      let totalRestored = 0;

      do {
        let query = collectionRef
          .where('deleted', '==', true)
          .limit(MAX_DOCS_PER_BATCH);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        querySnapshot = await query.get();

        if (querySnapshot.empty) {
          break;
        }

        const batch = db.batch();

        querySnapshot.docs.forEach(docSnapshot => {
          batch.update(docSnapshot.ref, {
            deleted: false,
            deletedAt: admin.firestore.FieldValue.delete(),
            deletedBy: admin.firestore.FieldValue.delete(),
            restoredAt: admin.firestore.FieldValue.serverTimestamp(),
            restoredBy: request.auth.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();
        totalRestored += querySnapshot.size;
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        console.log(`Restored ${querySnapshot.size} documents in batch for ${subcollectionName}. Total: ${totalRestored}`);
      } while (querySnapshot.size === MAX_DOCS_PER_BATCH);

      console.log(`Finished restoring all soft-deleted documents in ${subcollectionName} for company ${companyId}. Total restored: ${totalRestored}`);
    }

    console.log(`Company ${companyId} and its subcollections restored successfully.`);
    return { success: true, message: `Company ${companyId} restored successfully` };
  } catch (error) {
    console.error(`Error restoring company ${companyId}:`, error);
    throw new HttpsError(
      'internal',
      'Failed to restore company.',
      error.message
    );
  }
});