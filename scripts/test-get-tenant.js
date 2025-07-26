const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../webapp/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testGetTenant() {
  try {
    console.log('🧪 Testing getTenant function...');
    
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    console.log('🏢 Testing with company ID:', companyId);
    
    // Test direct Firestore access
    const tenantDocRef = db.collection('companies').doc(companyId);
    const tenantSnap = await tenantDocRef.get();
    
    console.log('📄 Document exists:', tenantSnap.exists);
    
    if (tenantSnap.exists) {
      const data = tenantSnap.data();
      console.log('📊 Company data:', {
        name: data.name,
        contactEmail: data.contactEmail,
        deleted: data.deleted,
        subscription: data.subscription
      });
      
      // Check if document is soft-deleted
      if (data.deleted === false) {
        console.log('✅ Company is not soft-deleted');
        return { id: tenantSnap.id, ...data };
      } else {
        console.log('❌ Company is soft-deleted');
        return null;
      }
    } else {
      console.log('❌ Company document not found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error testing getTenant:', error);
    throw error;
  }
}

// Run the test
testGetTenant()
  .then((result) => {
    console.log('🎉 Test completed successfully!');
    console.log('📋 Result:', result ? 'Company found' : 'Company not found');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 