const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkSandhuServices() {
  try {
    console.log('🔍 Checking services for Sandhu AB...');
    const companyId = 'r7kAsnh-r1';

    // Check calculators collection
    console.log('\n📊 Checking calculators collection...');
    const calculatorsSnapshot = await db.collection('calculators').get();
    
    if (!calculatorsSnapshot.empty) {
      console.log(`✅ Found ${calculatorsSnapshot.size} calculators in global collection:`);
      calculatorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        console.log(`    Company: ${data.companyId || 'Unknown'}`);
        console.log(`    Created by: ${data.createdBy || 'Unknown'}`);
      });
    } else {
      console.log('❌ No calculators found in global collection');
    }

    // Check company-specific calculators
    console.log('\n📊 Checking company-specific calculators...');
    const companyCalculatorsSnapshot = await db.collection(`companies/${companyId}/calculators`).get();
    
    if (!companyCalculatorsSnapshot.empty) {
      console.log(`✅ Found ${companyCalculatorsSnapshot.size} calculators for Sandhu AB:`);
      companyCalculatorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        console.log(`    Type: ${data.type || 'Unknown'}`);
        console.log(`    Status: ${data.status || 'Unknown'}`);
      });
    } else {
      console.log('❌ No company-specific calculators found');
    }

    // Check services collection
    console.log('\n📊 Checking services collection...');
    const servicesSnapshot = await db.collection('services').get();
    
    if (!servicesSnapshot.empty) {
      console.log(`✅ Found ${servicesSnapshot.size} services in global collection:`);
      servicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        console.log(`    Company: ${data.companyId || 'Unknown'}`);
      });
    } else {
      console.log('❌ No services found in global collection');
    }

    // Check company-specific services
    console.log('\n📊 Checking company-specific services...');
    const companyServicesSnapshot = await db.collection(`companies/${companyId}/services`).get();
    
    if (!companyServicesSnapshot.empty) {
      console.log(`✅ Found ${companyServicesSnapshot.size} services for Sandhu AB:`);
      companyServicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name || 'Unnamed'} (ID: ${doc.id})`);
        console.log(`    Price: ${data.price || 'Unknown'}`);
        console.log(`    Duration: ${data.duration || 'Unknown'}`);
      });
    } else {
      console.log('❌ No company-specific services found');
    }

    // Check if there are any services under the old company ID
    console.log('\n🔍 Checking for services under old company ID...');
    const oldCompanyId = 'Yfun7EgM8ip8lQmzIuy6';
    const oldCompanyServicesSnapshot = await db.collection(`companies/${oldCompanyId}/services`).get();
    
    if (!oldCompanyServicesSnapshot.empty) {
      console.log(`⚠️ Found ${oldCompanyServicesSnapshot.size} services under old company ID (${oldCompanyId}):`);
      oldCompanyServicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name || 'Unnamed'} (ID: ${doc.id})`);
      });
      
      console.log('\n🔄 Would you like to migrate these services to your current company?');
      console.log('Run: node scripts/migrate-services.js to move them');
    } else {
      console.log('❌ No services found under old company ID');
    }

  } catch (error) {
    console.error('❌ Error checking services:', error);
  }
}

checkSandhuServices(); 