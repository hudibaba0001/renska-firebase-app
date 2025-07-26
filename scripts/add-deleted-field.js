/**
 * Add Deleted Field Script
 * 
 * This script adds the missing 'deleted' field to user profiles.
 * The Firestore security rules require this field to be present and set to false.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Add deleted field to user profile
 * @param {string} userEmail - Email of the user to fix
 */
async function addDeletedField(userEmail) {
  try {
    const db = admin.firestore();
    
    console.log(`🔧 Adding deleted field to user profile: ${userEmail}`);
    
    // Step 1: Get user from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('✅ User found in Firebase Auth:', userRecord.uid);
    
    // Step 2: Update user profile with deleted field
    const userProfileRef = db.collection('users').doc(userRecord.uid);
    
    await userProfileRef.update({
      deleted: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Added deleted: false field to user profile');
    
    // Step 3: Verify the update
    const updatedProfile = await userProfileRef.get();
    const profileData = updatedProfile.data();
    
    console.log('✅ Updated profile data:', {
      email: profileData.email,
      companyId: profileData.companyId,
      role: profileData.role,
      deleted: profileData.deleted
    });
    
    // Step 4: Test Firestore access
    console.log('\n🧪 Testing Firestore access...');
    try {
      const testProfile = await userProfileRef.get();
      console.log('✅ Can read own profile:', testProfile.exists);
      console.log('✅ Profile has deleted field:', testProfile.data().deleted === false);
    } catch (error) {
      console.error('❌ Firestore access test failed:', error.message);
    }
    
    console.log('\n🎉 Deleted field added successfully!');
    console.log('📧 Email:', userEmail);
    console.log('🆔 User ID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error adding deleted field:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);
const userEmail = args[0] || 'singhtanveer0989@gmail.com';

console.log(`
🔧 Add Deleted Field Script

This script will:
1. Add the missing 'deleted: false' field to user profile
2. Ensure the profile matches security rule requirements
3. Test Firestore access

Usage: node scripts/add-deleted-field.js [email]

Current settings:
📧 Email: ${userEmail}
`);

// Run the fix
addDeletedField(userEmail); 