const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({projectId: 'reniska-webapp'});
}

const db = admin.firestore();

async function checkServices() {
  const companyId = 'r7kAsnh-r1';
  const servicesRef = db.collection('companies').doc(companyId).collection('services');
  const snapshot = await servicesRef.get();
  
  console.log(`Found ${snapshot.size} services for company ${companyId}:`);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ${doc.id}: ${data.name || 'No name'} (deleted: ${data.deleted || false})`);
  });
}

checkServices().then(() => process.exit(0)); 