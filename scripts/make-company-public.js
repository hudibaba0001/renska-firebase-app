// scripts/make-company-public.js
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

async function makeCompanyPublic(companyId) {
  try {
    console.log(`🔧 Making company ${companyId} public...`);
    const companyRef = db.collection('companies').doc(companyId);
    await companyRef.update({
      isPublic: true,
      updatedAt: new Date()
    });
    console.log(`✅ Company ${companyId} is now public!`);
    console.log(`🌐 Public booking form available at: https://staging-swed-de2a3.web.app/booking/${companyId}`);
  } catch (error) {
    console.error('❌ Error making company public:', error);
    throw error;
  }
}

// Get company ID from command line argument
const companyId = process.argv[2];

if (!companyId) {
  console.error('❌ Please provide a company ID as an argument');
  console.log('Usage: node scripts/make-company-public.js <companyId>');
  console.log('Example: node scripts/make-company-public.js r7kAsnh-r1');
  process.exit(1);
}

makeCompanyPublic(companyId)
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 