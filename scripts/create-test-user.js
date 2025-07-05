/**
 * Create Test User Script
 * Quick script to create a test user for development
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Update this path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createTestUser() {
  try {
    // Create a test user
    const userRecord = await admin.auth().createUser({
      email: 'test@swedprime.com',
      password: 'TestPassword123!',
      displayName: 'Test User',
      emailVerified: true
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@swedprime.com');
    console.log('🔐 Password: TestPassword123!');
    console.log('🆔 User ID:', userRecord.uid);
    console.log('\n🚀 You can now login at: https://reniska-calculator.web.app/login');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ User already exists with email: test@swedprime.com');
      console.log('💡 Try logging in with:');
      console.log('📧 Email: test@swedprime.com');
      console.log('🔐 Password: TestPassword123!');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  }
  
  process.exit();
}

// Run the function
createTestUser(); 