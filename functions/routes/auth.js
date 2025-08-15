// functions/routes/auth.js
// Cloud Functions for authentication and user role management

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Set custom claims for a user (superAdmin or adminOf specific companies)
 * This function should be called after user registration to set up permissions
 */
exports.setUserClaims = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users to call this function
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, role, companyId } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  if (!role || !['superAdmin', 'companyAdmin'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role must be either "superAdmin" or "companyAdmin"');
  }

  if (role === 'companyAdmin' && !companyId) {
    throw new functions.https.HttpsError('invalid-argument', 'Company ID is required for companyAdmin role');
  }

  try {
    // Get current user claims
    const user = await admin.auth().getUser(userId);
    const currentClaims = user.customClaims || {};

    let newClaims = { ...currentClaims };

    if (role === 'superAdmin') {
      // Only existing super admins can create new super admins
      const callerToken = context.auth.token;
      if (!callerToken.superAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only super admins can grant super admin privileges');
      }
      
      newClaims.superAdmin = true;
      console.log(`Setting superAdmin claim for user: ${userId}`);
      
    } else if (role === 'companyAdmin') {
      // Verify the caller has permission to add admins to this company
      const callerToken = context.auth.token;
      const canAddAdmin = callerToken.superAdmin || 
                         (callerToken.adminOf && callerToken.adminOf.includes(companyId));
      
      if (!canAddAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions to add company admin');
      }

      // Add company to adminOf array
      const adminOf = currentClaims.adminOf || [];
      if (!adminOf.includes(companyId)) {
        adminOf.push(companyId);
      }
      newClaims.adminOf = adminOf;
      
      // Also update the company document
      const companyRef = db.doc(`companies/${companyId}`);
      const companyDoc = await companyRef.get();
      
      if (companyDoc.exists) {
        await companyRef.update({
          adminUid: userId, // Set as primary admin
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          adminUpdatedBy: context.auth.uid
        });
      }
      
      console.log(`Setting companyAdmin claim for user: ${userId}, company: ${companyId}`);
    }

    // Set the custom claims
    await admin.auth().setCustomUserClaims(userId, newClaims);
    
    // Update user document in Firestore
    const userRef = db.doc(`users/${userId}`);
    await userRef.set({
      uid: userId,
      email: user.email,
      superAdmin: newClaims.superAdmin || false,
      adminOf: newClaims.adminOf || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      claimsUpdatedBy: context.auth.uid
    }, { merge: true });

    console.log(`Custom claims set successfully for user: ${userId}`);
    
    return {
      success: true,
      userId,
      role,
      companyId: role === 'companyAdmin' ? companyId : null,
      claims: newClaims
    };

  } catch (error) {
    console.error('Error setting custom claims:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to set user claims', error.message);
  }
});

/**
 * Initialize the first super admin (one-time setup function)
 * This should be called once to set up the initial super admin
 */
exports.initializeSuperAdmin = functions.https.onCall(async (data, context) => {
  const { email, setupKey } = data;
  
  // Security check - require a setup key to prevent unauthorized access
  const expectedSetupKey = functions.config().setup?.key || 'swedprime-setup-2025';
  if (setupKey !== expectedSetupKey) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid setup key');
  }

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Find user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Check if there are already super admins
    const existingSuperAdmins = await db.collection('users')
      .where('superAdmin', '==', true)
      .where('deleted', '==', false)
      .get();
    
    if (!existingSuperAdmins.empty) {
      throw new functions.https.HttpsError('already-exists', 'Super admin already exists. Use setUserClaims function instead.');
    }

    // Set super admin claims
    const claims = {
      superAdmin: true,
      adminOf: []
    };
    
    await admin.auth().setCustomUserClaims(user.uid, claims);
    
    // Create/update user document
    const userRef = db.doc(`users/${user.uid}`);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      superAdmin: true,
      adminOf: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deleted: false,
      initialSuperAdmin: true
    }, { merge: true });

    console.log(`Initial super admin created: ${user.email} (${user.uid})`);
    
    return {
      success: true,
      message: 'Super admin initialized successfully',
      userId: user.uid,
      email: user.email
    };

  } catch (error) {
    console.error('Error initializing super admin:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to initialize super admin', error.message);
  }
});

