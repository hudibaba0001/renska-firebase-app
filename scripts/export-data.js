const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function exportData() {
  try {
    console.log('📤 Exporting Firestore data...');
    
    const companyId = 'Yfun7EgM8ip8lQmzIuy6';
    const exportDir = path.join(__dirname, '..', 'data-export');
    
    // Create export directory
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    console.log('📊 Exporting companies...');
    try {
      const companiesOutput = execSync('firebase firestore:get companies', { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'companies.json'), companiesOutput);
      console.log('✅ Companies exported');
    } catch (error) {
      console.log('❌ Error exporting companies:', error.message);
    }
    
    console.log('🔧 Exporting services...');
    try {
      const servicesOutput = execSync('firebase firestore:get services', { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'services.json'), servicesOutput);
      console.log('✅ Services exported');
    } catch (error) {
      console.log('❌ Error exporting services:', error.message);
    }
    
    console.log('📅 Exporting bookings...');
    try {
      const bookingsOutput = execSync('firebase firestore:get bookings', { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'bookings.json'), bookingsOutput);
      console.log('✅ Bookings exported');
    } catch (error) {
      console.log('❌ Error exporting bookings:', error.message);
    }
    
    console.log('👥 Exporting customers...');
    try {
      const customersOutput = execSync('firebase firestore:get customers', { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'customers.json'), customersOutput);
      console.log('✅ Customers exported');
    } catch (error) {
      console.log('❌ Error exporting customers:', error.message);
    }
    
    console.log('🧮 Exporting calculators...');
    try {
      const calculatorsOutput = execSync('firebase firestore:get calculators', { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'calculators.json'), calculatorsOutput);
      console.log('✅ Calculators exported');
    } catch (error) {
      console.log('❌ Error exporting calculators:', error.message);
    }
    
    // Also try subcollections
    console.log('🔧 Exporting services subcollection...');
    try {
      const servicesSubOutput = execSync(`firebase firestore:get companies/${companyId}/services`, { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'services-subcollection.json'), servicesSubOutput);
      console.log('✅ Services subcollection exported');
    } catch (error) {
      console.log('❌ Error exporting services subcollection:', error.message);
    }
    
    console.log('📅 Exporting bookings subcollection...');
    try {
      const bookingsSubOutput = execSync(`firebase firestore:get companies/${companyId}/bookings`, { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'bookings-subcollection.json'), bookingsSubOutput);
      console.log('✅ Bookings subcollection exported');
    } catch (error) {
      console.log('❌ Error exporting bookings subcollection:', error.message);
    }
    
    console.log('🧮 Exporting calculators subcollection...');
    try {
      const calculatorsSubOutput = execSync(`firebase firestore:get companies/${companyId}/calculators`, { encoding: 'utf8' });
      fs.writeFileSync(path.join(exportDir, 'calculators-subcollection.json'), calculatorsSubOutput);
      console.log('✅ Calculators subcollection exported');
    } catch (error) {
      console.log('❌ Error exporting calculators subcollection:', error.message);
    }
    
    console.log('\n✅ Data export completed!');
    console.log(`📁 Files saved in: ${exportDir}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

exportData(); 