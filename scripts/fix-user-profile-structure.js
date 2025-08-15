/**
 * Fix User Profile Structure Script
 * 
 * This script fixes the user profile structure to match what the Firestore security rules expect.
 * The issue is that the user profile might be missing the 'deleted' field or have incorrect structure.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Fix user profile structure
 * @param {string} userEmail - Email of the user to fix
 */
async function fixUserProfileStructure(userEmail) {
  try {
    const db = admin.firestore();
    
    console.log(`🔧 Fixing user profile structure for: ${userEmail}`);
    
    // Step 1: Get user from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('✅ User found in Firebase Auth:', userRecord.uid);
    
    // Step 2: Get current user profile
    const userProfileRef = db.collection('users').doc(userRecord.uid);
    const userProfile = await userProfileRef.get();
    
    if (!userProfile.exists) {
      console.log('❌ User profile not found. Creating new profile...');
      
      const adminOf = userRecord.customClaims?.adminOf || [];
      const companyId = adminOf.length > 0 ? adminOf[0] : null;
      
      const newProfile = {
        email: userEmail,
        displayName: userRecord.displayName || 'Company Admin',
        companyId: companyId,
        role: companyId ? 'admin' : 'user',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deleted: false // This is required by security rules
      };
      
      await userProfileRef.set(newProfile);
      console.log('✅ Created new user profile with correct structure');
      console.log('📝 Profile data:', newProfile);
    } else {
      console.log('✅ User profile found. Checking structure...');
      const profileData = userProfile.data();
      console.log('📝 Current profile data:', profileData);
      
      // Check what fields are missing or incorrect
      const requiredFields = {
        email: userEmail,
        displayName: profileData.displayName || profileData.name || 'Company Admin',
        companyId: profileData.companyId || null,
        role: profileData.role || 'user',
        deleted: false, // This is critical for security rules
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Only add createdAt if it doesn't exist
      if (!profileData.createdAt) {
        requiredFields.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }
      
      // Check if we need to update the profile
      const needsUpdate = !profileData.deleted === false || 
                         profileData.email !== userEmail ||
                         !profileData.companyId;
      
      if (needsUpdate) {
        console.log('🔧 Updating user profile structure...');
        await userProfileRef.update(requiredFields);
        console.log('✅ Updated user profile with correct structure');
        console.log('📝 Updated fields:', requiredFields);
      } else {
        console.log('✅ User profile structure is already correct');
      }
    }
    
    // Step 3: Test Firestore access
    console.log('\n🧪 Testing Firestore access...');
    try {
      const testProfile = await userProfileRef.get();
      console.log('✅ Can read own profile:', testProfile.exists);
      
      if (testProfile.exists) {
        const testData = testProfile.data();
        console.log('✅ Profile has correct structure:', {
          email: testData.email,
          companyId: testData.companyId,
          role: testData.role,
          deleted: testData.deleted
        });
      }
      
    } catch (error) {
      console.error('❌ Firestore access test failed:', error.message);
    }
    
    console.log('\n🎉 User profile structure fix completed!');
    console.log('📧 Email:', userEmail);
    console.log('🆔 User ID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error fixing user profile structure:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);
const userEmail = args[0] || 'singhtanveer0989@gmail.com';

console.log(`
🔧 Fix User Profile Structure Script

This script will:
1. Check the current user profile structure
2. Fix any missing or incorrect fields
3. Ensure the profile matches security rule requirements
4. Test Firestore access

Usage: node scripts/fix-user-profile-structure.js [email]

Current settings:
📧 Email: ${userEmail}
`);

// Run the fix
fixUserProfileStructure(userEmail); 