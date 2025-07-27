#!/usr/bin/env node

/**
 * Complete Firebase Data Connect Installation and Setup
 * This script will guide you through the entire process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Firebase Data Connect Installation & Setup');
console.log('=====================================================\n');

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

// Step 1: Install Google Cloud CLI
console.log('1️⃣ Installing Google Cloud CLI...');
console.log('📋 Manual installation required:');
console.log('   1. Download Google Cloud CLI from:');
console.log('      https://cloud.google.com/sdk/docs/install');
console.log('   2. For Windows:');
console.log('      - Download the installer');
console.log('      - Run as administrator');
console.log('      - Follow the installation wizard');
console.log('   3. After installation, restart your terminal');
console.log('   4. Run: gcloud auth login');
console.log('   5. Run: gcloud config set project swed-de2a3');

// Step 2: Enable Required APIs
console.log('\n2️⃣ Enabling Google Cloud APIs...');
console.log('📋 Once gcloud is installed, run these commands:');
console.log('   gcloud services enable sqladmin.googleapis.com');
console.log('   gcloud services enable firebase.googleapis.com');
console.log('   gcloud services enable cloudbuild.googleapis.com');

// Step 3: Create PostgreSQL Instance
console.log('\n3️⃣ Creating PostgreSQL Database Instance...');
console.log('📋 Run this command to create the database:');
console.log(`   gcloud sql instances create ${DB_INSTANCE_ID} \\`);
console.log(`     --database-version=POSTGRES_15 \\`);
console.log(`     --tier=db-f1-micro \\`);
console.log(`     --region=${REGION} \\`);
console.log(`     --storage-size=10GB \\`);
console.log(`     --storage-type=SSD \\`);
console.log(`     --backup-start-time=02:00 \\`);
console.log(`     --maintenance-window-day=SUN \\`);
console.log(`     --maintenance-window-hour=03:00 \\`);
console.log(`     --availability-type=zonal \\`);
console.log(`     --storage-auto-increase`);

// Step 4: Set Database Password
console.log('\n4️⃣ Setting Database Password...');
console.log('📋 Run this command (replace YOUR_PASSWORD with a strong password):');
console.log(`   gcloud sql users set-password postgres \\`);
console.log(`     --instance=${DB_INSTANCE_ID} \\`);
console.log(`     --password=YOUR_PASSWORD`);

// Step 5: Create Database
console.log('\n5️⃣ Creating Database...');
console.log('📋 Run this command:');
console.log(`   gcloud sql databases create ${DB_NAME} --instance=${DB_INSTANCE_ID}`);

// Step 6: Configure Network Access
console.log('\n6️⃣ Configuring Network Access...');
console.log('📋 Run this command to allow all IPs (for development):');
console.log(`   gcloud sql instances patch ${DB_INSTANCE_ID} \\`);
console.log(`     --authorized-networks=0.0.0.0/0`);

// Step 7: Get Connection Details
console.log('\n7️⃣ Getting Connection Details...');
console.log('📋 Run this command to get the connection info:');
console.log(`   gcloud sql instances describe ${DB_INSTANCE_ID} --format="value(connectionName)"`);

// Step 8: Run Schema Script
console.log('\n8️⃣ Running Database Schema...');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.cloud.google.com/sql');
console.log(`   2. Click on instance: ${DB_INSTANCE_ID}`);
console.log('   3. Go to "SQL" tab');
console.log('   4. Copy and paste the contents of:');
console.log(`      ${path.join(__dirname, 'data-connect-schema-phase1.sql')}`);
console.log('   5. Click "Run"');
console.log('   6. Verify all tables are created successfully');

// Step 9: Enable Firebase Data Connect
console.log('\n9️⃣ Enabling Firebase Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. Go to: https://console.firebase.google.com');
console.log(`   2. Select project: ${PROJECT_ID}`);
console.log('   3. Navigate to "Data Connect" in left sidebar');
console.log('   4. Click "Get Started"');
console.log('   5. Set up billing if prompted');
console.log('   6. Wait for service to be enabled');

// Step 10: Connect Data Source
console.log('\n🔟 Connecting PostgreSQL to Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect');
console.log('   2. Click "Add Data Source"');
console.log('   3. Select "PostgreSQL"');
console.log('   4. Enter connection details:');
console.log(`      - Host: ${DB_INSTANCE_ID}.${REGION}.cloudsql.googleapis.com`);
console.log('      - Port: 5432');
console.log(`      - Database: ${DB_NAME}`);
console.log('      - Username: postgres');
console.log('      - Password: (the one you set in step 4)');
console.log('   5. Test connection');
console.log('   6. Click "Add"');

// Step 11: Generate GraphQL Schema
console.log('\n1️⃣1️⃣ Generating GraphQL Schema...');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect');
console.log('   2. Click "Generate Schema"');
console.log('   3. Review the generated GraphQL schema');
console.log('   4. Verify all tables are included:');
console.log('      - companies');
console.log('      - users');
console.log('      - customers');
console.log('   5. Click "Deploy Schema"');

// Step 12: Update Environment Variables
console.log('\n1️⃣2️⃣ Updating Environment Configuration...');
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

// Step 13: Create CRM Components
console.log('\n1️⃣3️⃣ Creating CRM Components...');
const crmComponentsPath = path.join(__dirname, '..', 'webapp', 'src', 'components', 'crm');
if (!fs.existsSync(crmComponentsPath)) {
  fs.mkdirSync(crmComponentsPath, { recursive: true });
  console.log('✅ Created CRM components directory');
}

// Step 14: Verification Commands
console.log('\n1️⃣4️⃣ Verification Commands...');
console.log('📋 After completing all steps, run these to verify:');
console.log('   1. Check database connection:');
console.log(`      gcloud sql connect ${DB_INSTANCE_ID} --user=postgres --database=${DB_NAME}`);
console.log('   2. List tables:');
console.log('      \\dt');
console.log('   3. Check Firebase Data Connect status:');
console.log('      firebase projects:list');

console.log('\n🎉 Installation Guide Complete!');
console.log('=====================================================');
console.log('Follow the steps above to install and configure everything.');
console.log('Start with Step 1 (installing Google Cloud CLI).');
console.log('\nAfter installation, you can run the automated setup script.');
console.log('\nFor support, check the Google Cloud and Firebase documentation.'); 