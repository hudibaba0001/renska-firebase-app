const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

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

async function addServiceModifiers() {
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
    const services = companyData.services || [];
    
    // Add modifiers to each service
    const updatedServices = services.map(service => ({
      ...service,
      // Enable pet surcharge
      petSurcharge: true,
      petSurchargePercentage: 10,
      
      // Add accessibility options
      accessibilityOptions: [
        { label: 'Hiss tillgänglig', surcharge: 5 },
        { label: 'Trappor (3+ våningar)', surcharge: 15 },
        { label: 'Parkering på gatan', surcharge: 8 }
      ],
      
      // Add time preferences
      timePreferences: [
        { key: 'morning', label: 'Morgon (8-12)', surcharge: 0 },
        { key: 'afternoon', label: 'Eftermiddag (12-16)', surcharge: 0 },
        { key: 'evening', label: 'Kväll (16-20)', surcharge: 12 },
        { key: 'weekend', label: 'Helg', surcharge: 20 }
      ],
      
      // Add property type options
      propertyTypeOptions: [
        { key: 'apartment', label: 'Lägenhet', surcharge: 0 },
        { key: 'house', label: 'Hus', surcharge: 5 },
        { key: 'office', label: 'Kontor', surcharge: 15 },
        { key: 'villa', label: 'Villa', surcharge: 10 }
      ]
    }));
    
    // Update the company document
    await updateDoc(companyRef, {
      services: updatedServices
    });
    
    console.log('✅ Service modifiers added successfully!');
    console.log('📋 Added to each service:');
    console.log('  - Pet surcharge: 10%');
    console.log('  - Accessibility options: 3 options');
    console.log('  - Time preferences: 4 options');
    console.log('  - Property types: 4 options');
    
  } catch (error) {
    console.error('❌ Error adding service modifiers:', error);
  }
}

addServiceModifiers(); 