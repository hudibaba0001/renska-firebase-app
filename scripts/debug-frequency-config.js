const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBxQJxXJxXJxXJxXJxXJxXJxXJxXJxXJxX",
  authDomain: "renska-firebase-app.firebaseapp.com",
  projectId: "renska-firebase-app",
  storageBucket: "renska-firebase-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugFrequencyConfig() {
  try {
    const companyId = 'r7kAsnh-r1';
    
    // Get the company document
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (!companyDoc.exists()) {
      console.log('❌ Company not found');
      return;
    }
    
    const companyData = companyDoc.data();
    
    console.log('🔍 Company Frequency Configuration:');
    console.log('=====================================');
    console.log('Company ID:', companyId);
    console.log('Company Name:', companyData.name || companyData.companyName);
    console.log('');
    
    // Check frequency multipliers
    console.log('📊 Frequency Multipliers:');
    if (companyData.frequencyMultipliers && companyData.frequencyMultipliers.length > 0) {
      companyData.frequencyMultipliers.forEach((freq, index) => {
        console.log(`  ${index + 1}. Key: "${freq.key || 'undefined'}" | Label: "${freq.label || 'undefined'}" | Multiplier: ${freq.multiplier || 'undefined'}`);
      });
    } else {
      console.log('  ❌ No frequency multipliers configured');
    }
    
    console.log('');
    
    // Check services
    console.log('🔧 Services Frequency Settings:');
    if (companyData.services && companyData.services.length > 0) {
      companyData.services.forEach((service, index) => {
        console.log(`  Service ${index + 1}: ${service.name || service.id}`);
        console.log(`    - Frequency Enabled: ${service.frequencyEnabled !== false}`);
        console.log(`    - Service Frequency Multipliers: ${service.frequencyMultipliers ? service.frequencyMultipliers.length : 0}`);
        if (service.frequencyMultipliers && service.frequencyMultipliers.length > 0) {
          service.frequencyMultipliers.forEach((freq, fIndex) => {
            console.log(`      ${fIndex + 1}. Key: "${freq.key || 'undefined'}" | Label: "${freq.label || 'undefined'}" | Multiplier: ${freq.multiplier || 'undefined'}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('  ❌ No services found');
    }
    
  } catch (error) {
    console.error('❌ Error debugging frequency config:', error);
  }
}

debugFrequencyConfig(); 