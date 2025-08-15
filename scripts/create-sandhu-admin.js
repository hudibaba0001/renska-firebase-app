const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createSandhuAdmin() {
  try {
    console.log('🚀 Creating Sandhu AB admin user...');

    const userEmail = 'singhtanveer0989@gmail.com';
    const userPassword = 'SandhuPassword123!';
    const companyId = 'r7kAsnh-r1';

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: userEmail,
      password: userPassword,
      displayName: 'Sandhu AB Admin',
      emailVerified: true
    });

    console.log('✅ User created in Firebase Auth:', userRecord.uid);

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      adminOf: [companyId],
      superAdmin: false,
      role: 'admin'
    });

    console.log('✅ Custom claims set');

    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      firebase_uid: userRecord.uid,
      email: userEmail,
      name: 'Sandhu AB Admin',
      role: 'admin',
      admin_of: [companyId],
      super_admin: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('✅ User profile created in Firestore');

    console.log('\n🎉 Sandhu AB Admin Created Successfully!');
    console.log('==========================================');
    console.log(`Email: ${userEmail}`);
    console.log(`Password: ${userPassword}`);
    console.log(`Company ID: ${companyId}`);
    console.log(`Login URL: http://localhost:5174/admin/${companyId}`);
    console.log('\n📋 Login Instructions:');
    console.log('1. Go to http://localhost:5174/login');
    console.log(`2. Login with: ${userEmail}`);
    console.log(`3. Password: ${userPassword}`);
    console.log(`4. You should be redirected to: http://localhost:5174/admin/${companyId}`);

  } catch (error) {
    if (error.code === 'auth/email-already-in-use' || error.code === 'auth/email-already-exists') {
      console.log('⚠️ User already exists, updating custom claims...');
      
      // Get existing user
      const userRecord = await auth.getUserByEmail('singhtanveer0989@gmail.com');
      
      // Update custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        adminOf: ['r7kAsnh-r1'],
        superAdmin: false,
        role: 'admin'
      });

      console.log('✅ Custom claims updated for existing user');
      console.log('\n🎉 User updated successfully!');
      console.log('==========================================');
      console.log('Email: singhtanveer0989@gmail.com');
      console.log('Company ID: r7kAsnh-r1');
      console.log('Login URL: http://localhost:5174/admin/r7kAsnh-r1');
    } else {
      console.error('❌ Error:', error);
    }
  }
}

createSandhuAdmin(); 