/**
 * Setup Super Admin User
 * 
 * This script helps set up the first super admin user for the SwedPrime platform.
 * Run this script with: node scripts/setup-super-admin.js
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Set up service account key (see README below)
 * 3. Create a regular user account first via the app
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Set super admin claim for a user
 * @param {string} email - Email of the user to make super admin
 */
async function setSuperAdminClaim(email) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      superAdmin: true
    });
    
    console.log('✅ Success! Super admin claim set for:', email);
    console.log('🔄 User will need to sign out and sign in again for changes to take effect');
    
    // Optional: Create super admin profile in Firestore
    await admin.firestore().collection('superAdminUsers').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName || 'Super Admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isSuperAdmin: true
    });
    
    console.log('📝 Super admin profile created in Firestore');
    
  } catch (error) {
    console.error('❌ Error setting super admin claim:', error.message);
  } finally {
    process.exit();
  }
}

/**
 * Create a new super admin user
 * @param {string} email - Email for the new super admin
 * @param {string} password - Password for the new super admin  
 * @param {string} displayName - Display name for the super admin
 */
async function createSuperAdminUser(email, password, displayName = 'Super Administrator') {
  try {
    // Create user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });
    
    console.log('👤 User created:', userRecord.uid);
    
    // Set super admin claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      superAdmin: true
    });
    
    console.log('🔑 Super admin claim set');
    
    // Create super admin profile in Firestore
    await admin.firestore().collection('superAdminUsers').doc(userRecord.uid).set({
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isSuperAdmin: true
    });
    
    console.log('📝 Super admin profile created in Firestore');
    console.log('✅ Super admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log('🚀 You can now login at: /login and access /super-admin');
    
  } catch (error) {
    console.error('❌ Error creating super admin user:', error.message);
  } finally {
    process.exit();
  }
}

// Command line usage
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔧 Super Admin Setup Script

Usage:
  # Set super admin claim for existing user
  node scripts/setup-super-admin.js set-claim user@example.com

  # Create new super admin user
  node scripts/setup-super-admin.js create-user user@example.com password123 "Super Admin"

Setup Instructions:
1. Download service account key from Firebase Console:
   Project Settings > Service Accounts > Generate New Private Key
2. Save it as 'serviceAccountKey.json' in the scripts folder
3. Update the path in this script (line 16)
4. Run the script with the commands above

Example:
  node scripts/setup-super-admin.js create-user admin@swedprime.com superadmin123 "SwedPrime Admin"
  `);
  process.exit();
}

const command = args[0];

if (command === 'set-claim' && args[1]) {
  setSuperAdminClaim(args[1]);
} else if (command === 'create-user' && args[1] && args[2]) {
  const email = args[1];
  const password = args[2];
  const displayName = args[3] || 'Super Administrator';
  createSuperAdminUser(email, password, displayName);
} else {
  console.error('❌ Invalid arguments. Run without arguments to see usage.');
  process.exit(1);
} 