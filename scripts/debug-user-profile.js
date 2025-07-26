/**
 * Debug User Profile Script
 * 
 * This script helps debug and fix user profile issues that might be causing login problems.
 * It checks if the user profile exists and has the correct structure.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Debug and fix user profile
 * @param {string} userEmail - Email of the user to debug
 */
async function debugUserProfile(userEmail) {
  try {
    const db = admin.firestore();
    
    console.log(`🔍 Debugging user profile for: ${userEmail}`);
    
    // Step 1: Get user from Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(userEmail);
      console.log('✅ User found in Firebase Auth:', userRecord.uid);
      console.log('📧 Email:', userRecord.email);
      console.log('🔑 Custom claims:', userRecord.customClaims || 'None');
    } catch (error) {
      console.error('❌ User not found in Firebase Auth:', error.message);
      return;
    }
    
    // Step 2: Check user profile in Firestore
    const userProfileRef = db.collection('users').doc(userRecord.uid);
    const userProfile = await userProfileRef.get();
    
    if (!userProfile.exists) {
      console.log('❌ User profile not found in Firestore');
      console.log('🔧 Creating user profile...');
      
      // Get company info from custom claims
      const adminOf = userRecord.customClaims?.adminOf || [];
      const companyId = adminOf.length > 0 ? adminOf[0] : null;
      
      const newProfile = {
        email: userEmail,
        displayName: userRecord.displayName || 'Company Admin',
        companyId: companyId,
        role: companyId ? 'admin' : 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deleted: false
      };
      
      await userProfileRef.set(newProfile);
      console.log('✅ Created user profile in Firestore');
      console.log('📝 Profile data:', newProfile);
    } else {
      console.log('✅ User profile found in Firestore');
      const profileData = userProfile.data();
      console.log('📝 Current profile data:', profileData);
      
      // Check if profile needs updating
      const adminOf = userRecord.customClaims?.adminOf || [];
      const companyId = adminOf.length > 0 ? adminOf[0] : null;
      
      if (profileData.companyId !== companyId) {
        console.log('🔧 Updating company ID in profile...');
        await userProfileRef.update({
          companyId: companyId,
          role: companyId ? 'admin' : 'user',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Updated user profile with correct company ID');
      }
    }
    
    // Step 3: Check if company exists
    const adminOf = userRecord.customClaims?.adminOf || [];
    if (adminOf.length > 0) {
      const companyId = adminOf[0];
      console.log(`🏢 Checking company: ${companyId}`);
      
      const companyDoc = await db.collection('companies').doc(companyId).get();
      if (companyDoc.exists) {
        const companyData = companyDoc.data();
        console.log('✅ Company found:', companyData.name);
        console.log('📊 Company data:', {
          name: companyData.name,
          contactEmail: companyData.contactEmail,
          subscription: companyData.subscription,
          deleted: companyData.deleted
        });
      } else {
        console.log('❌ Company not found in Firestore');
      }
    } else {
      console.log('⚠️  No company assigned to user');
    }
    
    // Step 4: Test Firestore access
    console.log('\n🧪 Testing Firestore access...');
    try {
      // Test reading user's own profile (this should work)
      const testProfile = await userProfileRef.get();
      console.log('✅ Can read own profile:', testProfile.exists);
      
      // Test reading company data (this should work for company admin)
      if (adminOf.length > 0) {
        const companyId = adminOf[0];
        const testCompany = await db.collection('companies').doc(companyId).get();
        console.log('✅ Can read company data:', testCompany.exists);
      }
      
    } catch (error) {
      console.error('❌ Firestore access test failed:', error.message);
    }
    
    console.log('\n🎉 User profile debug completed!');
    console.log('📧 Email:', userEmail);
    console.log('🆔 User ID:', userRecord.uid);
    console.log('🔑 Custom claims:', userRecord.customClaims);
    console.log('🏢 Company IDs:', adminOf);
    
  } catch (error) {
    console.error('❌ Error debugging user profile:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);
const userEmail = args[0] || 'singhtanveer0989@gmail.com';

console.log(`
🔍 User Profile Debug Script

This script will:
1. Check if user exists in Firebase Auth
2. Check if user profile exists in Firestore
3. Create/fix user profile if needed
4. Test Firestore access permissions

Usage: node scripts/debug-user-profile.js [email]

Current settings:
📧 Email: ${userEmail}
`);

// Run the debug
debugUserProfile(userEmail); 