/**
 * Add Super Admin Status to Firestore
 * 
 * This script adds super admin status to Firestore for an existing user.
 * Run with: node scripts/add-super-admin-to-firestore.js
 * 
 * Make sure to:
 * 1. Create the user in Firebase Console first
 * 2. Get the user's UID from Firebase Console
 * 3. Update the USER_UID below with the actual UID
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBHbWlx8dKLDhPfhwpMvGrGfNYGYfMKJvs",
  authDomain: "swed-de2a3.firebaseapp.com",
  projectId: "swed-de2a3",
  storageBucket: "swed-de2a3.firebasestorage.app",
  messagingSenderId: "647686291389",
  appId: "1:647686291389:web:2306e61c2b196be2e51cd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UPDATE THIS WITH THE ACTUAL USER UID FROM FIREBASE CONSOLE
const USER_UID = 'REPLACE_WITH_ACTUAL_UID'; // Get this from Firebase Console → Authentication → Users
const SUPER_ADMIN_EMAIL = 'admin@swedprime.com';

async function addSuperAdminToFirestore() {
  try {
    if (USER_UID === 'REPLACE_WITH_ACTUAL_UID') {
      console.log('❌ Please update USER_UID in the script with the actual UID from Firebase Console');
      console.log('');
      console.log('Steps:');
      console.log('1. Go to Firebase Console → Authentication → Users');
      console.log('2. Find the user: admin@swedprime.com');
      console.log('3. Copy the UID (long string like: abc123def456...)');
      console.log('4. Replace USER_UID in this script with that UID');
      console.log('5. Run the script again');
      return;
    }

    console.log('🔄 Adding super admin status to Firestore...');
    
    // Create super admin profile in Firestore
    await setDoc(doc(db, 'superAdminUsers', USER_UID), {
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Super Administrator',
      createdAt: serverTimestamp(),
      isSuperAdmin: true,
      role: 'super-admin'
    });
    
    console.log('✅ Super admin status added to Firestore!');
    console.log('📧 Email: admin@swedprime.com');
    console.log('🔐 Password: superadmin123');
    console.log('🌐 Login at: https://swed-de2a3.web.app/login');
    console.log('🚀 Should redirect to: /super-admin');
    
  } catch (error) {
    console.error('❌ Error adding super admin to Firestore:', error);
  }
  
  process.exit(0);
}

// Run the script
addSuperAdminToFirestore(); 