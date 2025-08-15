const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

async function fixUserCompany() {
  try {
    console.log('🔧 Fixing user company association...');

    const userEmail = 'singhtanveer0989@gmail.com';
    const correctCompanyId = 'r7kAsnh-r1';
    const wrongCompanyId = 'Yfun7EgM8ip8lQmzIuy6';

    // First, let's check if the user exists and get their current data
    console.log('🔍 Checking user data...');
    
    // We need to find the user by email since we don't have their UID
    // Let's check the companies collection to see if we can find the user there
    const companyDoc = await getDoc(doc(db, 'companies', correctCompanyId));
    
    if (companyDoc.exists()) {
      console.log('✅ Found company:', companyDoc.data().companyName);
    } else {
      console.log('❌ Company not found');
      return;
    }

    // Let's also check the wrong company
    const wrongCompanyDoc = await getDoc(doc(db, 'companies', wrongCompanyId));
    if (wrongCompanyDoc.exists()) {
      console.log('⚠️ Found wrong company:', wrongCompanyDoc.data().companyName);
    }

    console.log('\n📋 Manual Fix Instructions:');
    console.log('==============================================');
    console.log('Since we can\'t directly access user data without admin SDK,');
    console.log('you need to manually fix this in Firebase Console:');
    console.log('');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com');
    console.log('2. Select your project: swed-de2a3');
    console.log('3. Go to Authentication > Users');
    console.log('4. Find user: singhtanveer0989@gmail.com');
    console.log('5. Check their custom claims');
    console.log('');
    console.log('6. Go to Firestore Database > users collection');
    console.log('7. Find the user document for singhtanveer0989@gmail.com');
    console.log('8. Update the admin_of field to: ["r7kAsnh-r1"]');
    console.log('');
    console.log('9. Or use this script to set custom claims:');
    console.log('   node scripts/setup-super-admin.js');
    console.log('');
    console.log('🔗 Correct Admin URL: http://localhost:5174/admin/r7kAsnh-r1');
    console.log('🔗 Wrong Admin URL: http://localhost:5174/admin/Yfun7EgM8ip8lQmzIuy6');

  } catch (error) {
    console.error('❌ Error fixing user company:', error);
  }
}

// Run the script
fixUserCompany(); 