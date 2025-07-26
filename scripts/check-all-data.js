const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../webapp/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAllData() {
  try {
    console.log('🔍 Checking all data in Firestore database...');
    
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    console.log('🏢 Checking data for company:', companyId);
    
    // Check companies collection
    console.log('\n📊 === COMPANIES COLLECTION ===');
    const companiesSnapshot = await db.collection('companies').get();
    console.log(`Found ${companiesSnapshot.size} companies:`);
    companiesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name || 'No name'} (deleted: ${data.deleted || false})`);
    });
    
    // Check services subcollection
    console.log('\n🔧 === SERVICES SUBSCOLLECTION ===');
    const servicesSnapshot = await db.collection('companies').doc(companyId).collection('services').get();
    console.log(`Found ${servicesSnapshot.size} services for company ${companyId}:`);
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.price || 0} kr, deleted: ${data.deleted || false})`);
    });
    
    // Check calculators subcollection
    console.log('\n🧮 === CALCULATORS SUBSCOLLECTION ===');
    const calculatorsSnapshot = await db.collection('companies').doc(companyId).collection('calculators').get();
    console.log(`Found ${calculatorsSnapshot.size} calculators for company ${companyId}:`);
    calculatorsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name || 'No name'} (slug: ${data.slug || 'none'}, deleted: ${data.deleted || false})`);
    });
    
    // Check bookings subcollection
    console.log('\n📅 === BOOKINGS SUBSCOLLECTION ===');
    const bookingsSnapshot = await db.collection('companies').doc(companyId).collection('bookings').get();
    console.log(`Found ${bookingsSnapshot.size} bookings for company ${companyId}:`);
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (${data.price || 0} kr, deleted: ${data.deleted || false})`);
    });
    
    // Check customers subcollection
    console.log('\n👥 === CUSTOMERS SUBSCOLLECTION ===');
    const customersSnapshot = await db.collection('companies').doc(companyId).collection('customers').get();
    console.log(`Found ${customersSnapshot.size} customers for company ${companyId}:`);
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.email || 'No email'}, deleted: ${data.deleted || false})`);
    });
    
    // Check if there are any old collections (before subcollection structure)
    console.log('\n🔍 === CHECKING FOR OLD COLLECTIONS ===');
    
    // Check if there's a top-level services collection
    const oldServicesSnapshot = await db.collection('services').get();
    if (oldServicesSnapshot.size > 0) {
      console.log(`Found ${oldServicesSnapshot.size} services in old top-level collection:`);
      oldServicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (companyId: ${data.companyId || 'none'})`);
      });
    } else {
      console.log('No old top-level services collection found');
    }
    
    // Check if there's a top-level bookings collection
    const oldBookingsSnapshot = await db.collection('bookings').get();
    if (oldBookingsSnapshot.size > 0) {
      console.log(`Found ${oldBookingsSnapshot.size} bookings in old top-level collection:`);
      oldBookingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (companyId: ${data.companyId || 'none'})`);
      });
    } else {
      console.log('No old top-level bookings collection found');
    }
    
    // Check if there's a top-level customers collection
    const oldCustomersSnapshot = await db.collection('customers').get();
    if (oldCustomersSnapshot.size > 0) {
      console.log(`Found ${oldCustomersSnapshot.size} customers in old top-level collection:`);
      oldCustomersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (companyId: ${data.companyId || 'none'})`);
      });
    } else {
      console.log('No old top-level customers collection found');
    }
    
    console.log('\n✅ Data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    throw error;
  }
}

// Run the check
checkAllData()
  .then(() => {
    console.log('🎉 All data checked successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Data check failed:', error);
    process.exit(1);
  }); 