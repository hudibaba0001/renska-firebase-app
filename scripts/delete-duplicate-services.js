const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'reniska-webapp'
  });
}

const db = admin.firestore();

async function deleteDuplicateServices() {
  try {
    const companyId = 'r7kAsnh-r1';
    console.log(`🗑️ Deleting duplicate services for company: ${companyId}`);
    
    const servicesRef = db.collection('companies').doc(companyId).collection('services');
    const snapshot = await servicesRef.get();
    
    console.log(`Found ${snapshot.size} total services`);
    
    let deletedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if this is a "New Service" with "No Model" (duplicate)
      if (data.name === 'New Service' || !data.name || data.name === '') {
        console.log(`Deleting service ${doc.id}: ${data.name || 'No name'}`);
        
        // Soft delete by setting deleted: true
        await doc.ref.update({
          deleted: true,
          deletedAt: admin.firestore.FieldValue.serverTimestamp(),
          deletedBy: 'script-cleanup'
        });
        
        deletedCount++;
      }
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} duplicate services`);
    
    // Show remaining services
    const remainingSnapshot = await servicesRef.where('deleted', '!=', true).get();
    console.log(`\n📋 Remaining active services: ${remainingSnapshot.size}`);
    remainingSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  ✅ ${doc.id}: ${data.name || 'No name'} (${data.pricingModel || 'No model'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteDuplicateServices().then(() => {
  console.log('\n✅ Cleanup completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
}); 