const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../webapp/src/firebase/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugServices() {
  try {
    const companyId = 'r7kAsnh-r1'; // Your company ID
    console.log(`🔍 Checking services for company: ${companyId}`);
    
    const servicesRef = db.collection('companies').doc(companyId).collection('services');
    const querySnapshot = await servicesRef.get();
    
    console.log(`\n📋 Found ${querySnapshot.size} services:`);
    console.log('='.repeat(80));
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🆔 Service ID: ${doc.id}`);
      console.log(`📝 Name: ${data.name || 'NO NAME'}`);
      console.log(`💰 Price: ${data.price || 'NO PRICE'}`);
      console.log(`⏱️ Duration: ${data.duration || 'NO DURATION'}`);
      console.log(`✅ RUT Eligible: ${data.RUTEligible || false}`);
      console.log(`✅ Consent: ${data.consent || false}`);
      console.log(`🗑️ Deleted: ${data.deleted || false}`);
      console.log(`📅 Created: ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'NO DATE'}`);
      console.log(`📅 Updated: ${data.updatedAt ? new Date(data.updatedAt.toDate()).toLocaleString() : 'NO DATE'}`);
      console.log('-'.repeat(40));
    });
    
    // Check for services that might be problematic
    const problematicServices = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.name || !data.price || data.deleted === true;
    });
    
    if (problematicServices.length > 0) {
      console.log(`\n⚠️ Found ${problematicServices.length} problematic services:`);
      problematicServices.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'NO NAME'} (${data.deleted ? 'DELETED' : 'INCOMPLETE'})`);
      });
      
      console.log('\n💡 To delete a service, use:');
      console.log(`node delete-service.js ${companyId} <service-id>`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugServices(); 