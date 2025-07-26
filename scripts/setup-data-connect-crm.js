const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
const admin = initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

console.log('🚀 Setting up Firebase Data Connect CRM...');

// CRM Schema Design for Data Connect
const crmSchema = {
  // Core CRM Tables
  customers: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    first_name: 'string',
    last_name: 'string',
    email: 'string (unique)',
    phone: 'string',
    address: 'string',
    city: 'string',
    postal_code: 'string',
    country: 'string',
    status: 'enum (active, inactive, prospect)',
    source: 'string',
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
    created_by: 'string (user_id)',
    tags: 'array<string>',
    custom_fields: 'json'
  },
  
  leads: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    customer_id: 'string (foreign key)',
    title: 'string',
    description: 'text',
    status: 'enum (new, contacted, qualified, proposal, won, lost)',
    priority: 'enum (low, medium, high, urgent)',
    value: 'decimal',
    currency: 'string',
    expected_close_date: 'date',
    assigned_to: 'string (user_id)',
    source: 'string',
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
    created_by: 'string (user_id)'
  },
  
  deals: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    lead_id: 'string (foreign key)',
    customer_id: 'string (foreign key)',
    title: 'string',
    description: 'text',
    status: 'enum (draft, sent, negotiated, won, lost)',
    value: 'decimal',
    currency: 'string',
    probability: 'integer (0-100)',
    expected_close_date: 'date',
    actual_close_date: 'date',
    assigned_to: 'string (user_id)',
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
    created_by: 'string (user_id)'
  },
  
  tasks: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    title: 'string',
    description: 'text',
    status: 'enum (pending, in_progress, completed, cancelled)',
    priority: 'enum (low, medium, high, urgent)',
    type: 'enum (call, email, meeting, follow_up, other)',
    due_date: 'date',
    completed_date: 'date',
    assigned_to: 'string (user_id)',
    related_to: 'string (customer_id, lead_id, or deal_id)',
    related_type: 'enum (customer, lead, deal)',
    notes: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
    created_by: 'string (user_id)'
  },
  
  activities: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    type: 'enum (call, email, meeting, note, task)',
    subject: 'string',
    description: 'text',
    related_to: 'string (customer_id, lead_id, or deal_id)',
    related_type: 'enum (customer, lead, deal)',
    user_id: 'string (user_id)',
    duration: 'integer (minutes)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Supporting Tables
  companies: {
    id: 'string (primary key)',
    name: 'string',
    domain: 'string',
    plan: 'enum (free, basic, professional, enterprise)',
    status: 'enum (active, suspended, cancelled)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  users: {
    id: 'string (primary key)',
    company_id: 'string (foreign key)',
    email: 'string (unique)',
    first_name: 'string',
    last_name: 'string',
    role: 'enum (admin, manager, sales, support)',
    status: 'enum (active, inactive)',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  }
};

// Sample Data for Testing
const sampleData = {
  customers: [
    {
      id: 'cust_001',
      company_id: 'company_001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Stockholm',
      postal_code: '11122',
      country: 'Sweden',
      status: 'active',
      source: 'website',
      notes: 'Interested in premium cleaning services',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'user_001',
      tags: ['premium', 'residential'],
      custom_fields: { preferred_time: 'morning', pets: true }
    },
    {
      id: 'cust_002',
      company_id: 'company_001',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1234567891',
      address: '456 Business Ave',
      city: 'Gothenburg',
      postal_code: '41101',
      country: 'Sweden',
      status: 'active',
      source: 'referral',
      notes: 'Commercial cleaning contract',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'user_001',
      tags: ['commercial', 'contract'],
      custom_fields: { contract_size: 'large', frequency: 'weekly' }
    }
  ],
  
  leads: [
    {
      id: 'lead_001',
      company_id: 'company_001',
      customer_id: 'cust_001',
      title: 'Premium Residential Cleaning',
      description: 'Large house requiring premium cleaning services',
      status: 'qualified',
      priority: 'high',
      value: 2500.00,
      currency: 'SEK',
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      assigned_to: 'user_001',
      source: 'website',
      notes: 'Customer is very interested, follow up next week',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'user_001'
    }
  ],
  
  deals: [
    {
      id: 'deal_001',
      company_id: 'company_001',
      lead_id: 'lead_001',
      customer_id: 'cust_001',
      title: 'Premium Cleaning Contract',
      description: 'Monthly premium cleaning service for large residential property',
      status: 'negotiated',
      value: 2500.00,
      currency: 'SEK',
      probability: 75,
      expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      assigned_to: 'user_001',
      notes: 'Contract terms being finalized',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'user_001'
    }
  ],
  
  tasks: [
    {
      id: 'task_001',
      company_id: 'company_001',
      title: 'Follow up with John Doe',
      description: 'Call to discuss premium cleaning package',
      status: 'pending',
      priority: 'high',
      type: 'call',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      assigned_to: 'user_001',
      related_to: 'cust_001',
      related_type: 'customer',
      notes: 'Customer showed high interest, ready to close',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'user_001'
    }
  ]
};

console.log('📋 CRM Schema designed with proper relationships');
console.log('📊 Sample data prepared for testing');

// Next steps for Data Connect setup
console.log('\n🔄 Next Steps:');
console.log('1. Enable Firebase Data Connect in Firebase Console');
console.log('2. Create PostgreSQL database');
console.log('3. Set up schema using the defined structure');
console.log('4. Generate GraphQL schema');
console.log('5. Build React CRM with type-safe queries');

module.exports = { crmSchema, sampleData }; 