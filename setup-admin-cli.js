// setup-admin-cli.js
// Quick setup using Firebase CLI authentication

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with default credentials (uses Firebase CLI login)
const app = initializeApp();
const auth = getAuth(app);
const db = getFirestore(app);

async function setupSuperAdmin(email) {
  try {
    console.log(`🔧 Setting up super admin for: ${email}`);
    
    // Find user by email
    const user = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);
    
    // Set super admin claims
    const claims = {
      superAdmin: true,
      adminOf: []
    };
    
    await auth.setCustomUserClaims(user.uid, claims);
    console.log('✅ Custom claims set');
    
    // Create/update user document
    const userRef = db.doc(`users/${user.uid}`);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      superAdmin: true,
      adminOf: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
      initialSuperAdmin: true
    }, { merge: true });
    
    console.log('✅ User document updated');
    console.log(`🎉 Super admin setup complete!`);
    console.log('');
    console.log('🔑 Next steps:');
    console.log('1. Sign out of your web app');
    console.log('2. Sign back in to refresh your token');
    console.log('3. You should now have super admin access');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Make sure the user has signed up first in your web app');
    }
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node setup-admin-cli.js your-email@example.com');
  process.exit(1);
}

setupSuperAdmin(email);