#!/usr/bin/env node

/**
 * Firebase Data Connect Setup Script
 * This script guides you through setting up Firebase Data Connect for your CRM
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase Data Connect Setup Guide');
console.log('=====================================\n');

// Step 1: Check Firebase CLI
console.log('1️⃣ Checking Firebase CLI...');
try {
  const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Firebase CLI version: ${firebaseVersion}`);
} catch (error) {
  console.log('❌ Firebase CLI not found. Please install it first:');
  console.log('   npm install -g firebase-tools');
  console.log('   firebase login');
  process.exit(1);
}

// Step 2: Check current project
console.log('\n2️⃣ Checking current Firebase project...');
try {
  const projectInfo = execSync('firebase projects:list', { encoding: 'utf8' });
  console.log('✅ Firebase projects available:');
  console.log(projectInfo);
} catch (error) {
  console.log('❌ Error listing projects. Please run: firebase login');
  process.exit(1);
}

// Step 3: Enable Data Connect
console.log('\n3️⃣ Enabling Firebase Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. Go to Firebase Console: https://console.firebase.google.com');
console.log('   2. Select your project: swed-de2a3');
console.log('   3. Navigate to "Data Connect" in the left sidebar');
console.log('   4. Click "Get Started" or "Enable Data Connect"');
console.log('   5. Set up billing if prompted');

// Step 4: Set up Google Cloud SQL
console.log('\n4️⃣ Setting up Google Cloud SQL...');
console.log('📋 Manual steps required:');
console.log('   1. Go to Google Cloud Console: https://console.cloud.google.com');
console.log('   2. Select your project: swed-de2a3');
console.log('   3. Navigate to "SQL" in the left sidebar');
console.log('   4. Click "Create Instance"');
console.log('   5. Choose "PostgreSQL"');
console.log('   6. Configure settings:');
console.log('      - Instance ID: reniska-crm-db');
console.log('      - Password: (generate a strong password)');
console.log('      - Region: europe-west1 (closest to Sweden)');
console.log('      - Machine type: db-f1-micro (free tier)');
console.log('      - Storage: 10 GB');
console.log('   7. Click "Create"');

// Step 5: Run Schema Script
console.log('\n5️⃣ Database Schema Setup...');
const schemaPath = path.join(__dirname, 'data-connect-schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Schema script found: scripts/data-connect-schema.sql');
  console.log('📋 Next steps:');
  console.log('   1. Go to Google Cloud SQL Console');
  console.log('   2. Click on your PostgreSQL instance');
  console.log('   3. Go to "Databases" tab');
  console.log('   4. Click "Create Database"');
  console.log('   5. Name: reniska_crm');
  console.log('   6. Go to "SQL" tab');
  console.log('   7. Copy and paste the contents of scripts/data-connect-schema.sql');
  console.log('   8. Click "Run"');
} else {
  console.log('❌ Schema script not found');
}

// Step 6: Configure Data Connect
console.log('\n6️⃣ Configure Firebase Data Connect...');
console.log('📋 Manual steps required:');
console.log('   1. Go back to Firebase Console > Data Connect');
console.log('   2. Click "Add Data Source"');
console.log('   3. Select "PostgreSQL"');
console.log('   4. Enter connection details:');
console.log('      - Host: (from Google Cloud SQL)');
console.log('      - Port: 5432');
console.log('      - Database: reniska_crm');
console.log('      - Username: postgres');
console.log('      - Password: (the one you set)');
console.log('   5. Test connection');
console.log('   6. Click "Add"');

// Step 7: Generate GraphQL Schema
console.log('\n7️⃣ Generate GraphQL Schema...');
console.log('📋 Manual steps required:');
console.log('   1. In Firebase Data Connect, click "Generate Schema"');
console.log('   2. Review the generated GraphQL schema');
console.log('   3. Click "Deploy Schema"');

// Step 8: Update Environment Variables
console.log('\n8️⃣ Update Environment Variables...');
const envPath = path.join(__dirname, '..', 'webapp', '.env.local');
const envContent = `# Firebase Data Connect Configuration
VITE_FIREBASE_PROJECT_ID=swed-de2a3
VITE_DATA_CONNECT_ENDPOINT=https://api.firebase.com/v1/projects/swed-de2a3/dataConnect/graphql

# Add your Data Connect API key here once generated
# VITE_DATA_CONNECT_API_KEY=your_api_key_here
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with Data Connect configuration');
} else {
  console.log('✅ .env.local file already exists');
  console.log('📋 Add these variables to your .env.local file:');
  console.log(envContent);
}

// Step 9: Test the Setup
console.log('\n9️⃣ Testing Setup...');
console.log('📋 Once all steps are complete:');
console.log('   1. Start your development server: npm run dev');
console.log('   2. Navigate to: http://localhost:5173/admin/:companyId/crm-data');
console.log('   3. Check browser console for any errors');
console.log('   4. Verify GraphQL queries are working');

// Step 10: Next Steps
console.log('\n🔮 Next Steps for AI Integration...');
console.log('📋 Future AI features you can add:');
console.log('   - Customer behavior analysis');
console.log('   - Lead scoring automation');
console.log('   - Sales forecasting');
console.log('   - Chatbot integration');
console.log('   - Email automation');
console.log('   - Predictive analytics');

// Step 11: Troubleshooting
console.log('\n🔧 Troubleshooting...');
console.log('📋 Common issues and solutions:');
console.log('   - Connection errors: Check firewall rules in Google Cloud SQL');
console.log('   - Authentication errors: Verify Firebase token generation');
console.log('   - Schema errors: Check PostgreSQL syntax in schema script');
console.log('   - CORS errors: Configure allowed origins in Data Connect');

console.log('\n🎉 Setup Complete!');
console.log('=====================================');
console.log('Your Firebase Data Connect CRM is ready for development!');
console.log('Navigate to /admin/:companyId/crm-data to see your new CRM.');
console.log('\nFor support, check the Firebase Data Connect documentation.'); 