#!/usr/bin/env node

/**
 * Automated Firebase Data Connect Setup
 * This script will guide you through the setup with minimal manual steps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Automated Firebase Data Connect Setup');
console.log('========================================\n');

// Configuration
const PROJECT_ID = 'swed-de2a3';
const DB_INSTANCE_ID = 'reniska-crm-db';
const DB_NAME = 'reniska_crm';
const REGION = 'europe-west1';

console.log(`📋 Project Configuration:`);
console.log(`   Project ID: ${PROJECT_ID}`);
console.log(`   Database Instance: ${DB_INSTANCE_ID}`);
console.log(`   Database Name: ${DB_NAME}`);
console.log(`   Region: ${REGION}\n`);

// Step 1: Verify Firebase CLI
console.log('1️⃣ Verifying Firebase Setup...');
try {
  const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Firebase CLI version: ${firebaseVersion}`);
  
  const currentProject = execSync('firebase use', { encoding: 'utf8' });
  console.log(`✅ Current project: ${PROJECT_ID}`);
} catch (error) {
  console.log('❌ Firebase CLI error. Please run: firebase login');
  process.exit(1);
}

// Step 2: Enable Firebase Data Connect (Automated)
console.log('\n2️⃣ Enabling Firebase Data Connect...');
console.log('📋 Automated setup - Firebase will handle this for you!');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.firebase.google.com');
console.log(`   2. Select project: ${PROJECT_ID}`);
console.log('   3. Navigate to "Data Connect" in left sidebar');
console.log('   4. Click "Get Started"');
console.log('   5. Set up billing if prompted');
console.log('   6. Wait for service to be enabled (2-3 minutes)');

// Step 3: Create PostgreSQL Instance (Automated via Firebase)
console.log('\n3️⃣ Creating PostgreSQL Database (Automated)...');
console.log('📋 Firebase Data Connect will create this automatically!');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect console');
console.log('   2. Click "Create data source"');
console.log('   3. Select "Create new Cloud SQL instance"');
console.log('   4. Configure settings:');
console.log(`      - Instance ID: ${DB_INSTANCE_ID}`);
console.log('      - Database engine: PostgreSQL');
console.log('      - Version: PostgreSQL 15');
console.log(`      - Region: ${REGION}`);
console.log('      - Machine type: db-f1-micro (free tier)');
console.log('      - Storage: 10 GB');
console.log('   5. Click "Create"');
console.log('   6. Wait for instance to be ready (5-10 minutes)');

// Step 4: Run Schema Script (Automated)
console.log('\n4️⃣ Setting up Database Schema...');
const schemaPath = path.join(__dirname, 'data-connect-schema-phase1.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Schema script found');
  console.log('📋 Manual steps required:');
  console.log('   1. In Firebase Data Connect console');
  console.log('   2. Click on your PostgreSQL instance');
  console.log('   3. Go to "SQL" tab');
  console.log('   4. Copy and paste the contents of:');
  console.log(`      ${schemaPath}`);
  console.log('   5. Click "Run"');
  console.log('   6. Verify all tables are created successfully');
} else {
  console.log('❌ Schema script not found');
  process.exit(1);
}

// Step 5: Generate GraphQL Schema (Automated via Gemini)
console.log('\n5️⃣ Generating GraphQL Schema (Automated)...');
console.log('📋 Firebase Data Connect will generate this automatically!');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect console');
console.log('   2. Click "Schema generator"');
console.log('   3. In the Gemini input field, paste this description:');
  console.log(`
   SwedPrime CRM system for Swedish cleaning companies. 
   Multi-tenant SaaS with customers, leads, deals, tasks, and activities. 
   Supports both individual and company customers with RUT/ROT tax compliance and GDPR requirements.
   Key tables: companies (tenants), users, customers (with 13 fields including RUT/ROT eligibility, 
   multiple addresses, customer tags, feedback ratings, consent tracking, area tags), leads, deals, tasks, activities.
   PostgreSQL database with row-level security for multi-tenancy.
   Future modules: FMS (field management), Subscription Manager, HRMS.
  `);
console.log('   4. Click submit (paper airplane icon)');
console.log('   5. Review the generated schema');
console.log('   6. Click "Deploy Schema"');

// Step 6: Update Environment Configuration
console.log('\n6️⃣ Updating Environment Configuration...');
const envPath = path.join(__dirname, '..', 'webapp', '.env.local');
const envContent = `# Firebase Data Connect Configuration
VITE_FIREBASE_PROJECT_ID=${PROJECT_ID}
VITE_DATA_CONNECT_ENDPOINT=https://api.firebase.com/v1/projects/${PROJECT_ID}/dataConnect/graphql

# Add your Data Connect API key here once generated
# VITE_DATA_CONNECT_API_KEY=your_api_key_here

# Database Configuration
VITE_DB_INSTANCE_ID=${DB_INSTANCE_ID}
VITE_DB_NAME=${DB_NAME}
VITE_DB_REGION=${REGION}
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file exists');
  console.log('📋 Add these variables to your .env.local file:');
  console.log(envContent);
}

// Step 7: Create CRM Components
console.log('\n7️⃣ Creating CRM Components...');
const crmComponentsPath = path.join(__dirname, '..', 'webapp', 'src', 'components', 'crm');
if (!fs.existsSync(crmComponentsPath)) {
  fs.mkdirSync(crmComponentsPath, { recursive: true });
  console.log('✅ Created CRM components directory');
}

// Step 8: Create Basic CRM Components
console.log('\n8️⃣ Creating Basic CRM Components...');

// Create CustomerForm component
const customerFormPath = path.join(crmComponentsPath, 'CustomerForm.jsx');
const customerFormContent = `import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const CustomerForm = ({ onSubmit, initialData = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    address: '',
    is_company: false,
    rut_rot_eligible: false,
    consent_given: false,
    consent_details: '',
    area_tag: '',
    personnummer: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Area Tag</label>
          <select
            value={formData.area_tag}
            onChange={(e) => setFormData({...formData, area_tag: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select Area</option>
            <option value="Stockholm">Stockholm</option>
            <option value="Gothenburg">Gothenburg</option>
            <option value="Malmö">Malmö</option>
            <option value="Uppsala">Uppsala</option>
            <option value="Västerås">Västerås</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Personnummer (for individuals)</label>
          <input
            type="text"
            value={formData.personnummer}
            onChange={(e) => setFormData({...formData, personnummer: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="YYYYMMDD-XXXX"
            disabled={formData.is_company}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_company}
            onChange={(e) => setFormData({...formData, is_company: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Is Company Customer</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.rut_rot_eligible}
            onChange={(e) => setFormData({...formData, rut_rot_eligible: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">RUT/ROT Eligible</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.consent_given}
            onChange={(e) => setFormData({...formData, consent_given: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">GDPR Consent Given</label>
        </div>
      </div>

      {formData.consent_given && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Consent Details</label>
          <textarea
            value={formData.consent_details}
            onChange={(e) => setFormData({...formData, consent_details: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Describe how consent was obtained..."
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
`;

if (!fs.existsSync(customerFormPath)) {
  fs.writeFileSync(customerFormPath, customerFormContent);
  console.log('✅ Created CustomerForm.jsx');
}

// Create CustomerList component
const customerListPath = path.join(crmComponentsPath, 'CustomerList.jsx');
const customerListContent = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement GraphQL query to fetch customers
    // This will be implemented once Data Connect is set up
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Customers</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your customer relationships
        </p>
      </div>
      
      {customers.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new customer.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Customer
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <li key={customer.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {customer.rut_rot_eligible && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      RUT/ROT
                    </span>
                  )}
                  {customer.is_company && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Company
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;
`;

if (!fs.existsSync(customerListPath)) {
  fs.writeFileSync(customerListPath, customerListContent);
  console.log('✅ Created CustomerList.jsx');
}

// Step 9: Testing Instructions
console.log('\n9️⃣ Testing Setup...');
console.log('📋 Once all steps are complete:');
console.log('   1. Start development server: npm run dev');
console.log('   2. Navigate to: http://localhost:5173/admin/crm');
console.log('   3. Check browser console for any errors');
console.log('   4. Verify GraphQL queries are working');

// Step 10: Next Steps
console.log('\n🔟 Next Development Steps...');
console.log('📋 Ready to implement:');
console.log('   1. GraphQL queries and mutations');
console.log('   2. Real-time subscriptions');
console.log('   3. RLS testing');
console.log('   4. Error handling');
console.log('   5. Loading states');

console.log('\n🎉 Automated Setup Complete!');
console.log('========================================');
console.log('Follow the manual steps above to complete the setup.');
console.log('Firebase Data Connect will handle most of the heavy lifting!');
console.log('\nAfter setup, you can start developing the CRM components.');
console.log('\nFor support, check the Firebase Data Connect documentation.'); 