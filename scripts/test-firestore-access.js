const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function testFirestoreAccess() {
  try {
    const db = admin.firestore();
    
    // Test 1: Direct access to companies collection
    console.log('=== Testing Direct Admin Access ===');
    const companiesRef = db.collection('companies');
    const snapshot = await companiesRef.get();
    console.log(`Direct admin access: Found ${snapshot.size} companies`);
    
    // Test 2: Simulate user access with custom claims
    console.log('\n=== Testing User Access Simulation ===');
    
    // Get the super admin user
    const userRecord = await admin.auth().getUserByEmail('admin@swedprime.com');
    console.log('Super admin user UID:', userRecord.uid);
    
    // Get the user's custom claims
    const customClaims = await admin.auth().getUser(userRecord.uid);
    console.log('Custom claims:', customClaims.customClaims);
    
    // Test 3: Try to access with user context (this won't work with admin SDK, but good for debugging)
    console.log('\n=== Testing Query Structure ===');
    const companiesRef2 = db.collection('companies');
    const q = companiesRef2.orderBy('createdAt', 'desc');
    const snapshot2 = await q.get();
    console.log(`Query with orderBy: Found ${snapshot2.size} companies`);
    
    // Test 4: Check if there are any documents without createdAt field
    console.log('\n=== Checking Document Structure ===');
    let docsWithoutCreatedAt = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.createdAt) {
        docsWithoutCreatedAt++;
        console.log(`Document ${doc.id} missing createdAt field`);
      }
    });
    console.log(`Documents without createdAt: ${docsWithoutCreatedAt}`);
    
  } catch (error) {
    console.error('Error testing Firestore access:', error);
  } finally {
    process.exit();
  }
}

testFirestoreAccess(); 