/**
 * Remove user claims (revoke admin privileges)
 */
exports.removeUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, role, companyId } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    // Only super admins can revoke privileges
    const callerToken = context.auth.token;
    if (!callerToken.superAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Only super admins can revoke privileges');
    }

    // Get current user claims
    const user = await admin.auth().getUser(userId);
    const currentClaims = user.customClaims || {};
    let newClaims = { ...currentClaims };

    if (role === 'superAdmin') {
      // Prevent removing the last super admin
      const superAdminCount = await db.collection('users')
        .where('superAdmin', '==', true)
        .where('deleted', '==', false)
        .get();
      
      if (superAdminCount.size <= 1) {
        throw new functions.https.HttpsError('failed-precondition', 'Cannot remove the last super admin');
      }
      
      newClaims.superAdmin = false;
      
    } else if (role === 'companyAdmin' && companyId) {
      // Remove company from adminOf array
      const adminOf = currentClaims.adminOf || [];
      newClaims.adminOf = adminOf.filter(id => id !== companyId);
      
      // Update company document to remove admin reference
      const companyRef = db.doc(`companies/${companyId}`);
      const companyDoc = await companyRef.get();
      
      if (companyDoc.exists && companyDoc.data().adminUid === userId) {
        await companyRef.update({
          adminUid: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          adminRemovedBy: context.auth.uid
        });
      }
    }

    // Set the updated claims
    await admin.auth().setCustomUserClaims(userId, newClaims);
    
    // Update user document
    const userRef = db.doc(`users/${userId}`);
    await userRef.update({
      superAdmin: newClaims.superAdmin || false,
      adminOf: newClaims.adminOf || [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      claimsRemovedBy: context.auth.uid
    });

    console.log(`Claims removed for user: ${userId}, role: ${role}`);
    
    return {
      success: true,
      userId,
      removedRole: role,
      companyId: role === 'companyAdmin' ? companyId : null,
      remainingClaims: newClaims
    };

  } catch (error) {
    console.error('Error removing user claims:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to remove user claims', error.message);
  }
});

/**
 * Get user claims and permissions (for debugging)
 */
exports.getUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;
  const targetUserId = userId || context.auth.uid; // Default to caller's ID
  
  try {
    // Only allow users to check their own claims, or super admins to check anyone's
    const callerToken = context.auth.token;
    if (targetUserId !== context.auth.uid && !callerToken.superAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Can only check your own claims or must be super admin');
    }

    const user = await admin.auth().getUser(targetUserId);
    const userDoc = await db.doc(`users/${targetUserId}`).get();
    
    return {
      userId: targetUserId,
      email: user.email,
      customClaims: user.customClaims || {},
      firestoreData: userDoc.exists ? userDoc.data() : null,
      tokenClaims: context.auth.uid === targetUserId ? context.auth.token : null
    };

  } catch (error) {
    console.error('Error getting user claims:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get user claims', error.message);
  }
});

/**
 * Trigger to automatically create user document when a new user signs up
 */
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
  try {
    const userRef = db.doc(`users/${user.uid}`);
    
    await userRef.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      superAdmin: false,
      adminOf: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deleted: false,
      signUpMethod: user.providerData[0]?.providerId || 'unknown'
    });

    console.log(`User document created for: ${user.email} (${user.uid})`);
    
  } catch (error) {
    console.error('Error creating user document:', error);
    // Don't throw error to avoid blocking user creation
  }
});

/**
 * Trigger to clean up user document when a user is deleted
 */
exports.cleanupUserDocument = functions.auth.user().onDelete(async (user) => {
  try {
    const userRef = db.doc(`users/${user.uid}`);
    
    await userRef.update({
      deleted: true,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      authDeleted: true
    });

    console.log(`User document marked as deleted for: ${user.email} (${user.uid})`);
    
  } catch (error) {
    console.error('Error cleaning up user document:', error);
    // Don't throw error to avoid blocking user deletion
  }
});