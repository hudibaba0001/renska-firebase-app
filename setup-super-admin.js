// setup-super-admin.js
// Simple Node.js script to set up the initial super admin

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you have your service account key file
const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id-default-rtdb.firebaseio.com' // Update with your project ID
});

const db = admin.firestore();

async function setupSuperAdmin() {
  try {
    // Email of the user who should become super admin
    const superAdminEmail = process.argv[2] || 'admin@swedprime.se';
    
    console.log(`Setting up super admin for: ${superAdminEmail}`);
    
    // Find user by email
    const user = await admin.auth().getUserByEmail(superAdminEmail);
    console.log(`Found user: ${user.uid}`);
    
    // Check if there are already super admins
    const existingSuperAdmins = await db.collection('users')
      .where('superAdmin', '==', true)
      .where('deleted', '==', false)
      .get();
    
    if (!existingSuperAdmins.empty) {
      console.log('⚠️  Super admin already exists. Existing super admins:');
      existingSuperAdmins.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.email} (${doc.id})`);
      });
      
      // Ask if they want to proceed anyway
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to add another super admin? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        return;
      }
    }

    // Set super admin claims
    const claims = {
      superAdmin: true,
      adminOf: []
    };
    
    await admin.auth().setCustomUserClaims(user.uid, claims);
    console.log('✅ Custom claims set');
    
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
    
    console.log('✅ User document updated');
    console.log(`🎉 Super admin setup complete for: ${user.email} (${user.uid})`);
    console.log('');
    console.log('🔑 Next steps:');
    console.log('1. The user should sign out and sign back in to refresh their token');
    console.log('2. Custom claims will be available after token refresh');
    console.log('3. The user now has super admin privileges');
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('📧 User with that email not found. Make sure the user has signed up first.');
    }
  }
}

async function checkUserClaims() {
  try {
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('Please provide an email: node setup-super-admin.js check user@example.com');
      return;
    }
    
    console.log(`Checking claims for: ${userEmail}`);
    
    // Find user by email
    const user = await admin.auth().getUser(await admin.auth().getUserByEmail(userEmail).then(u => u.uid));
    
    console.log('🔑 User Claims:');
    console.log('- Email:', user.email);
    console.log('- UID:', user.uid);
    console.log('- Super Admin:', user.customClaims?.superAdmin || false);
    console.log('- Admin Of:', user.customClaims?.adminOf || []);
    console.log('- All Custom Claims:', JSON.stringify(user.customClaims || {}, null, 2));
    
    // Also check Firestore document
    const userDoc = await db.doc(`users/${user.uid}`).get();
    if (userDoc.exists) {
      console.log('');
      console.log('📋 Firestore Document:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('⚠️  No Firestore document found for this user');
    }
    
  } catch (error) {
    console.error('❌ Error checking user claims:', error);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'check') {
  checkUserClaims();
} else {
  console.log('SwedPrime Super Admin Setup Script');
  console.log('');
  console.log('Usage:');
  console.log('  node setup-super-admin.js [email]           - Set up super admin');
  console.log('  node setup-super-admin.js check [email]     - Check user claims');
  console.log('');
  console.log('Examples:');
  console.log('  node setup-super-admin.js admin@swedprime.se');
  console.log('  node setup-super-admin.js check admin@swedprime.se');
  console.log('');
  
  if (command && command !== 'check') {
    // Treat first argument as email
    setupSuperAdmin();
  }
}