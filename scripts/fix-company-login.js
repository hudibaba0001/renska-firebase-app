/**
 * Fix Company Login Script
 * 
 * This script helps fix login issues for company admin users by:
 * 1. Finding or creating a company
 * 2. Setting up the user with proper adminOf custom claims
 * 3. Ensuring the user can access their company dashboard
 * 
 * Run this script with: node scripts/fix-company-login.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Fix company login for a specific user
 * @param {string} userEmail - Email of the user to fix
 * @param {string} companyName - Name of the company to create/assign
 */
async function fixCompanyLogin(userEmail, companyName = 'My Company') {
  try {
    const db = admin.firestore();
    
    console.log(`🔧 Fixing login for user: ${userEmail}`);
    console.log(`🏢 Company: ${companyName}`);
    
    // Step 1: Get or create the user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(userEmail);
      console.log('✅ User found:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ User not found. Please create the user account first via the app signup.');
        console.log('💡 Go to: http://localhost:5173/signup and create an account with this email.');
        return;
      }
      throw error;
    }
    
    // Step 2: Find or create a company
    let companyId;
    let companyDoc;
    
    // First, try to find an existing company
    const companiesSnapshot = await db.collection('companies')
      .where('deleted', '==', false)
      .limit(1)
      .get();
    
    if (!companiesSnapshot.empty) {
      companyDoc = companiesSnapshot.docs[0];
      companyId = companyDoc.id;
      console.log(`✅ Found existing company: ${companyDoc.data().name} (ID: ${companyId})`);
    } else {
      // Create a new company
      console.log('🏢 Creating new company...');
      const newCompany = {
        name: companyName,
        contactEmail: userEmail,
        address: '',
        RUTEligible: true,
        personnummer: '',
        consent: true,
        consentTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        consentDetails: 'Created via fix-company-login script',
        subscription: {
          active: true,
          plan: 'basic',
          status: 'active'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deleted: false
      };
      
      const companyRef = await db.collection('companies').add(newCompany);
      companyId = companyRef.id;
      console.log(`✅ Created new company: ${companyName} (ID: ${companyId})`);
    }
    
    // Step 3: Set custom claims for the user
    const currentClaims = userRecord.customClaims || {};
    const adminOf = currentClaims.adminOf || [];
    
    if (!adminOf.includes(companyId)) {
      adminOf.push(companyId);
    }
    
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      ...currentClaims,
      adminOf: adminOf
    });
    
    console.log('🔑 Set adminOf custom claim for company:', companyId);
    
    // Step 4: Create user profile in Firestore if it doesn't exist
    const userProfileRef = db.collection('users').doc(userRecord.uid);
    const userProfile = await userProfileRef.get();
    
    if (!userProfile.exists) {
      await userProfileRef.set({
        email: userEmail,
        displayName: userRecord.displayName || 'Company Admin',
        companyId: companyId,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deleted: false
      });
      console.log('📝 Created user profile in Firestore');
    } else {
      // Update existing profile with company info
      await userProfileRef.update({
        companyId: companyId,
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('📝 Updated user profile with company info');
    }
    
    console.log('\n🎉 Login fix completed successfully!');
    console.log('📧 Email:', userEmail);
    console.log('🏢 Company ID:', companyId);
    console.log('🔑 Custom claims set: adminOf =', adminOf);
    console.log('\n⚠️  IMPORTANT: User must sign out and sign in again for changes to take effect!');
    console.log('🚀 You can now login at: http://localhost:5173/login');
    
  } catch (error) {
    console.error('❌ Error fixing company login:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);
const userEmail = args[0] || 'singhtanveer0989@gmail.com';
const companyName = args[1] || 'My Company';

console.log(`
🔧 Company Login Fix Script

This script will:
1. Find or create a company
2. Set up your user account with proper admin permissions
3. Enable you to access the company dashboard

Usage: node scripts/fix-company-login.js [email] [companyName]

Current settings:
📧 Email: ${userEmail}
🏢 Company: ${companyName}

⚠️  Make sure you have created a user account first via the app signup!
`);

// Run the fix
fixCompanyLogin(userEmail, companyName); 