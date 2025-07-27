const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function createTestCompanyAndAdmin() {
  try {
    console.log('🚀 Creating test company and admin...');

    // Test company data
    const testCompany = {
      id: 'test-company-001',
      companyName: 'Test Cleaning Company',
      contactEmail: 'admin@testcleaning.se',
      address: 'Testgatan 1, 111 11 Stockholm',
      areaTag: 'Stockholm',
      subscriptionPlan: 'premium',
      subscriptionActive: true,
      serviceType: 'cleaning',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Test admin user data
    const testAdmin = {
      email: 'admin@testcleaning.se',
      password: 'TestPassword123!',
      name: 'Test Admin',
      role: 'admin'
    };

    // Step 1: Create the company in Firestore
    console.log('📝 Creating company in Firestore...');
    await setDoc(doc(db, 'companies', testCompany.id), testCompany);
    console.log('✅ Company created successfully');

    // Step 2: Create admin user in Firebase Auth
    console.log('👤 Creating admin user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testAdmin.email, 
      testAdmin.password
    );
    const user = userCredential.user;
    console.log('✅ Admin user created successfully');

    // Step 3: Create user profile in Firestore
    console.log('📝 Creating user profile in Firestore...');
    const userProfile = {
      id: user.uid,
      firebase_uid: user.uid,
      email: testAdmin.email,
      name: testAdmin.name,
      role: testAdmin.role,
      admin_of: [testCompany.id], // This user is admin of the test company
      super_admin: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✅ User profile created successfully');

    // Step 4: Add some sample customers to the company
    console.log('👥 Adding sample customers...');
    const sampleCustomers = [
      {
        id: 'customer-001',
        name: 'Anna Johansson',
        email: 'anna.johansson@example.com',
        phone: '070-123 45 67',
        address: 'Storgatan 12, 111 52 Stockholm',
        rutRotEligible: true,
        isCompany: false,
        areaTag: 'Stockholm',
        customerTags: ['VIP', 'RUT-berättigad', 'Återkommande'],
        bookingFrequency: 'weekly',
        consentGiven: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'customer-002',
        name: 'Stockholm Office Solutions',
        email: 'info@stockholmoffices.com',
        phone: '08-555 12 34',
        address: 'Kungsgatan 5, 111 43 Stockholm',
        rutRotEligible: false,
        isCompany: true,
        contactPerson: 'Lars Nilsson',
        areaTag: 'Stockholm',
        customerTags: ['Kommersiell', 'Flerårig kontrakt', 'Stor kund'],
        bookingFrequency: 'monthly',
        consentGiven: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const customer of sampleCustomers) {
      await setDoc(doc(db, `companies/${testCompany.id}/customers`, customer.id), customer);
    }
    console.log('✅ Sample customers added successfully');

    // Success summary
    console.log('\n🎉 Test Company and Admin Created Successfully!');
    console.log('==============================================');
    console.log(`Company ID: ${testCompany.id}`);
    console.log(`Company Name: ${testCompany.companyName}`);
    console.log(`Admin Email: ${testAdmin.email}`);
    console.log(`Admin Password: ${testAdmin.password}`);
    console.log(`Login URL: http://localhost:5174/admin/${testCompany.id}`);
    console.log('\n📋 Login Instructions:');
    console.log('1. Go to http://localhost:5174/login');
    console.log(`2. Login with: ${testAdmin.email}`);
    console.log(`3. Password: ${testAdmin.password}`);
    console.log(`4. Navigate to: http://localhost:5174/admin/${testCompany.id}`);
    console.log('5. Click on "CRM" tab to test the Data Connect CRM');

  } catch (error) {
    console.error('❌ Error creating test company and admin:', error);
    console.error('Error details:', error.message);
  }
}

// Run the script
createTestCompanyAndAdmin(); 