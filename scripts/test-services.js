const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'reniska-webapp'
  });
}

const db = admin.firestore();

async function testServices() {
  try {
    const companyId = 'r7kAsnh-r1';
    console.log(`🔍 Testing services for company: ${companyId}`);
    
    // Check if company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      console.log('❌ Company does not exist');
      return;
    }
    
    console.log('✅ Company exists');
    console.log('Company data:', companyDoc.data());
    
    // Get all services (including deleted ones)
    const servicesRef = db.collection('companies').doc(companyId).collection('services');
    const allServicesSnapshot = await servicesRef.get();
    
    console.log(`\n📋 Found ${allServicesSnapshot.size} total services:`);
    
    const activeServices = [];
    const deletedServices = [];
    
    allServicesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.deleted === true) {
        deletedServices.push({ id: doc.id, ...data });
      } else {
        activeServices.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`\n✅ Active services: ${activeServices.length}`);
    activeServices.forEach((service, index) => {
      console.log(`  ${index + 1}. ID: ${service.id}`);
      console.log(`     Name: ${service.name || 'No name'}`);
      console.log(`     Pricing Model: ${service.pricingModel || 'No model'}`);
      console.log(`     Price: ${service.price || 'No price'}`);
      console.log(`     Created: ${service.createdAt?.toDate?.() || service.createdAt}`);
      console.log(`     Deleted: ${service.deleted || false}`);
      console.log('');
    });
    
    console.log(`\n🗑️ Deleted services: ${deletedServices.length}`);
    deletedServices.forEach((service, index) => {
      console.log(`  ${index + 1}. ID: ${service.id}`);
      console.log(`     Name: ${service.name || 'No name'}`);
      console.log(`     Deleted at: ${service.deletedAt?.toDate?.() || service.deletedAt}`);
      console.log('');
    });
    
    // Test the query that the app uses
    console.log('\n🔍 Testing the query the app uses (deleted == false):');
    const activeQuery = servicesRef.where('deleted', '==', false);
    const activeSnapshot = await activeQuery.get();
    
    console.log(`Found ${activeSnapshot.size} services with deleted == false`);
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name || 'No name'} (deleted: ${data.deleted})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testServices().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 