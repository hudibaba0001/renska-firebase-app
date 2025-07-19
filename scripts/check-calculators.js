/**
 * Check Calculators Script
 * Quick script to check if calculators exist for a specific company
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCalculators(companyId) {
  try {
    console.log(`🔍 Checking calculators for company: ${companyId}`);
    
    // Check if company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      console.log(`❌ Company ${companyId} does not exist!`);
      return;
    }
    
    const companyData = companyDoc.data();
    console.log(`✅ Company found: ${companyData.companyName || companyData.name || 'Unnamed'}`);
    
    // Check calculators subcollection
    const calculatorsSnapshot = await db.collection('companies').doc(companyId).collection('calculators').get();
    
    if (calculatorsSnapshot.empty) {
      console.log(`❌ No calculators found for company ${companyId}`);
      return;
    }
    
    console.log(`✅ Found ${calculatorsSnapshot.size} calculator(s):\n`);
    
    calculatorsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📊 Calculator: ${data.name || 'Unnamed'}`);
      console.log(`🆔 ID: ${doc.id}`);
      console.log(`🔗 Slug: ${data.slug || 'N/A'}`);
      console.log(`📈 Status: ${data.status || 'draft'}`);
      console.log(`👁️ Views: ${data.views || 0}`);
      console.log(`💰 Revenue: ${data.revenue || '0 kr'}`);
      console.log(`🌐 Live URL: http://localhost:5178/booking/${companyId}/${data.slug}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking calculators:', error);
    throw error;
  }
}

// Get company ID from command line argument
const companyId = process.argv[2];

if (!companyId) {
  console.error('❌ Please provide a company ID as an argument');
  console.log('Usage: node scripts/check-calculators.js <companyId>');
  console.log('Example: node scripts/check-calculators.js c3');
  process.exit(1);
}

checkCalculators(companyId)
  .then(() => {
    console.log('🎉 Calculator check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 