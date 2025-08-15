const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function debugCompanies() {
  try {
    const db = admin.firestore();
    const companiesRef = db.collection('companies');
    const snapshot = await companiesRef.get();
    
    console.log(`Found ${snapshot.size} companies in the database:`);
    
    if (snapshot.empty) {
      console.log('No companies found in the database.');
      return;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nCompany ID: ${doc.id}`);
      console.log(`Name: ${data.companyName || data.name || 'Unnamed'}`);
      console.log(`Admin UID: ${data.adminUid || 'No admin'}`);
      console.log(`Subscription:`, data.subscription || 'No subscription');
      console.log(`Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000) : 'Unknown'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
  } finally {
    process.exit();
  }
}

debugCompanies(); 