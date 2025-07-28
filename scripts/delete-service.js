const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxGQoJqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "reniska-webapp.firebaseapp.com",
  projectId: "reniska-webapp",
  storageBucket: "reniska-webapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteService() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: node delete-service.js <company-id> <service-id>');
    console.log('Example: node delete-service.js r7kAsnh-r1 abc123');
    return;
  }
  
  const companyId = args[0];
  const serviceId = args[1];
  
  try {
    console.log(`🗑️ Deleting service ${serviceId} from company ${companyId}...`);
    
    const serviceRef = doc(db, 'companies', companyId, 'services', serviceId);
    await deleteDoc(serviceRef);
    
    console.log(`✅ Service ${serviceId} deleted successfully!`);
    
  } catch (error) {
    console.error('❌ Error deleting service:', error);
  }
}

deleteService(); 