// scripts/create-test-calculator.js
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore');

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

async function createTestCalculator(companyId) {
  try {
    console.log(`🔧 Creating test calculator for company: ${companyId}`);
    
    const calculatorData = {
      name: 'Test Booking Calculator',
      slug: 'test-calculator',
      description: 'A test calculator for the admin dashboard',
      status: 'published',
      views: 150,
      conversions: 12,
      revenue: '2400 kr',
      trend: '+15%',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Form configuration
      services: [],
      zipAreas: ['41107', '41121', '41254'],
      rutSettings: {
        enabled: true,
        discountPercent: 30,
        annualCap: 50000
      },
      fieldOrder: ['name', 'email', 'phone', 'address', 'date', 'time'],
      fieldLabels: {},
      fieldHelp: {}
    };
    
    // Add to calculators subcollection
    const calculatorsRef = collection(db, 'companies', companyId, 'calculators');
    const docRef = await addDoc(calculatorsRef, calculatorData);
    
    console.log(`✅ Test calculator created with ID: ${docRef.id}`);
    console.log(`🌐 Calculator URL: http://localhost:5173/booking/${companyId}/${calculatorData.slug}`);
    console.log(`📊 Admin Dashboard: http://localhost:5173/admin/${companyId}`);
    
  } catch (error) {
    console.error('❌ Error creating test calculator:', error);
    throw error;
  }
}

// Get company ID from command line argument
const companyId = process.argv[2];

if (!companyId) {
  console.error('❌ Please provide a company ID as an argument');
  console.log('Usage: node scripts/create-test-calculator.js <companyId>');
  console.log('Example: node scripts/create-test-calculator.js r7kAsnh-r1');
  process.exit(1);
}

createTestCalculator(companyId)
  .then(() => {
    console.log('🎉 Test calculator created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 