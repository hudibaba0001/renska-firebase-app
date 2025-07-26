const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'swed-de2a3'
});

const db = admin.firestore();

async function setupCRMCollections() {
  console.log('🔧 Setting up CRM collections...\n');

  try {
    // Get all companies
    const companiesSnapshot = await db.collection('companies').get();
    
    if (companiesSnapshot.empty) {
      console.log('❌ No companies found. Please create a company first.');
      return;
    }

    console.log(`📋 Found ${companiesSnapshot.size} companies`);

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyData = companyDoc.data();
      
      console.log(`\n🏢 Setting up CRM for company: ${companyData.companyName || companyId}`);

      // CRM collections to create
      const crmCollections = ['customers', 'leads', 'deals', 'tasks'];

      for (const collectionName of crmCollections) {
        const collectionPath = `companies/${companyId}/${collectionName}`;
        
        try {
          // Check if collection exists by trying to get one document
          const testSnapshot = await db.collection(collectionPath).limit(1).get();
          
          if (testSnapshot.empty) {
            // Create a sample document to initialize the collection
            const sampleData = {
              name: `Sample ${collectionName.slice(0, -1)}`,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'active'
            };

            // Add collection-specific fields
            switch (collectionName) {
              case 'customers':
                sampleData.email = 'sample@example.com';
                sampleData.phone = '+46701234567';
                break;
              case 'leads':
                sampleData.source = 'website';
                sampleData.priority = 'medium';
                break;
              case 'deals':
                sampleData.value = 5000;
                sampleData.stage = 'prospecting';
                break;
              case 'tasks':
                sampleData.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
                sampleData.priority = 'medium';
                break;
            }

            await db.collection(collectionPath).add(sampleData);
            console.log(`  ✅ Created ${collectionName} collection with sample data`);
          } else {
            console.log(`  ℹ️  ${collectionName} collection already exists`);
          }
        } catch (error) {
          console.log(`  ❌ Error setting up ${collectionName}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 CRM collections setup complete!');
    console.log('\n📊 Your CRM now has:');
    console.log('  • Customers - Manage customer relationships');
    console.log('  • Leads - Track potential customers');
    console.log('  • Deals - Monitor sales opportunities');
    console.log('  • Tasks - Organize follow-ups and activities');

  } catch (error) {
    console.error('❌ Error setting up CRM collections:', error);
  }
}

setupCRMCollections().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 