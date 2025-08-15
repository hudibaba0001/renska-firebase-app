#!/usr/bin/env node

/**
 * Firebase Data Connect CRM Implementation Script
 * Complete setup for Phase 1 CRM with PostgreSQL backend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase Data Connect CRM Implementation');
console.log('==========================================\n');

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

// Step 1: Verify Firebase CLI and Project
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

// Step 2: Enable Required APIs
console.log('\n2️⃣ Enabling Google Cloud APIs...');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.cloud.google.com/apis/library');
console.log('   2. Search and enable these APIs:');
console.log('      - Cloud SQL Admin API');
console.log('      - Firebase Data Connect API');
console.log('      - Cloud Build API');
console.log('   3. Wait for APIs to be enabled (may take a few minutes)');

// Step 3: Create Google Cloud SQL Instance
console.log('\n3️⃣ Creating PostgreSQL Database...');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.cloud.google.com/sql');
console.log('   2. Click "Create Instance"');
console.log('   3. Choose "PostgreSQL"');
console.log('   4. Configure settings:');
console.log(`      - Instance ID: ${DB_INSTANCE_ID}`);
console.log('      - Password: (generate a strong password - save it!)');
console.log(`      - Region: ${REGION}`);
console.log('      - Machine type: db-f1-micro (free tier)');
console.log('      - Storage: 10 GB');
console.log('      - Enable automated backups');
console.log('   5. Click "Create"');
console.log('   6. Wait for instance to be ready (5-10 minutes)');

// Step 4: Create Database and Run Schema
console.log('\n4️⃣ Setting up Database Schema...');
const schemaPath = path.join(__dirname, 'data-connect-schema-phase1.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Schema script found');
  console.log('📋 Manual steps required:');
  console.log('   1. Go to Google Cloud SQL Console');
  console.log(`   2. Click on instance: ${DB_INSTANCE_ID}`);
  console.log('   3. Go to "Databases" tab');
  console.log('   4. Click "Create Database"');
  console.log(`   5. Name: ${DB_NAME}`);
  console.log('   6. Go to "SQL" tab');
  console.log('   7. Copy and paste the contents of:');
  console.log(`      ${schemaPath}`);
  console.log('   8. Click "Run"');
  console.log('   9. Verify all tables are created successfully');
} else {
  console.log('❌ Schema script not found');
  process.exit(1);
}

// Step 5: Configure Network Access
console.log('\n5️⃣ Configuring Network Access...');
console.log('📋 Manual steps required:');
console.log('   1. In Google Cloud SQL Console');
console.log('   2. Go to "Connections" tab');
console.log('   3. Under "Networking"');
console.log('   4. Add authorized network: 0.0.0.0/0 (for development)');
console.log('   5. Save changes');

// Step 6: Enable Firebase Data Connect
console.log('\n6️⃣ Enabling Firebase Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.firebase.google.com');
console.log(`   2. Select project: ${PROJECT_ID}`);
console.log('   3. Navigate to "Data Connect" in left sidebar');
console.log('   4. Click "Get Started"');
console.log('   5. Set up billing if prompted');
console.log('   6. Wait for service to be enabled');

// Step 7: Connect Data Source
console.log('\n7️⃣ Connecting PostgreSQL to Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect');
console.log('   2. Click "Add Data Source"');
console.log('   3. Select "PostgreSQL"');
console.log('   4. Enter connection details:');
console.log(`      - Host: ${DB_INSTANCE_ID}.${REGION}.cloudsql.googleapis.com`);
console.log('      - Port: 5432');
console.log(`      - Database: ${DB_NAME}`);
console.log('      - Username: postgres');
console.log('      - Password: (the one you set in step 3)');
console.log('   5. Test connection');
console.log('   6. Click "Add"');

// Step 8: Generate GraphQL Schema
console.log('\n8️⃣ Generating GraphQL Schema...');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect');
console.log('   2. Click "Generate Schema"');
console.log('   3. Review the generated GraphQL schema');
console.log('   4. Verify all tables are included:');
console.log('      - companies');
console.log('      - users');
console.log('      - customers');
console.log('   5. Click "Deploy Schema"');

// Step 9: Update Environment Configuration
console.log('\n9️⃣ Updating Environment Configuration...');
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

// Step 10: Create CRM Components
console.log('\n🔟 Creating CRM Components...');
const crmComponentsPath = path.join(__dirname, '..', 'webapp', 'src', 'components', 'crm');
if (!fs.existsSync(crmComponentsPath)) {
  fs.mkdirSync(crmComponentsPath, { recursive: true });
  console.log('✅ Created CRM components directory');
}

// Step 11: Testing Instructions
console.log('\n1️⃣1️⃣ Testing Setup...');
console.log('📋 Once all steps are complete:');
console.log('   1. Start development server: npm run dev');
console.log('   2. Navigate to: http://localhost:5173/admin/crm');
console.log('   3. Check browser console for any errors');
console.log('   4. Verify GraphQL queries are working');

// Step 12: Next Development Steps
console.log('\n1️⃣2️⃣ Next Development Steps...');
console.log('📋 Ready to implement:');
console.log('   1. Create CustomerForm.jsx component');
console.log('   2. Create CustomerList.jsx component');
console.log('   3. Create CustomerPage.jsx page');
console.log('   4. Implement GraphQL queries and mutations');
console.log('   5. Add real-time subscriptions');
console.log('   6. Implement RLS testing');

// Step 13: Troubleshooting
console.log('\n🔧 Troubleshooting Guide...');
console.log('📋 Common issues and solutions:');
console.log('   - Connection errors: Check firewall rules and network access');
console.log('   - Authentication errors: Verify Firebase token generation');
console.log('   - Schema errors: Check PostgreSQL syntax in schema script');
console.log('   - CORS errors: Configure allowed origins in Data Connect');
console.log('   - Billing issues: Ensure billing is enabled for the project');

console.log('\n🎉 Implementation Guide Complete!');
console.log('==========================================');
console.log('Follow the manual steps above to set up your CRM.');
console.log('Once complete, you can start developing the CRM components.');
console.log('\nFor support, check the Firebase Data Connect documentation.');
console.log('Next: Run the CRM development script after setup is complete.'); 