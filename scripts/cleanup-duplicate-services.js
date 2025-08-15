const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'reniska-webapp'
  });
}

const db = admin.firestore();

async function cleanupDuplicateServices() {
  try {
    const companyId = 'r7kAsnh-r1';
    console.log(`🧹 Cleaning up duplicate services for company: ${companyId}`);
    
    const servicesRef = db.collection('companies').doc(companyId).collection('services');
    const snapshot = await servicesRef.get();
    
    console.log(`Found ${snapshot.size} total services`);
    
    const servicesToDelete = [];
    const servicesToKeep = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const service = { id: doc.id, ...data };
      
      // Check if this is a "New Service" with "No Model" (duplicate)
      if (data.name === 'New Service' || !data.name || data.name === '') {
        servicesToDelete.push(service);
      } else {
        servicesToKeep.push(service);
      }
    });
    
    console.log(`\n📋 Services to keep: ${servicesToKeep.length}`);
    servicesToKeep.forEach(service => {
      console.log(`  ✅ ${service.id}: ${service.name || 'No name'} (${service.pricingModel || 'No model'})`);
    });
    
    console.log(`\n🗑️ Services to delete: ${servicesToDelete.length}`);
    servicesToDelete.forEach(service => {
      console.log(`  ❌ ${service.id}: ${service.name || 'No name'} (${service.pricingModel || 'No model'})`);
    });
    
    if (servicesToDelete.length === 0) {
      console.log('\n✅ No duplicate services found to delete!');
      return;
    }
    
    console.log(`\n�� WARNING: This will permanently delete ${servicesToDelete.length} services!`);
    console.log('Type "DELETE" to confirm:');
    
    // For now, just show what would be deleted
    console.log('\nTo delete these services, you can:');
    console.log('1. Use the web interface (if the delete buttons work now)');
    console.log('2. Or run this script with confirmation logic');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupDuplicateServices().then(() => {
  console.log('\n✅ Cleanup analysis completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
}); 