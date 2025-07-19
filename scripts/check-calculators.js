/**
 * Check Calculators Script
 * Quick script to check if calculators exist for a specific company
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxJjAo_dTMXZjJ8b9Db3qrcn2mCzZtjjY",
  authDomain: "swedprime-saas.firebaseapp.com",
  projectId: "swedprime-saas",
  storageBucket: "swedprime-saas.appspot.com",
  messagingSenderId: "1098765432109",
  appId: "1:1098765432109:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCalculators(companyId) {
  try {
    console.log(`Checking calculators for company: ${companyId}`);
    
    // Check if company exists
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (!companyDoc.exists()) {
      console.log('❌ Company not found');
      return;
    }
    
    console.log('✅ Company found:', companyDoc.data().name);
    
    // Check calculators subcollection
    const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
    const calculatorsSnapshot = await getDocs(calculatorsRef);
    
    console.log(`📊 Found ${calculatorsSnapshot.docs.length} calculators:`);
    
    if (calculatorsSnapshot.docs.length === 0) {
      console.log('❌ No calculators found');
      console.log('💡 To create a test calculator, run: node scripts/create-test-calculator.js');
    } else {
      calculatorsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.name || 'Unnamed'} (${doc.id})`);
        console.log(`     Status: ${data.status || 'draft'}`);
        console.log(`     Created: ${data.createdAt?.toDate?.() || 'Unknown'}`);
        console.log(`     Slug: ${data.slug || 'None'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking calculators:', error);
  }
}

// Get company ID from command line argument
const companyId = process.argv[2];

if (!companyId) {
  console.log('Usage: node scripts/check-calculators.js <companyId>');
  console.log('Example: node scripts/check-calculators.js company123');
  process.exit(1);
}

checkCalculators(companyId).then(() => {
  console.log('✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
}); 