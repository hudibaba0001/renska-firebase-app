const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'swed-de2a3'
});

const db = admin.firestore();

async function checkUserData() {
  console.log('🔍 Checking user data in Firestore...\n');

  try {
    // Check old top-level collections
    console.log('📊 Checking OLD top-level collections:');
    
    const oldCollections = ['services', 'bookings', 'customers', 'calculators'];
    
    for (const collectionName of oldCollections) {
      try {
        const snapshot = await db.collection(collectionName).limit(5).get();
        console.log(`  ${collectionName}: ${snapshot.size} documents found`);
        
        if (snapshot.size > 0) {
          snapshot.forEach(doc => {
            console.log(`    - ${doc.id}: ${JSON.stringify(doc.data(), null, 2).substring(0, 100)}...`);
          });
        }
      } catch (error) {
        console.log(`  ${collectionName}: Error - ${error.message}`);
      }
    }

    console.log('\n🏢 Checking NEW subcollections:');
    
    // Check companies collection
    const companiesSnapshot = await db.collection('companies').limit(5).get();
    console.log(`  companies: ${companiesSnapshot.size} companies found`);
    
    if (companiesSnapshot.size > 0) {
      for (const companyDoc of companiesSnapshot.docs) {
        const companyId = companyDoc.id;
        console.log(`\n  📋 Company: ${companyId}`);
        
        // Check subcollections for this company
        const subcollections = ['services', 'bookings', 'customers', 'calculators'];
        
        for (const subcollection of subcollections) {
          try {
            const subSnapshot = await db.collection(`companies/${companyId}/${subcollection}`).limit(3).get();
            console.log(`    ${subcollection}: ${subSnapshot.size} documents`);
            
            if (subSnapshot.size > 0) {
              subSnapshot.forEach(doc => {
                console.log(`      - ${doc.id}`);
              });
            }
          } catch (error) {
            console.log(`    ${subcollection}: Error - ${error.message}`);
          }
        }
      }
    }

    console.log('\n✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkUserData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 