// Test script to check data access
console.log('🔍 Testing data access...');

// This script will help us understand what data exists
// We'll run it in the browser console to check the data

const testDataAccess = async () => {
  try {
    console.log('🏢 Testing company access...');
    
    // Test 1: Check if we can access the company
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    console.log('Company ID:', companyId);
    
    // Test 2: Try to access services in old structure
    console.log('\n🔧 Testing old services collection...');
    try {
      const oldServicesQuery = query(
        collection(db, 'services'),
        where('companyId', '==', companyId),
        where('deleted', '==', false)
      );
      const oldServicesSnapshot = await getDocs(oldServicesQuery);
      console.log(`Found ${oldServicesSnapshot.size} services in old collection`);
      oldServicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing old services:', error.message);
    }
    
    // Test 3: Try to access services in new structure
    console.log('\n🔧 Testing new services subcollection...');
    try {
      const newServicesQuery = query(
        collection(db, 'companies', companyId, 'services'),
        where('deleted', '==', false)
      );
      const newServicesSnapshot = await getDocs(newServicesQuery);
      console.log(`Found ${newServicesSnapshot.size} services in new subcollection`);
      newServicesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing new services:', error.message);
    }
    
    // Test 4: Try to access bookings in old structure
    console.log('\n📅 Testing old bookings collection...');
    try {
      const oldBookingsQuery = query(
        collection(db, 'bookings'),
        where('companyId', '==', companyId),
        where('deleted', '==', false)
      );
      const oldBookingsSnapshot = await getDocs(oldBookingsQuery);
      console.log(`Found ${oldBookingsSnapshot.size} bookings in old collection`);
      oldBookingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing old bookings:', error.message);
    }
    
    // Test 5: Try to access bookings in new structure
    console.log('\n📅 Testing new bookings subcollection...');
    try {
      const newBookingsQuery = query(
        collection(db, 'companies', companyId, 'bookings'),
        where('deleted', '==', false)
      );
      const newBookingsSnapshot = await getDocs(newBookingsQuery);
      console.log(`Found ${newBookingsSnapshot.size} bookings in new subcollection`);
      newBookingsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.customerEmail || 'No email'} (${data.price || 0} kr)`);
      });
    } catch (error) {
      console.log('❌ Error accessing new bookings:', error.message);
    }
    
    // Test 6: Try to access customers in old structure
    console.log('\n👥 Testing old customers collection...');
    try {
      const oldCustomersQuery = query(
        collection(db, 'customers'),
        where('companyId', '==', companyId),
        where('deleted', '==', false)
      );
      const oldCustomersSnapshot = await getDocs(oldCustomersQuery);
      console.log(`Found ${oldCustomersSnapshot.size} customers in old collection`);
      oldCustomersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.email || 'No email'})`);
      });
    } catch (error) {
      console.log('❌ Error accessing old customers:', error.message);
    }
    
    // Test 7: Try to access customers in new structure
    console.log('\n👥 Testing new customers subcollection...');
    try {
      const newCustomersQuery = query(
        collection(db, 'companies', companyId, 'customers'),
        where('deleted', '==', false)
      );
      const newCustomersSnapshot = await getDocs(newCustomersQuery);
      console.log(`Found ${newCustomersSnapshot.size} customers in new subcollection`);
      newCustomersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.name || 'No name'} (${data.email || 'No email'})`);
      });
    } catch (error) {
      console.log('❌ Error accessing new customers:', error.message);
    }
    
    console.log('\n✅ Data access test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Instructions for running this test
console.log(`
📋 INSTRUCTIONS:
1. Open your web application in the browser
2. Log in as an admin user
3. Open the browser console (F12)
4. Copy and paste this entire script into the console
5. Press Enter to run the test

This will help us identify where your data is located and what needs to be migrated.
`);

// Export the function for use in browser console
if (typeof window !== 'undefined') {
  window.testDataAccess = testDataAccess;
} 