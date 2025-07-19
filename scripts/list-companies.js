/**
 * List Companies Script
 * Quick script to list all companies and their IDs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listCompanies() {
  try {
    console.log('🔍 Listing all companies...');
    
    const companiesSnapshot = await db.collection('companies').get();
    
    if (companiesSnapshot.empty) {
      console.log('❌ No companies found in the database');
      return;
    }
    
    console.log(`✅ Found ${companiesSnapshot.size} companies:\n`);
    
    companiesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`🏢 Company: ${data.companyName || data.name || 'Unnamed'}`);
      console.log(`🆔 ID: ${doc.id}`);
      console.log(`📧 Admin Email: ${data.adminEmail || 'N/A'}`);
      console.log(`📊 Plan: ${data.subscription?.plan || data.plan || 'N/A'}`);
      console.log(`🔗 Admin URL: http://localhost:5173/admin/${doc.id}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error listing companies:', error);
    throw error;
  }
}

listCompanies()
  .then(() => {
    console.log('🎉 Company listing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 