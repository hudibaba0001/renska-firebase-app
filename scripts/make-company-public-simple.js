const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function makeCompanyPublic() {
  try {
    const companyId = 'r7kAsnh-r1'; // Use your existing company ID
    
    // Update the company to be public
    await db.collection('companies').doc(companyId).update({
      isPublic: true,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Company ${companyId} is now public!`);
    console.log(`🔗 Embed URL: https://your-domain.com/embed/calculator?companyId=${companyId}&form=default`);
    
  } catch (error) {
    console.error('❌ Error making company public:', error);
  } finally {
    process.exit(0);
  }
}

makeCompanyPublic(); 