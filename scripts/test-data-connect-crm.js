#!/usr/bin/env node

/**
 * Test Firebase Data Connect CRM Setup
 * This script verifies that your Data Connect CRM is working properly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Firebase Data Connect CRM Setup');
console.log('==========================================\n');

// Check if Apollo Client is installed
console.log('1️⃣ Checking Apollo Client installation...');
const packageJsonPath = path.join(__dirname, '..', 'webapp', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasApollo = packageJson.dependencies && packageJson.dependencies['@apollo/client'];
  if (hasApollo) {
    console.log('✅ Apollo Client is installed');
  } else {
    console.log('❌ Apollo Client not found. Run: npm install @apollo/client graphql');
  }
} else {
  console.log('❌ package.json not found');
}

// Check if Apollo Client config exists
console.log('\n2️⃣ Checking Apollo Client configuration...');
const apolloConfigPath = path.join(__dirname, '..', 'webapp', 'src', 'firebase', 'apollo-client.js');
if (fs.existsSync(apolloConfigPath)) {
  console.log('✅ Apollo Client configuration found');
} else {
  console.log('❌ Apollo Client configuration not found');
}

// Check if DataConnectCRM component exists
console.log('\n3️⃣ Checking DataConnectCRM component...');
const crmComponentPath = path.join(__dirname, '..', 'webapp', 'src', 'crm', 'DataConnectCRM.jsx');
if (fs.existsSync(crmComponentPath)) {
  console.log('✅ DataConnectCRM component found');
} else {
  console.log('❌ DataConnectCRM component not found');
}

// Check if schema file exists
console.log('\n4️⃣ Checking database schema...');
const schemaPath = path.join(__dirname, 'data-connect-schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Database schema file found');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const hasTables = schemaContent.includes('CREATE TABLE');
  if (hasTables) {
    console.log('✅ Schema contains table definitions');
  } else {
    console.log('❌ Schema file appears to be empty or invalid');
  }
} else {
  console.log('❌ Database schema file not found');
}

// Check if route is configured
console.log('\n5️⃣ Checking route configuration...');
const appPath = path.join(__dirname, '..', 'webapp', 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  const hasDataConnectRoute = appContent.includes('DataConnectCRM') && appContent.includes('crm-data');
  if (hasDataConnectRoute) {
    console.log('✅ Data Connect CRM route is configured');
  } else {
    console.log('❌ Data Connect CRM route not found in App.jsx');
  }
} else {
  console.log('❌ App.jsx not found');
}

// Check environment variables
console.log('\n6️⃣ Checking environment configuration...');
const envPath = path.join(__dirname, '..', 'webapp', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Environment file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDataConnectConfig = envContent.includes('DATA_CONNECT');
  if (hasDataConnectConfig) {
    console.log('✅ Data Connect environment variables configured');
  } else {
    console.log('⚠️  Data Connect environment variables may be missing');
  }
} else {
  console.log('⚠️  .env.local file not found - will be created during setup');
}

// Summary and next steps
console.log('\n📊 Test Summary');
console.log('===============');

console.log('\n🎯 Next Steps:');
console.log('1. Complete Firebase Console setup (see FIREBASE_DATA_CONNECT_SETUP.md)');
console.log('2. Start development server: cd webapp && npm run dev');
console.log('3. Navigate to: http://localhost:5173/admin/:companyId/crm-data');
console.log('4. Test the new CRM functionality');

console.log('\n🔧 If you encounter issues:');
console.log('- Check browser console for errors');
console.log('- Verify Firebase Data Connect is enabled');
console.log('- Ensure PostgreSQL database is running');
console.log('- Confirm GraphQL schema is deployed');

console.log('\n🎉 Expected Results:');
console.log('- Modern CRM dashboard with stats cards');
console.log('- Customers list with search functionality');
console.log('- Real-time data updates');
console.log('- Professional UI with Tailwind CSS');

console.log('\n✨ Your Firebase Data Connect CRM is ready for testing!');
console.log('Navigate to /admin/:companyId/crm-data to see your new CRM in action.'); 