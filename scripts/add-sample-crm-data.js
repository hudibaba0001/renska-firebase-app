const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'swed-de2a3'
});

const db = admin.firestore();

async function addSampleCRMData() {
  console.log('🔧 Adding sample CRM data...\n');

  try {
    // Get the first company
    const companiesSnapshot = await db.collection('companies').limit(1).get();
    
    if (companiesSnapshot.empty) {
      console.log('❌ No companies found.');
      return;
    }

    const companyDoc = companiesSnapshot.docs[0];
    const companyId = companyDoc.id;
    console.log(`🏢 Adding data for company: ${companyId}`);

    // Sample customers
    const customers = [
      {
        name: 'Anna Andersson',
        email: 'anna.andersson@email.com',
        phone: '+46701234567',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Erik Svensson',
        email: 'erik.svensson@email.com',
        phone: '+46701234568',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Sample leads
    const leads = [
      {
        name: 'Maria Johansson',
        email: 'maria.johansson@email.com',
        phone: '+46701234569',
        source: 'website',
        priority: 'high',
        status: 'new',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Sample deals
    const deals = [
      {
        name: 'Premium Cleaning Contract',
        value: 15000,
        stage: 'negotiation',
        customer: 'Anna Andersson',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Sample tasks
    const tasks = [
      {
        title: 'Follow up with Maria Johansson',
        description: 'Call to discuss cleaning requirements',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high',
        status: 'pending',
        assignedTo: 'Sales Team',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // Add customers
    console.log('📝 Adding customers...');
    for (const customer of customers) {
      await db.collection(`companies/${companyId}/customers`).add(customer);
    }

    // Add leads
    console.log('🎯 Adding leads...');
    for (const lead of leads) {
      await db.collection(`companies/${companyId}/leads`).add(lead);
    }

    // Add deals
    console.log('💰 Adding deals...');
    for (const deal of deals) {
      await db.collection(`companies/${companyId}/deals`).add(deal);
    }

    // Add tasks
    console.log('📋 Adding tasks...');
    for (const task of tasks) {
      await db.collection(`companies/${companyId}/tasks`).add(task);
    }

    console.log('\n✅ Sample CRM data added successfully!');
    console.log('📊 Your CRM now has:');
    console.log('  • 2 customers');
    console.log('  • 1 lead');
    console.log('  • 1 deal (15,000 kr)');
    console.log('  • 1 task');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSampleCRMData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 