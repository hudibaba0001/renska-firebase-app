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

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...');
    
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    console.log('🏢 Migrating data for company:', companyId);
    
    // Check if company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      console.log('❌ Company not found:', companyId);
      return;
    }
    
    console.log('✅ Company found:', companyDoc.data().name);
    
    // 1. Migrate Services
    console.log('\n🔧 Migrating services...');
    const oldServices = await db.collection('services').where('companyId', '==', companyId).get();
    console.log(`Found ${oldServices.size} services to migrate`);
    
    for (const serviceDoc of oldServices.docs) {
      const serviceData = serviceDoc.data();
      console.log(`- Migrating service: ${serviceData.name || serviceDoc.id}`);
      
      // Add to new subcollection
      await db.collection('companies').doc(companyId).collection('services').doc(serviceDoc.id).set({
        ...serviceData,
        migrated: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Service migrated: ${serviceDoc.id}`);
    }
    
    // 2. Migrate Bookings
    console.log('\n📅 Migrating bookings...');
    const oldBookings = await db.collection('bookings').where('companyId', '==', companyId).get();
    console.log(`Found ${oldBookings.size} bookings to migrate`);
    
    for (const bookingDoc of oldBookings.docs) {
      const bookingData = bookingDoc.data();
      console.log(`- Migrating booking: ${bookingData.customerEmail || bookingDoc.id}`);
      
      // Add to new subcollection
      await db.collection('companies').doc(companyId).collection('bookings').doc(bookingDoc.id).set({
        ...bookingData,
        migrated: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Booking migrated: ${bookingDoc.id}`);
    }
    
    // 3. Migrate Customers
    console.log('\n👥 Migrating customers...');
    const oldCustomers = await db.collection('customers').where('companyId', '==', companyId).get();
    console.log(`Found ${oldCustomers.size} customers to migrate`);
    
    for (const customerDoc of oldCustomers.docs) {
      const customerData = customerDoc.data();
      console.log(`- Migrating customer: ${customerData.name || customerDoc.id}`);
      
      // Add to new subcollection
      await db.collection('companies').doc(companyId).collection('customers').doc(customerDoc.id).set({
        ...customerData,
        migrated: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Customer migrated: ${customerDoc.id}`);
    }
    
    // 4. Check for calculators (if they exist)
    console.log('\n🧮 Checking for calculators...');
    const oldCalculators = await db.collection('calculators').where('companyId', '==', companyId).get();
    console.log(`Found ${oldCalculators.size} calculators to migrate`);
    
    for (const calculatorDoc of oldCalculators.docs) {
      const calculatorData = calculatorDoc.data();
      console.log(`- Migrating calculator: ${calculatorData.name || calculatorDoc.id}`);
      
      // Add to new subcollection
      await db.collection('companies').doc(companyId).collection('calculators').doc(calculatorDoc.id).set({
        ...calculatorData,
        migrated: true,
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Calculator migrated: ${calculatorDoc.id}`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`- Services migrated: ${oldServices.size}`);
    console.log(`- Bookings migrated: ${oldBookings.size}`);
    console.log(`- Customers migrated: ${oldCustomers.size}`);
    console.log(`- Calculators migrated: ${oldCalculators.size}`);
    
    // Optional: Delete old data (uncomment if you want to remove old data)
    /*
    console.log('\n🗑️ Cleaning up old data...');
    for (const serviceDoc of oldServices.docs) {
      await db.collection('services').doc(serviceDoc.id).delete();
    }
    for (const bookingDoc of oldBookings.docs) {
      await db.collection('bookings').doc(bookingDoc.id).delete();
    }
    for (const customerDoc of oldCustomers.docs) {
      await db.collection('customers').doc(customerDoc.id).delete();
    }
    for (const calculatorDoc of oldCalculators.docs) {
      await db.collection('calculators').doc(calculatorDoc.id).delete();
    }
    console.log('✅ Old data cleaned up');
    */
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }); 