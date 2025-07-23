// scripts/make-all-companies-public.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../webapp/src/firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'swed-de2a3'
});

const db = admin.firestore();

async function makeAllCompaniesPublic() {
  try {
    console.log('🔧 Making all companies public...');
    
    // Get all companies
    const companiesSnapshot = await db.collection('companies').get();
    
    if (companiesSnapshot.empty) {
      console.log('❌ No companies found');
      return;
    }
    
    console.log(`📊 Found ${companiesSnapshot.size} companies`);
    
    // Update each company
    const batch = db.batch();
    let updatedCount = 0;
    
    companiesSnapshot.forEach(doc => {
      const companyRef = db.collection('companies').doc(doc.id);
      batch.update(companyRef, {
        isPublic: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      updatedCount++;
      console.log(`✅ Queued update for company: ${doc.id}`);
    });
    
    // Commit all updates
    await batch.commit();
    
    console.log(`🎉 Successfully made ${updatedCount} companies public!`);
    console.log(`🌐 All companies now have public booking forms available`);
    
  } catch (error) {
    console.error('❌ Error making companies public:', error);
    throw error;
  }
}

makeAllCompaniesPublic()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 