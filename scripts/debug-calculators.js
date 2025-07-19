const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBTrOmWHj0iQH2mkcNjUrD0IVKVnioHYbs",
  authDomain: "swed-de2a3.firebaseapp.com",
  projectId: "swed-de2a3",
  storageBucket: "swed-de2a3.firebasestorage.app",
  messagingSenderId: "647686291389",
  appId: "1:647686291389:web:2306e61c2b196be2e51cd4",
  measurementId: "G-QQCGCERGV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCalculators() {
  try {
    console.log('🔍 Debugging calculators in Firestore...');
    
    // Get all companies
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    
    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyData = companyDoc.data();
      
      console.log(`\n📋 Company: ${companyData.name || companyId} (${companyId})`);
      
      // Get calculators for this company
      const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
      const calculatorsSnapshot = await getDocs(calculatorsRef);
      
      if (calculatorsSnapshot.empty) {
        console.log('   ❌ No calculators found');
        continue;
      }
      
      console.log(`   📊 Found ${calculatorsSnapshot.docs.length} calculator(s):`);
      
      for (const calcDoc of calculatorsSnapshot.docs) {
        const calcId = calcDoc.id;
        const calcData = calcDoc.data();
        
        console.log(`   └─ Calculator: ${calcData.name || 'Unnamed'} (ID: ${calcId})`);
        console.log(`      Status: ${calcData.status || 'draft'}`);
        console.log(`      Slug: ${calcData.slug || 'none'}`);
        console.log(`      Created: ${calcData.createdAt ? new Date(calcData.createdAt.seconds * 1000).toISOString() : 'unknown'}`);
        console.log(`      Updated: ${calcData.updatedAt ? new Date(calcData.updatedAt.seconds * 1000).toISOString() : 'unknown'}`);
        
        // Check if the document ID matches the slug
        if (calcData.slug && calcId !== calcData.slug) {
          console.log(`      ⚠️  WARNING: Document ID (${calcId}) doesn't match slug (${calcData.slug})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging calculators:', error);
  }
}

// Run the debug function
debugCalculators().then(() => {
  console.log('\n✅ Debug complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 