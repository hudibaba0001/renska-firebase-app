// Demo data loader for CRM
import firebase from '../firebase/init';

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
      companyId: 'demo-company'
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
      companyId: 'demo-company'
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
      companyId: 'demo-company'
    },
    {
      name: 'Lisa Chen',
      email: 'lisa.chen@innovate.com',
      phone: '+1-555-0321',
      company: 'Innovate Solutions',
      status: 'active',
      tags: ['mid-market', 'innovative'],
      address: {
        street: '321 Creative Way',
        city: 'Austin',
        state: 'TX',
        zip: '73301',
        country: 'USA'
      },
      notes: 'Innovative company, open to new technologies',
      createdAt: new Date('2024-01-30'),
      lastContact: new Date('2024-03-12'),
      companyId: 'demo-company'
    },
    {
      name: 'David Brown',
      email: 'david.brown@retailplus.com',
      phone: '+1-555-0654',
      company: 'Retail Plus',
      status: 'active',
      tags: ['retail', 'expansion'],
      address: {
        street: '654 Commerce Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
        country: 'USA'
      },
      notes: 'Retail chain expanding to new markets',
      createdAt: new Date('2024-02-15'),
      lastContact: new Date('2024-03-05'),
      companyId: 'demo-company'
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
      companyId: 'demo-company'
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
      companyId: 'demo-company'
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
      companyId: 'demo-company'
    },
    {
      name: 'Rachel Green',
      email: 'rachel.green@fastgrow.com',
      phone: '+1-555-0789',
      company: 'FastGrow Inc',
      status: 'new',
      source: 'email',
      notes: 'Responded to email campaign',
      createdAt: new Date('2024-03-16'),
      lastContact: new Date('2024-03-16'),
      companyId: 'demo-company'
    },
    {
      name: 'Chris Lee',
      email: 'chris.lee@techscale.com',
      phone: '+1-555-0321',
      company: 'TechScale',
      status: 'contacted',
      source: 'website',
      notes: 'Downloaded whitepaper, follow up needed',
      createdAt: new Date('2024-03-12'),
      lastContact: new Date('2024-03-15'),
      companyId: 'demo-company'
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
      companyId: 'demo-company'
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
      companyId: 'demo-company'
    },
    {
      title: 'Innovate Solutions Implementation',
      customerName: 'Lisa Chen',
      value: 75000,
      stage: 'closed-won',
      probability: '100%',
      expectedCloseDate: new Date('2024-03-20'),
      description: 'Full implementation and training',
      createdAt: new Date('2024-01-15'),
      companyId: 'demo-company'
    },
    {
      title: 'Retail Plus Multi-Location',
      customerName: 'David Brown',
      value: 35000,
      stage: 'qualification',
      probability: '40%',
      expectedCloseDate: new Date('2024-05-15'),
      description: 'Multi-location retail solution',
      createdAt: new Date('2024-03-01'),
      companyId: 'demo-company'
    },
    {
      title: 'Growth Co Starter Package',
      customerName: 'Emma Davis',
      value: 15000,
      stage: 'prospecting',
      probability: '25%',
      expectedCloseDate: new Date('2024-06-01'),
      description: 'Starter package for new business',
      createdAt: new Date('2024-03-10'),
      companyId: 'demo-company'
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
      companyId: 'demo-company'
    },
    {
      title: 'Demo for TechStart',
      description: 'Schedule and prepare demo for platform upgrade',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'Demo Team',
      dueDate: new Date('2024-03-22'),
      createdAt: new Date('2024-03-16'),
      companyId: 'demo-company'
    },
    {
      title: 'Contract review for Innovate',
      description: 'Review and finalize contract terms',
      status: 'completed',
      priority: 'high',
      assignedTo: 'Legal Team',
      dueDate: new Date('2024-03-18'),
      createdAt: new Date('2024-03-14'),
      companyId: 'demo-company'
    },
    {
      title: 'Site visit for Retail Plus',
      description: 'Visit retail locations to assess needs',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Implementation Team',
      dueDate: new Date('2024-03-25'),
      createdAt: new Date('2024-03-17'),
      companyId: 'demo-company'
    },
    {
      title: 'Lead qualification call',
      description: 'Call new leads to qualify interest',
      status: 'pending',
      priority: 'low',
      assignedTo: 'Sales Team',
      dueDate: new Date('2024-03-19'),
      createdAt: new Date('2024-03-16'),
      companyId: 'demo-company'
    }
  ],
  
  reports: [
    {
      name: 'Sales Pipeline Report',
      type: 'pipeline',
      description: 'Overview of all deals in pipeline',
      lastGenerated: new Date('2024-03-15'),
      createdAt: new Date('2024-01-01'),
      companyId: 'demo-company'
    },
    {
      name: 'Lead Conversion Report',
      type: 'conversion',
      description: 'Lead to customer conversion rates',
      lastGenerated: new Date('2024-03-14'),
      createdAt: new Date('2024-01-01'),
      companyId: 'demo-company'
    },
    {
      name: 'Customer Activity Report',
      type: 'activity',
      description: 'Customer engagement and activity levels',
      lastGenerated: new Date('2024-03-13'),
      createdAt: new Date('2024-01-01'),
      companyId: 'demo-company'
    }
  ],
  
  settings: [
    {
      name: 'Email Notifications',
      value: 'enabled',
      description: 'Enable email notifications for new leads',
      enabled: true,
      companyId: 'demo-company'
    },
    {
      name: 'Auto Lead Assignment',
      value: 'enabled',
      description: 'Automatically assign leads to sales team',
      enabled: true,
      companyId: 'demo-company'
    },
    {
      name: 'Deal Alerts',
      value: 'enabled',
      description: 'Alert when deals are close to closing',
      enabled: true,
      companyId: 'demo-company'
    },
    {
      name: 'Data Export',
      value: 'disabled',
      description: 'Allow data export functionality',
      enabled: false,
      companyId: 'demo-company'
    }
  ]
};

