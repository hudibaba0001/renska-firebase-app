/**
 * Create Test Tenant
 * 
 * This script creates a test tenant in the companies collection
 * to demonstrate the super admin dashboard functionality.
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Set up service account key (same as setup-super-admin.js)
 * 3. Run with: node scripts/create-test-tenant.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Create test tenant companies
 */
async function createTestTenants() {
  try {
    const db = admin.firestore();
    
    // Test tenant data
    const testTenants = [
      {
        name: 'Städproffs Stockholm AB',
        companyName: 'Städproffs Stockholm AB',
        slug: 'stadproffs-stockholm',
        rutPercentage: 50,
        adminEmail: 'admin@stadproffs.se',
        adminName: 'Anna Andersson',
        subscription: {
          active: true,
          plan: 'premium',
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        settings: {
          emailNotifications: true,
          bookingConfirmation: true,
          automaticPricing: true
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Rengöring Plus Göteborg',
        companyName: 'Rengöring Plus Göteborg',
        slug: 'rengoring-plus-gbg',
        rutPercentage: 50,
        adminEmail: 'kontakt@rengoring-plus.se',
        adminName: 'Erik Eriksson',
        subscription: {
          active: true,
          plan: 'standard',
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        settings: {
          emailNotifications: true,
          bookingConfirmation: true,
          automaticPricing: false
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Hemstäd Malmö',
        companyName: 'Hemstäd Malmö',
        slug: 'hemstad-malmo',
        rutPercentage: 50,
        adminEmail: 'info@hemstad-malmo.se',
        adminName: 'Maria Svensson',
        subscription: {
          active: false,
          plan: 'basic',
          status: 'suspended',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        settings: {
          emailNotifications: false,
          bookingConfirmation: true,
          automaticPricing: true
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    console.log('🏢 Creating test tenants...');

    // Create each test tenant
    for (const tenant of testTenants) {
      const docRef = await db.collection('companies').add(tenant);
      console.log(`✅ Created tenant: ${tenant.companyName} (ID: ${docRef.id})`);
      
      // Create some sample bookings for the tenant
      const sampleBookings = [
        {
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+46701234567',
          service: 'Hemstädning',
          date: new Date(),
          status: 'confirmed',
          totalPrice: 1200,
          rutDeduction: 600,
          finalPrice: 600,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+46701234568',
          service: 'Flyttstädning',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          status: 'completed',
          totalPrice: 2400,
          rutDeduction: 1200,
          finalPrice: 1200,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      // Add sample bookings to the tenant
      for (const booking of sampleBookings) {
        await db.collection('companies').doc(docRef.id).collection('bookings').add(booking);
      }
      
      console.log(`📋 Added ${sampleBookings.length} sample bookings for ${tenant.companyName}`);
    }

    console.log('\n🎉 Test tenants created successfully!');
    console.log('🌐 Visit your super admin dashboard at: http://localhost:5174/super-admin/tenants');
    console.log('📊 You should now see the test tenants in the dashboard');
    
  } catch (error) {
    console.error('❌ Error creating test tenants:', error);
  } finally {
    process.exit();
  }
}

// Command line usage
console.log(`
🏢 Test Tenant Creator

This script will create 3 test tenants with sample data:
1. Städproffs Stockholm AB (Premium, Active)
2. Rengöring Plus Göteborg (Standard, Active)  
3. Hemstäd Malmö (Basic, Suspended)

Setup Instructions:
1. Make sure you have the serviceAccountKey.json file in this directory
2. Run: node scripts/create-test-tenant.js

⚠️  This will add test data to your Firestore database.
`);

// Create the test tenants
createTestTenants(); 