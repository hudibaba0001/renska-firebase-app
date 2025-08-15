/**
 * Add Test Calculator Script
 * Quick script to add a test calculator to the database
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestCalculator(companyId) {
  try {
    console.log(`🔧 Adding test calculator for company: ${companyId}`);
    
    const calculatorData = {
      name: 'Test Booking Calculator',
      slug: 'test-calculator',
      description: 'A test calculator for the admin dashboard',
      status: 'published',
      views: 150,
      conversions: 12,
      revenue: '2400 kr',
      trend: '+15%',
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    const calculatorRef = db.collection('companies').doc(companyId).collection('calculators').doc();
    await calculatorRef.set(calculatorData);
    
    console.log(`✅ Test calculator created with ID: ${calculatorRef.id}`);
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
  console.log('Usage: node scripts/add-test-calculator.js <companyId>');
  console.log('Example: node scripts/add-test-calculator.js r7kAsnh-r1');
  process.exit(1);
}

addTestCalculator(companyId)
  .then(() => {
    console.log('🎉 Test calculator created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 