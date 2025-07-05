/**
 * Create Local Super Admin User
 * 
 * This script creates a super admin user for local development.
 * Run with: node scripts/create-local-super-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config - use your project's config
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

async function createLocalSuperAdmin() {
  try {
    console.log('🔄 Creating local super admin user...');
    
    // Try to create the user
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
      console.log('✅ Super admin user created successfully!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('👤 User already exists, signing in...');
        userCredential = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
      } else {
        throw error;
      }
    }
    
    const user = userCredential.user;
    
    // Create super admin profile in Firestore
    await setDoc(doc(db, 'superAdminUsers', user.uid), {
      email: SUPER_ADMIN_EMAIL,
      displayName: 'Super Administrator',
      createdAt: serverTimestamp(),
      isSuperAdmin: true,
      role: 'super-admin'
    });
    
    console.log('📝 Super admin profile created in Firestore');
    
    // Create a test tenant for demo
    await setDoc(doc(db, 'tenants', 'demo-company'), {
      name: 'Demo Cleaning Company',
      domain: 'demo-company',
      email: 'demo@cleaningcompany.com',
      createdAt: serverTimestamp(),
      isActive: true,
      subscription: {
        plan: 'professional',
        status: 'active'
      },
      adminEmails: [SUPER_ADMIN_EMAIL]
    });
    
    console.log('🏢 Demo tenant created');
    
    console.log('\n✅ Setup complete!');
    console.log('📧 Super Admin Email:', SUPER_ADMIN_EMAIL);
    console.log('🔐 Super Admin Password:', SUPER_ADMIN_PASSWORD);
    console.log('🌐 Login at: http://localhost:5176/login');
    console.log('🚀 After login, you should be redirected to: /super-admin');
    console.log('\nNote: This user only has local database permissions.');
    console.log('For production super admin, use the setup-super-admin.js script with service account key.');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    
    if (error.code === 'auth/weak-password') {
      console.log('💡 Try a stronger password');
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('💡 User already exists, you can use the existing credentials');
    }
  }
  
  process.exit(0);
}

// Run the script
createLocalSuperAdmin(); 