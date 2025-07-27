// functions/index-simple.js
// Simplified Cloud Functions entry point with only essential functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Create company with proper permissions
exports.createCompany = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyName, address, orgNumber, adminName, adminEmail, adminPhone, plan } = data;
  const userId = context.auth.uid;

  // Validate required fields
  if (!companyName || !address || !orgNumber || !adminName || !adminEmail || !adminPhone) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    // Generate company ID
    const companyId = admin.firestore().collection('companies').doc().id;

    // Create company document
    const companyRef = db.collection('companies').doc(companyId);
    batch.set(companyRef, {
      companyName,
      address,
      orgNumber,
      adminName,
      adminEmail,
      adminPhone,
      adminUid: userId,
      created: admin.firestore.FieldValue.serverTimestamp(),
      plan: plan || 'starter',
      pricePerSqm: 0,
      services: [],
      frequencyMultiplier: {},
      addOns: {},
      windowCleaningPrices: {},
      zipAreas: [],
      rutEnabled: false,
      subscriptionStatus: 'pending',
      isPublic: false, // Default to false for security
      deleted: false
    });

    // Create customer document for Stripe
    const customerRef = db.collection('customers').doc(userId);
    batch.set(customerRef, {
      email: adminEmail,
      stripeLink: companyId,
      metadata: {
        companyId: companyId,
        companyName: companyName
      }
    });

    // Create user profile
    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, {
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      companyId,
      role: 'admin',
      created: admin.firestore.FieldValue.serverTimestamp(),
      deleted: false
    });

    // Commit the batch
    await batch.commit();

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, {
      adminOf: [companyId],
      role: 'companyadmin'
    });

    return {
      success: true,
      companyId,
      message: 'Company created successfully'
    };

  } catch (error) {
    console.error('Error creating company:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create company', error);
  }
});

// Update company public status
exports.updateCompanyPublicStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyId, isPublic } = data;
  const userId = context.auth.uid;

  if (typeof isPublic !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'isPublic must be a boolean');
  }

  try {
    const db = admin.firestore();
    
    // Check if user is admin of this company
    const companyRef = db.collection('companies').doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Company not found');
    }

    const companyData = companyDoc.data();
    if (companyData.adminUid !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Only company admin can update public status');
    }

    // Update the isPublic field
    await companyRef.update({
      isPublic,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: `Company public status updated to ${isPublic}`
    };

  } catch (error) {
    console.error('Error updating company public status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update company status', error);
  }
}); 