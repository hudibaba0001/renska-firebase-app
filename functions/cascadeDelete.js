// functions/cascadeDelete.js
// This Cloud Function handles the soft-deletion of subcollections
// when a parent company document is soft-deleted.

const functions = require('firebase-functions');
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
exports.cascadeSoftDeleteCompanyData = functions.firestore
  .document('companies/{companyId}') // Corrected trigger: Only for company documents
  .onUpdate(async (change, context) => {
    const companyId = context.params.companyId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

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

      console.log(`Cascade soft-delete process for company ${companyId} completed.`);
    } else {
      console.log(`Company ${companyId} update detected, but 'deleted' flag did not change to true. No cascade initiated.`);
    }

    return null; // Cloud Functions must return a Promise or null/undefined
  });

/**
 * Cloud Function to handle cleanup of expired soft-deleted documents.
 * This function can be triggered periodically to permanently delete documents
 * that have been soft-deleted for a specified period (e.g., 30 days).
 * 
 * Usage: Deploy as a scheduled function or call manually for cleanup.
 */
exports.cleanupExpiredSoftDeletes = functions.pubsub
  .schedule('0 2 * * 0') // Run every Sunday at 2 AM
  .timeZone('Europe/Stockholm') // Adjust timezone as needed
  .onRun(async (context) => {
    console.log('Starting cleanup of expired soft-deleted documents...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const collectionsToCleanup = [
      { path: 'companies', isCollectionGroup: false },
      { path: 'users', isCollectionGroup: false },
      { path: 'services', isCollectionGroup: true },
      { path: 'customers', isCollectionGroup: true },
      { path: 'bookings', isCollectionGroup: true },
      { path: 'coupons', isCollectionGroup: true }
    ];

    for (const collectionInfo of collectionsToCleanup) {
      console.log(`Cleaning up expired soft-deletes in: ${collectionInfo.path}`);

      let queryRef;
      if (collectionInfo.isCollectionGroup) {
        queryRef = db.collectionGroup(collectionInfo.path);
      } else {
        queryRef = db.collection(collectionInfo.path);
      }

      const expiredDocsQuery = queryRef
        .where('deleted', '==', true)
        .where('deletedAt', '<=', thirtyDaysAgo)
        .limit(MAX_DOCS_PER_BATCH);

      let totalDeleted = 0;
      let querySnapshot;

      do {
        querySnapshot = await expiredDocsQuery.get();

        if (querySnapshot.empty) {
          break;
        }

        const batch = db.batch();

        querySnapshot.docs.forEach(docSnapshot => {
          const docData = docSnapshot.data();
          
          // Log personnummer for audit trail before permanent deletion
          if (docData.personnummer) {
            console.log(`  Permanently deleting document with personnummer ${docData.personnummer} from ${docSnapshot.ref.path}`);
          }

          batch.delete(docSnapshot.ref);
        });

        try {
          await batch.commit();
          totalDeleted += querySnapshot.size;
          console.log(`Permanently deleted ${querySnapshot.size} expired documents from ${collectionInfo.path}. Total: ${totalDeleted}`);
        } catch (error) {
          console.error(`Error permanently deleting documents from ${collectionInfo.path}:`, error);
          break;
        }

      } while (querySnapshot.size === MAX_DOCS_PER_BATCH);

      console.log(`Cleanup completed for ${collectionInfo.path}. Total permanently deleted: ${totalDeleted}`);
    }

    console.log('Expired soft-delete cleanup completed.');
    return null;
  });

/**
 * Utility function to manually trigger cascade delete for a specific company.
 * This can be useful for testing or manual cleanup operations.
 * 
 * Usage: Call this function with a company ID to trigger cascade delete.
 */
exports.manualCascadeDelete = functions.https.onCall(async (data, context) => {
  // Verify the user has admin privileges
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can manually trigger cascade deletes.'
    );
  }

  const { companyId } = data;

  if (!companyId) {
    throw new functions.https.HttpsError(
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
      deletedBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // The cascade delete will be triggered automatically by the onUpdate function
    console.log(`Manual cascade delete completed for company: ${companyId}`);

    return { success: true, message: `Cascade delete initiated for company ${companyId}` };
  } catch (error) {
    console.error(`Error in manual cascade delete for company ${companyId}:`, error);
    throw new functions.https.HttpsError(
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
exports.restoreSoftDeletedCompany = functions.https.onCall(async (data, context) => {
  // Verify the user has admin privileges
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can restore deleted companies.'
    );
  }

  const { companyId } = data;

  if (!companyId) {
    throw new functions.https.HttpsError(
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
      throw new functions.https.HttpsError(
        'not-found',
        'Company not found or not deleted.'
      );
    }

    await companyRef.update({
      deleted: false,
      deletedAt: admin.firestore.FieldValue.delete(),
      deletedBy: admin.firestore.FieldValue.delete(),
      restoredAt: admin.firestore.FieldValue.serverTimestamp(),
      restoredBy: context.auth.uid,
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
            restoredBy: context.auth.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();
        totalRestored += querySnapshot.size;
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        console.log(`Restored ${querySnapshot.size} documents in batch for ${subcollectionName}. Total: ${totalRestored}`);

      } while (querySnapshot.size === MAX_DOCS_PER_BATCH);

      console.log(`Finished restoring documents in ${subcollectionName} for company ${companyId}. Total restored: ${totalRestored}`);
    }

    console.log(`Company ${companyId} and its subcollections have been successfully restored.`);

    return { success: true, message: `Company ${companyId} successfully restored` };
  } catch (error) {
    console.error(`Error restoring company ${companyId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to restore company.',
      error.message
    );
  }
});