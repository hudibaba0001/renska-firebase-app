// scripts/test-crm.js
// Test script for CRM functionality

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config (use your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testCRM() {
  console.log('🧪 Testing CRM functionality...');
  
  const testCompanyId = 'test-company-crm';
  const testCustomer = {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+46 70 123 4567',
    customerType: 'private',
    status: 'lead',
    source: 'manual',
    addresses: [
      {
        id: 'addr_test_1',
        type: 'primary',
        street: 'Test Street 123',
        city: 'Stockholm',
        postalCode: '123 45',
        country: 'Sweden',
        isDefault: true
      }
    ],
    preferences: {
      preferredContactMethod: 'email',
      preferredTime: 'morning',
      specialInstructions: 'Test instructions',
      allergies: '',
      pets: false,
      accessInstructions: ''
    },
    tags: ['test', 'new'],
    notes: [],
    totalBookings: 0,
    totalSpent: 0
  };

  try {
    // Test 1: Create customer
    console.log('📝 Test 1: Creating customer...');
    const customersRef = collection(db, 'companies', testCompanyId, 'customers');
    const docRef = await addDoc(customersRef, {
      ...testCustomer,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Customer created with ID:', docRef.id);

    // Test 2: Read customers
    console.log('📖 Test 2: Reading customers...');
    const snapshot = await getDocs(customersRef);
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('✅ Found customers:', customers.length);

    // Test 3: Calculate stats
    console.log('📊 Test 3: Calculating stats...');
    const stats = {
      total: customers.length,
      byStatus: {
        lead: customers.filter(c => c.status === 'lead').length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        prospect: customers.filter(c => c.status === 'prospect').length
      },
      byType: {
        private: customers.filter(c => c.customerType === 'private').length,
        business: customers.filter(c => c.customerType === 'business').length
      },
      totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    };
    console.log('✅ Stats calculated:', stats);

    // Test 4: Clean up
    console.log('🧹 Test 4: Cleaning up...');
    for (const customer of customers) {
      await deleteDoc(doc(db, 'companies', testCompanyId, 'customers', customer.id));
    }
    console.log('✅ Cleanup completed');

    console.log('🎉 All CRM tests passed!');
    
  } catch (error) {
    console.error('❌ CRM test failed:', error);
  }
}

// Run the test
testCRM().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 