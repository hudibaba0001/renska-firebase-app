const admin = require('firebase-admin');

// Initialize Firebase Admin with project ID
let app;
try {
  app = admin.app();
} catch (error) {
  app = admin.initializeApp({
    projectId: 'swed-de2a3'
  });
}

const db = admin.firestore();

async function checkData() {
  try {
    console.log('🔍 Checking Firestore data...');
    
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    console.log('🏢 Company ID:', companyId);
    
    // Check companies
    console.log('\n📊 Companies:');
    const companies = await db.collection('companies').get();
    console.log(`Found ${companies.size} companies`);
    companies.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.name || 'No name'}`);
    });
    
    // Check services
    console.log('\n🔧 Services:');
    try {
      const services = await db.collection('companies').doc(companyId).collection('services').get();
      console.log(`Found ${services.size} services`);
      services.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing services:', error.message);
    }
    
    // Check calculators
    console.log('\n🧮 Calculators:');
    try {
      const calculators = await db.collection('companies').doc(companyId).collection('calculators').get();
      console.log(`Found ${calculators.size} calculators`);
      calculators.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'}`);
      });
    } catch (error) {
      console.log('❌ Error accessing calculators:', error.message);
    }
    
    // Check bookings
    console.log('\n📅 Bookings:');
    try {
      const bookings = await db.collection('companies').doc(companyId).collection('bookings').get();
      console.log(`Found ${bookings.size} bookings`);
      bookings.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing bookings:', error.message);
    }
    
    // Check old collections
    console.log('\n🔍 Old collections:');
    
    const oldServices = await db.collection('services').get();
    if (oldServices.size > 0) {
      console.log(`Found ${oldServices.size} services in old collection`);
      oldServices.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (companyId: ${data.companyId || 'none'})`);
      });
    }
    
    const oldBookings = await db.collection('bookings').get();
    if (oldBookings.size > 0) {
      console.log(`Found ${oldBookings.size} bookings in old collection`);
      oldBookings.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (companyId: ${data.companyId || 'none'})`);
      });
    }
    
    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkData(); 