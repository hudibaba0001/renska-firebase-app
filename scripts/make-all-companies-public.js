// scripts/make-all-companies-public.js
const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

console.log('🔧 Using Firebase v8 compat init.js');

const firebaseConfig = {
  apiKey: "AIzaSyBTrOmWHj0iQH2mkcNjUrD0IVKVnioHYbs",
  authDomain: "swed-de2a3.firebaseapp.com",
  projectId: "swed-de2a3",
  storageBucket: "swed-de2a3.firebasestorage.app",
  messagingSenderId: "647686291389",
  appId: "1:647686291389:web:2306e61c2b196be2e51cd4",
  measurementId: "G-QQCGCERGV3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

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
    let updatedCount = 0;
    
    for (const doc of companiesSnapshot.docs) {
      try {
        await doc.ref.update({
          isPublic: true,
          updatedAt: new Date()
        });
        updatedCount++;
        console.log(`✅ Updated company: ${doc.id}`);
      } catch (error) {
        console.error(`❌ Failed to update company ${doc.id}:`, error.message);
      }
    }
    
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