export const loadCRMDemoData = async (companyId = 'demo-company') => {
  try {
    console.log('🚀 Loading CRM demo data for company:', companyId);
    
    const db = firebase.firestore();
    const batch = db.batch();
    
    // Load customers
    console.log('📊 Loading customers...');
    demoData.customers.forEach(customer => {
      const docRef = db.collection('customers').doc();
      batch.set(docRef, { ...customer, companyId });
    });
    
    // Load leads
    console.log('🎯 Loading leads...');
    demoData.leads.forEach(lead => {
      const docRef = db.collection('leads').doc();
      batch.set(docRef, { ...lead, companyId });
    });
    
    // Load deals
    console.log('💰 Loading deals...');
    demoData.deals.forEach(deal => {
      const docRef = db.collection('deals').doc();
      batch.set(docRef, { ...deal, companyId });
    });
    
    // Load tasks
    console.log('✅ Loading tasks...');
    demoData.tasks.forEach(task => {
      const docRef = db.collection('tasks').doc();
      batch.set(docRef, { ...task, companyId });
    });
    
    // Load reports
    console.log('📈 Loading reports...');
    demoData.reports.forEach(report => {
      const docRef = db.collection('reports').doc();
      batch.set(docRef, { ...report, companyId });
    });
    
    // Load settings
    console.log('⚙️ Loading settings...');
    demoData.settings.forEach(setting => {
      const docRef = db.collection('settings').doc();
      batch.set(docRef, { ...setting, companyId });
    });
    
    // Commit all changes
    await batch.commit();
    
    console.log('✅ CRM demo data loaded successfully!');
    console.log(`📊 Loaded ${demoData.customers.length} customers`);
    console.log(`🎯 Loaded ${demoData.leads.length} leads`);
    console.log(`💰 Loaded ${demoData.deals.length} deals`);
    console.log(`✅ Loaded ${demoData.tasks.length} tasks`);
    console.log(`📈 Loaded ${demoData.reports.length} reports`);
    console.log(`⚙️ Loaded ${demoData.settings.length} settings`);
    
    return true;
  } catch (error) {
    console.error('❌ Error loading CRM demo data:', error);
    throw error;
  }
};

export default loadCRMDemoData; 