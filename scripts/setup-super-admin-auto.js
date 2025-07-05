/**
 * Automated Super Admin Setup
 * 
 * This script automatically finds the user by email and sets up super admin status.
 * Run with: node scripts/setup-super-admin-auto.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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
const auth = getAuth(app);
const db = getFirestore(app);

// Super admin credentials
const SUPER_ADMIN_EMAIL = 'admin@swedprime.com';
const SUPER_ADMIN_PASSWORD = 'superadmin123';

async function setupSuperAdminAuto() {
  try {
    console.log('🔄 Setting up super admin automatically...');
    
    // Sign in to get the user object and UID
    console.log('🔐 Signing in as super admin...');
    const userCredential = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ Successfully signed in!');
    console.log('👤 User UID:', user.uid);
    
    // Create super admin profile in Firestore
    console.log('📝 Creating super admin profile in Firestore...');
    await setDoc(doc(db, 'superAdminUsers', user.uid), {
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Super Administrator',
      createdAt: serverTimestamp(),
      isSuperAdmin: true,
      role: 'super-admin'
    });
    
    console.log('✅ Super admin profile created successfully!');
    console.log('');
    console.log('🎉 Setup Complete!');
    console.log('📧 Email: admin@swedprime.com');
    console.log('🔐 Password: superadmin123');
    console.log('🌐 Login at: https://swed-de2a3.web.app/login');
    console.log('🚀 Will now redirect to: /super-admin');
    console.log('');
    console.log('💡 Try logging in again - you should now be redirected to the super admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('');
      console.log('📝 User not found. Please create the user first:');
      console.log('1. Go to Firebase Console → Authentication → Users');
      console.log('2. Click "Add User"');
      console.log('3. Email: admin@swedprime.com');
      console.log('4. Password: superadmin123');
      console.log('5. Run this script again');
    } else if (error.code === 'auth/wrong-password') {
      console.log('');
      console.log('🔐 Wrong password. Please check the password or update it in Firebase Console');
    } else if (error.code === 'auth/too-many-requests') {
      console.log('');
      console.log('⏰ Too many requests. Please wait a few minutes and try again');
    }
  }
  
  process.exit(0);
}

// Run the script
setupSuperAdminAuto(); 