// scripts/create-test-calculator.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestCalculator(companyId) {
  try {
    console.log(`Creating test calculator for company: ${companyId}`);
    
    // Check if company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      console.log(`❌ Company ${companyId} does not exist!`);
      return;
    }
    
    const companyData = companyDoc.data();
    console.log(`✅ Company found: ${companyData.companyName || companyData.name || 'Unnamed'}`);
    
    // Create test calculator
    const calculatorData = {
      name: 'Test Window Cleaning Calculator',
      description: 'A test calculator for window cleaning services',
      status: 'published',
      slug: 'test-window-cleaning',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      views: 0,
      conversions: 0,
      revenue: '0 kr',
      trend: '+0%',
      config: {
        services: ['window-cleaning'],
        zipCodeEnabled: true,
        customerInfoFields: ['name', 'email', 'phone'],
        pricingModel: 'per-window',
        minimumPrice: 299
      }
    };
    
    const calculatorRef = await db.collection('companies').doc(companyId).collection('calculators').add(calculatorData);
    
    console.log(`✅ Test calculator created successfully!`);
    console.log(`🆔 Calculator ID: ${calculatorRef.id}`);
    console.log(`📊 Name: ${calculatorData.name}`);
    console.log(`🔗 Slug: ${calculatorData.slug}`);
    console.log(`🌐 Live URL: http://localhost:5184/booking/${companyId}/${calculatorData.slug}`);
    console.log(`⚙️ Admin URL: http://localhost:5184/admin/${companyId}/forms/${calculatorRef.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test calculator:', error);
    throw error;
  }
}

// Get company ID from command line argument
const companyId = process.argv[2];

if (!companyId) {
  console.log('Usage: node scripts/create-test-calculator.js <companyId>');
  console.log('Example: node scripts/create-test-calculator.js c3');
  process.exit(1);
}

createTestCalculator(companyId)
  .then(() => {
    console.log('🎉 Test calculator creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 