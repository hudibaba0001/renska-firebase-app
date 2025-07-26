// functions/routes/users.js
// Cloud Functions for user management and GDPR compliance

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

// Middleware for JSON parsing
app.use(express.json());

/**
 * GDPR "Right to be Forgotten" endpoint
 * Implements complete user data deletion across all collections
 */
app.post('/v1/deleteUserData', async (req, res) => {
  try {
    const { userId, requestedBy, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    console.log(`GDPR deletion request received for user: ${userId}`);
    console.log(`Requested by: ${requestedBy || 'unknown'}`);
    console.log(`Reason: ${reason || 'GDPR right to be forgotten'}`);

    // Start transaction for atomic deletion
    const result = await db.runTransaction(async (transaction) => {
      // Get user document
      const userRef = db.doc(`users/${userId}`);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      if (userData.deleted) {
        throw new Error('User already marked for deletion');
      }

      const deletionTimestamp = admin.firestore.FieldValue.serverTimestamp();
      const deletionData = {
        deleted: true,
        deletedAt: deletionTimestamp,
        deletedBy: requestedBy || 'gdpr-request',
        deletionReason: reason || 'GDPR right to be forgotten',
        gdprDeletion: true
      };

      // Mark user for deletion
      transaction.update(userRef, deletionData);

      // Get companies where user is admin
      const adminOfCompanies = userData.adminOf || [];
      const deletionSummary = {
        userId,
        userDeleted: true,
        companiesProcessed: 0,
        subcollectionsProcessed: 0,
        totalDocumentsMarked: 1 // User document
      };

      // Process each company the user administers
      for (const companyId of adminOfCompanies) {
        const companyRef = db.doc(`companies/${companyId}`);
        const companyDoc = await transaction.get(companyRef);
        
        if (companyDoc.exists && !companyDoc.data().deleted) {
          // Check if user is the sole admin
          const companyData = companyDoc.data();
          const isSoleAdmin = companyData.adminUid === userId;
          
          if (isSoleAdmin) {
            // Mark company for deletion
            transaction.update(companyRef, {
              ...deletionData,
              originalAdminUid: userId,
              companyOrphaned: true
            });
            
            deletionSummary.companiesProcessed++;
            deletionSummary.totalDocumentsMarked++;

            // Note: Subcollection deletion will be handled by cascade delete Cloud Function
            // We don't delete subcollections in this transaction to avoid timeout
            console.log(`Company ${companyId} marked for cascade deletion (sole admin: ${userId})`);
          } else {
            // Remove user from company admin list if there are other admins
            const updatedAdminOf = (companyData.adminOf || []).filter(id => id !== userId);
            transaction.update(companyRef, {
              adminOf: updatedAdminOf,
              updatedAt: deletionTimestamp,
              adminRemoved: userId,
              adminRemovedReason: 'GDPR deletion'
            });
            
            console.log(`User ${userId} removed from company ${companyId} admin list`);
          }
        }
      }

      return deletionSummary;
    });

    // Log successful deletion
    console.log(`GDPR deletion completed for user ${userId}:`, result);

    // Create audit log entry
    await db.collection('gdprAuditLog').add({
      userId,
      action: 'user_data_deletion',
      requestedBy: requestedBy || 'unknown',
      reason: reason || 'GDPR right to be forgotten',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      result,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'User data marked for deletion successfully',
      deletionId: `gdpr-${userId}-${Date.now()}`,
      summary: result,
      note: 'Cascade deletion of company data will be processed by background functions'
    });

  } catch (error) {
    console.error('Error processing GDPR deletion request:', error);
    
    // Log failed deletion attempt
    try {
      await db.collection('gdprAuditLog').add({
        userId: req.body.userId,
        action: 'user_data_deletion_failed',
        error: error.message,
        requestedBy: req.body.requestedBy || 'unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (auditError) {
      console.error('Failed to log GDPR deletion error:', auditError);
    }

    res.status(500).json({
      error: 'Failed to process deletion request',
      message: error.message,
      code: 'DELETION_FAILED'
    });
  }
});

/**
 * Get GDPR deletion status endpoint
 * Allows checking the status of a deletion request
 */
app.get('/v1/deletionStatus/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Check user deletion status
    const userDoc = await db.doc(`users/${userId}`).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = userDoc.data();
    const isDeleted = userData.deleted || false;

    // Get audit log entries for this user
    const auditQuery = await db.collection('gdprAuditLog')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const auditEntries = auditQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString()
    }));

    res.status(200).json({
      userId,
      deleted: isDeleted,
      deletedAt: userData.deletedAt?.toDate?.()?.toISOString(),
      deletedBy: userData.deletedBy,
      deletionReason: userData.deletionReason,
      gdprDeletion: userData.gdprDeletion || false,
      auditTrail: auditEntries
    });

  } catch (error) {
    console.error('Error checking deletion status:', error);
    res.status(500).json({
      error: 'Failed to check deletion status',
      message: error.message,
      code: 'STATUS_CHECK_FAILED'
    });
  }
});

/**
 * Export user data endpoint (GDPR data portability)
 * Provides complete user data export in JSON format
 */
