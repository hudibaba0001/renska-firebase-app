/**
 * Force Refresh User Token Script
 * 
 * This script forces a refresh of the user's Firebase token to ensure
 * new custom claims are active. This is needed when custom claims are updated.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Force refresh user token
 * @param {string} userEmail - Email of the user to refresh token for
 */
async function forceRefreshToken(userEmail) {
  try {
    console.log(`🔄 Force refreshing token for user: ${userEmail}`);
    
    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('✅ User found:', userRecord.uid);
    console.log('🔑 Current custom claims:', userRecord.customClaims || 'None');
    
    // Revoke all refresh tokens for the user
    // This will force the user to sign in again and get a new token with updated claims
    await admin.auth().revokeRefreshTokens(userRecord.uid);
    
    console.log('✅ All refresh tokens revoked');
    console.log('🔄 User will need to sign in again to get new token with updated claims');
    
    // Verify the custom claims are still set
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('🔑 Custom claims after token refresh:', updatedUser.customClaims || 'None');
    
    console.log('\n🎉 Token refresh completed!');
    console.log('📧 Email:', userEmail);
    console.log('🆔 User ID:', userRecord.uid);
    console.log('\n⚠️  IMPORTANT: User must sign out and sign in again!');
    console.log('🚀 The new token will include the updated custom claims.');
    
  } catch (error) {
    console.error('❌ Error refreshing token:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);
const userEmail = args[0] || 'singhtanveer0989@gmail.com';

console.log(`
🔄 Force Refresh Token Script

This script will:
1. Revoke all refresh tokens for the user
2. Force the user to sign in again
3. Ensure new custom claims are active

Usage: node scripts/force-refresh-token.js [email]

Current settings:
📧 Email: ${userEmail}

⚠️  This will log the user out of all devices!
`);

// Run the token refresh
forceRefreshToken(userEmail); 