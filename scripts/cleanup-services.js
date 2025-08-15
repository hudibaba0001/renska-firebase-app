const admin = require('firebase-admin');

// Initialize Firebase Admin with default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'reniska-webapp'
  });
}

const db = admin.firestore();

async function cleanupServices() {
  try {
    const companyId = 'r7kAsnh-r1';
    console.log(`🔍 Checking services for company: ${companyId}`);
    
    const servicesRef = db.collection('companies').doc(companyId).collection('services');
    const querySnapshot = await servicesRef.get();
    
    console.log(`\n📋 Found ${querySnapshot.size} services:`);
    console.log('='.repeat(80));
    
    const servicesToDelete = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n🆔 Service ID: ${doc.id}`);
      console.log(`📝 Name: ${data.name || 'NO NAME'}`);
      console.log(`💰 Price: ${data.price || 'NO PRICE'}`);
      console.log(`✅ Consent: ${data.consent || false}`);
      console.log(`🗑️ Deleted: ${data.deleted || false}`);
      
      // Identify services that should be deleted
      if (!data.name || !data.price || data.deleted === true) {
        servicesToDelete.push(doc.id);
        console.log(`⚠️ MARKED FOR DELETION`);
      }
      
      console.log('-'.repeat(40));
    });
    
    if (servicesToDelete.length > 0) {
      console.log(`\n🗑️ Found ${servicesToDelete.length} services to delete:`);
      servicesToDelete.forEach(id => console.log(`- ${id}`));
      
      console.log('\n💡 To delete these services, run:');
      console.log('node delete-services-batch.js');
    } else {
      console.log('\n✅ No problematic services found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupServices(); 