app.get('/v1/exportUserData/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { requestedBy } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    console.log(`Data export request for user: ${userId}`);

    // Get user data
    const userDoc = await db.doc(`users/${userId}`).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = userDoc.data();
    
    if (userData.deleted) {
      return res.status(410).json({
        error: 'User data has been deleted',
        code: 'USER_DELETED'
      });
    }

    const exportData = {
      user: {
        id: userId,
        ...userData,
        createdAt: userData.createdAt?.toDate?.()?.toISOString(),
        updatedAt: userData.updatedAt?.toDate?.()?.toISOString()
      },
      companies: [],
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: requestedBy || 'unknown',
        exportType: 'GDPR_data_portability'
      }
    };

    // Get companies where user is admin
    const adminOfCompanies = userData.adminOf || [];
    
    for (const companyId of adminOfCompanies) {
      const companyDoc = await db.doc(`companies/${companyId}`).get();
      
      if (companyDoc.exists && !companyDoc.data().deleted) {
        const companyData = companyDoc.data();
        
        // Only include company data if user is the admin
        if (companyData.adminUid === userId) {
          exportData.companies.push({
            id: companyId,
            ...companyData,
            createdAt: companyData.createdAt?.toDate?.()?.toISOString(),
            updatedAt: companyData.updatedAt?.toDate?.()?.toISOString()
          });
        }
      }
    }

    // Log export request
    await db.collection('gdprAuditLog').add({
      userId,
      action: 'user_data_export',
      requestedBy: requestedBy || 'unknown',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      companiesIncluded: exportData.companies.length,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json(exportData);

  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      error: 'Failed to export user data',
      message: error.message,
      code: 'EXPORT_FAILED'
    });
  }
});

/**
 * Batch GDPR deletion endpoint for multiple users
 * Useful for bulk deletion requests
 */
app.post('/v1/batchDeleteUsers', async (req, res) => {
  try {
    const { userIds, requestedBy, reason } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        error: 'User IDs array is required',
        code: 'MISSING_USER_IDS'
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({ 
        error: 'Maximum 100 users can be deleted in a single batch',
        code: 'BATCH_SIZE_EXCEEDED'
      });
    }

    console.log(`Batch GDPR deletion request for ${userIds.length} users`);

    const results = [];
    
    // Process each user deletion
    for (const userId of userIds) {
      try {
        // Call the single user deletion logic
        const response = await fetch(`${req.protocol}://${req.get('host')}/v1/deleteUserData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, requestedBy, reason })
        });
        
        const result = await response.json();
        
        results.push({
          userId,
          success: response.ok,
          result: result
        });
        
      } catch (userError) {
        console.error(`Error deleting user ${userId}:`, userError);
        results.push({
          userId,
          success: false,
          error: userError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // Log batch operation
    await db.collection('gdprAuditLog').add({
      action: 'batch_user_deletion',
      requestedBy: requestedBy || 'unknown',
      reason: reason || 'Batch GDPR deletion',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      totalUsers: userIds.length,
      successCount,
      failureCount,
      results,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: `Batch deletion completed: ${successCount} successful, ${failureCount} failed`,
      totalProcessed: userIds.length,
      successCount,
      failureCount,
      results
    });

  } catch (error) {
    console.error('Error processing batch deletion:', error);
    res.status(500).json({
      error: 'Failed to process batch deletion',
      message: error.message,
      code: 'BATCH_DELETION_FAILED'
    });
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

// Also export individual functions for direct calling
exports.deleteUserData = functions.https.onCall(async (data, context) => {
  // Verify authentication for callable function
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, reason } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  // Verify user can delete this data (must be the user themselves or super admin)
  const token = context.auth.token;
  if (context.auth.uid !== userId && !token.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Can only delete your own data or must be super admin');
  }

  try {
    // Use the same logic as the REST endpoint
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.doc(`users/${userId}`);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data();
      
      if (userData.deleted) {
        throw new functions.https.HttpsError('already-exists', 'User already marked for deletion');
      }

      const deletionData = {
        deleted: true,
        deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        deletedBy: context.auth.uid,
        deletionReason: reason || 'GDPR right to be forgotten',
        gdprDeletion: true
      };

      transaction.update(userRef, deletionData);

      // Handle company deletions
      const adminOfCompanies = userData.adminOf || [];
      let companiesProcessed = 0;

      for (const companyId of adminOfCompanies) {
        const companyRef = db.doc(`companies/${companyId}`);
        const companyDoc = await transaction.get(companyRef);
        
        if (companyDoc.exists && !companyDoc.data().deleted) {
          const companyData = companyDoc.data();
          
          if (companyData.adminUid === userId) {
            transaction.update(companyRef, {
              ...deletionData,
              originalAdminUid: userId,
              companyOrphaned: true
            });
            companiesProcessed++;
          }
        }
      }

      return { userId, companiesProcessed };
    });

    // Log the deletion
    await db.collection('gdprAuditLog').add({
      userId,
      action: 'callable_user_deletion',
      requestedBy: context.auth.uid,
      reason: reason || 'GDPR right to be forgotten',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      result
    });

    return {
      success: true,
      message: 'User data marked for deletion successfully',
      result
    };

  } catch (error) {
    console.error('Error in callable deleteUserData:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete user data', error.message);
  }
});