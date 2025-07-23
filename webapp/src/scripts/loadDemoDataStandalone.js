// Standalone demo data loader - can be run from browser console
// Usage: Copy and paste this entire script into browser console

const loadDemoDataStandalone = async (companyId = 'demo-company') => {
  console.log('🚀 Loading CRM demo data for company:', companyId);
  
  const demoData = {
    customers: [
      {
        name: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '+1-555-0123',
        company: 'Acme Corporation',
        status: 'active',
        tags: ['vip', 'enterprise'],
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        notes: 'Key decision maker, interested in enterprise solutions',
        createdAt: new Date('2024-01-15'),
        lastContact: new Date('2024-03-10'),
        companyId
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@techstart.com',
        phone: '+1-555-0456',
        company: 'TechStart Inc',
        status: 'active',
        tags: ['startup', 'tech'],
        address: {
          street: '456 Innovation St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA'
        },
        notes: 'Growing startup, needs scalable solutions',
        createdAt: new Date('2024-02-01'),
        lastContact: new Date('2024-03-08'),
        companyId
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@globalcorp.com',
        phone: '+1-555-0789',
        company: 'Global Corp',
        status: 'inactive',
        tags: ['enterprise', 'international'],
        address: {
          street: '789 Corporate Blvd',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'USA'
        },
        notes: 'Large enterprise client, complex requirements',
        createdAt: new Date('2023-11-20'),
        lastContact: new Date('2024-01-15'),
        companyId
      }
    ],
    
    leads: [
      {
        name: 'Alex Rodriguez',
        email: 'alex.r@newstartup.com',
        phone: '+1-555-0987',
        company: 'NewStartup',
        status: 'new',
        source: 'website',
        notes: 'Found us through Google search, interested in pricing',
        createdAt: new Date('2024-03-15'),
        lastContact: new Date('2024-03-15'),
        companyId
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@growthco.com',
        phone: '+1-555-0123',
        company: 'Growth Co',
        status: 'contacted',
        source: 'referral',
        notes: 'Referred by existing customer, scheduled demo',
        createdAt: new Date('2024-03-10'),
        lastContact: new Date('2024-03-14'),
        companyId
      },
      {
        name: 'Tom Anderson',
        email: 'tom.anderson@legacycorp.com',
        phone: '+1-555-0456',
        company: 'Legacy Corp',
        status: 'qualified',
        source: 'social',
        notes: 'Looking to modernize their systems',
        createdAt: new Date('2024-03-05'),
        lastContact: new Date('2024-03-13'),
        companyId
      }
    ],
    
    deals: [
      {
        title: 'Acme Enterprise License',
        customerName: 'John Smith',
        value: 50000,
        stage: 'negotiation',
        probability: '75%',
        expectedCloseDate: new Date('2024-04-15'),
        description: 'Enterprise license for 500 users',
        createdAt: new Date('2024-02-01'),
        companyId
      },
      {
        title: 'TechStart Platform Upgrade',
        customerName: 'Sarah Johnson',
        value: 25000,
        stage: 'proposal',
        probability: '60%',
        expectedCloseDate: new Date('2024-04-30'),
        description: 'Platform upgrade and new features',
        createdAt: new Date('2024-02-15'),
        companyId
      }
    ],
    
    tasks: [
      {
        title: 'Follow up with Acme Corp',
        description: 'Send proposal for enterprise license',
        status: 'pending',
        priority: 'high',
        assignedTo: 'Sales Team',
        dueDate: new Date('2024-03-20'),
        createdAt: new Date('2024-03-15'),
        companyId
      },
      {
        title: 'Demo for TechStart',
        description: 'Schedule and prepare demo for platform upgrade',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'Demo Team',
        dueDate: new Date('2024-03-22'),
        createdAt: new Date('2024-03-16'),
        companyId
      }
    ]
  };

  try {
    // Get Firebase instance from the app
    const firebase = window.firebase || (window.app && window.app.firebase);
    if (!firebase) {
      throw new Error('Firebase not found. Make sure you are on the CRM page.');
    }
    
    const db = firebase.firestore();
    const batch = db.batch();
    
    // Load customers
    console.log('📊 Loading customers...');
    demoData.customers.forEach(customer => {
      const docRef = db.collection('customers').doc();
      batch.set(docRef, customer);
    });
    
    // Load leads
    console.log('🎯 Loading leads...');
    demoData.leads.forEach(lead => {
      const docRef = db.collection('leads').doc();
      batch.set(docRef, lead);
    });
    
    // Load deals
    console.log('💰 Loading deals...');
    demoData.deals.forEach(deal => {
      const docRef = db.collection('deals').doc();
      batch.set(docRef, deal);
    });
    
    // Load tasks
    console.log('✅ Loading tasks...');
    demoData.tasks.forEach(task => {
      const docRef = db.collection('tasks').doc();
      batch.set(docRef, task);
    });
    
    // Commit all changes
    await batch.commit();
    
    console.log('✅ CRM demo data loaded successfully!');
    console.log(`📊 Loaded ${demoData.customers.length} customers`);
    console.log(`🎯 Loaded ${demoData.leads.length} leads`);
    console.log(`💰 Loaded ${demoData.deals.length} deals`);
    console.log(`✅ Loaded ${demoData.tasks.length} tasks`);
    
    alert('Demo data loaded successfully! Refresh the page to see the data.');
    return true;
  } catch (error) {
    console.error('❌ Error loading CRM demo data:', error);
    alert('Error loading demo data: ' + error.message);
    throw error;
  }
};

// Make it available globally
window.loadDemoDataStandalone = loadDemoDataStandalone;

console.log('📝 Demo data loader ready!');
console.log('Usage: loadDemoDataStandalone("your-company-id")');
console.log('Example: loadDemoDataStandalone("demo-company")');

export default loadDemoDataStandalone; 