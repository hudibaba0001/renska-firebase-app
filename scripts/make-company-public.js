// scripts/make-company-public.js
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeCompanyPublic(companyId) {
  try {
    console.log(`🔧 Making company ${companyId} public...`);
    
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
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