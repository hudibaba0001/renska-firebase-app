const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function checkUserPermissions() {
  try {
    // Get user by email
    const userEmail = 'singhtanveer0989@gmail.com';
    const userRecord = await auth.getUserByEmail(userEmail);
    
    console.log('🔍 User Information:');
    console.log('==========================================');
    console.log(`Email: ${userRecord.email}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Custom Claims:`, userRecord.customClaims);
    
    if (userRecord.customClaims) {
      console.log('\n📋 Permission Details:');
      console.log('==========================================');
      console.log(`Super Admin: ${userRecord.customClaims.superAdmin || false}`);
      console.log(`Admin Of: ${userRecord.customClaims.adminOf || 'None'}`);
      console.log(`Role: ${userRecord.customClaims.role || 'None'}`);
      
      if (userRecord.customClaims.adminOf) {
        console.log('\n🏢 Company Access:');
        console.log('==========================================');
        userRecord.customClaims.adminOf.forEach((companyId, index) => {
          console.log(`${index + 1}. ${companyId}`);
        });
        
        // Check if r7kAsnh-r1 is in the adminOf array
        const hasAccess = userRecord.customClaims.adminOf.includes('r7kAsnh-r1');
        console.log(`\n✅ Has access to r7kAsnh-r1: ${hasAccess ? 'YES' : 'NO'}`);
      }
    } else {
      console.log('\n❌ No custom claims found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserPermissions(); 