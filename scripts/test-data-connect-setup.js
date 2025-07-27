#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Firebase Data Connect Setup...\n');

// Test 1: Check Apollo Client installation
console.log('1️⃣ Checking Apollo Client installation...');
const packageJsonPath = path.join(__dirname, '..', 'webapp', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasApollo = packageJson.dependencies && packageJson.dependencies['@apollo/client'];
  const hasGraphQL = packageJson.dependencies && packageJson.dependencies['graphql'];
  
  if (hasApollo && hasGraphQL) {
    console.log('✅ Apollo Client and GraphQL are installed');
  } else {
    console.log('❌ Missing dependencies. Run: npm install @apollo/client graphql');
  }
} else {
  console.log('❌ package.json not found');
}

// Test 2: Check Apollo Client configuration
console.log('\n2️⃣ Checking Apollo Client configuration...');
const apolloConfigPath = path.join(__dirname, '..', 'webapp', 'src', 'firebase', 'apollo-client.js');
if (fs.existsSync(apolloConfigPath)) {
  console.log('✅ Apollo Client configuration found');
  
  // Check if it exports apolloClient
  const apolloConfig = fs.readFileSync(apolloConfigPath, 'utf8');
  if (apolloConfig.includes('export const apolloClient')) {
    console.log('✅ apolloClient export found');
  } else {
    console.log('❌ apolloClient export not found');
  }
} else {
  console.log('❌ Apollo Client configuration not found');
}

// Test 3: Check DataConnectCRM component
console.log('\n3️⃣ Checking DataConnectCRM component...');
const crmComponentPath = path.join(__dirname, '..', 'webapp', 'src', 'crm', 'DataConnectCRM.jsx');
if (fs.existsSync(crmComponentPath)) {
  console.log('✅ DataConnectCRM component found');
  
  // Check if it uses GraphQL
  const crmComponent = fs.readFileSync(crmComponentPath, 'utf8');
  if (crmComponent.includes('useQuery') && crmComponent.includes('useMutation')) {
    console.log('✅ GraphQL hooks (useQuery, useMutation) found');
  } else {
    console.log('❌ GraphQL hooks not found');
  }
  
  if (crmComponent.includes('gql`')) {
    console.log('✅ GraphQL queries defined');
  } else {
    console.log('❌ GraphQL queries not found');
  }
} else {
  console.log('❌ DataConnectCRM component not found');
}

// Test 4: Check database schema
console.log('\n4️⃣ Checking database schema...');
const schemaPath = path.join(__dirname, 'data-connect-schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Database schema file found');
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const requiredTables = ['companies', 'users', 'customers', 'leads', 'deals', 'tasks', 'activities'];
  const missingTables = requiredTables.filter(table => !schema.includes(`CREATE TABLE ${table}`));
  
  if (missingTables.length === 0) {
    console.log('✅ All required tables defined in schema');
  } else {
    console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
  }
} else {
  console.log('❌ Database schema file not found');
}

// Test 5: Check App.jsx routing
console.log('\n5️⃣ Checking App.jsx routing...');
const appPath = path.join(__dirname, '..', 'webapp', 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
  console.log('✅ App.jsx found');
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('ApolloProvider')) {
    console.log('✅ ApolloProvider import found');
  } else {
    console.log('❌ ApolloProvider import not found');
  }
  
  if (appContent.includes('crm-data')) {
    console.log('✅ CRM data route found');
  } else {
    console.log('❌ CRM data route not found');
  }
  
  if (appContent.includes('DataConnectCRM')) {
    console.log('✅ DataConnectCRM component import found');
  } else {
    console.log('❌ DataConnectCRM component import not found');
  }
} else {
  console.log('❌ App.jsx not found');
}

// Test 6: Check environment configuration
console.log('\n6️⃣ Checking environment configuration...');
const envPath = path.join(__dirname, '..', 'webapp', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_DATA_CONNECT_ENDPOINT')) {
    console.log('✅ Data Connect endpoint configured');
  } else {
    console.log('❌ Data Connect endpoint not configured');
  }
} else {
  console.log('⚠️  .env.local file not found - you may need to create it');
}

// Test 7: Check setup documentation
console.log('\n7️⃣ Checking setup documentation...');
const setupGuidePath = path.join(__dirname, 'FIREBASE_DATA_CONNECT_SETUP.md');
if (fs.existsSync(setupGuidePath)) {
  console.log('✅ Setup guide found');
} else {
  console.log('❌ Setup guide not found');
}

// Summary
console.log('\n📋 Setup Summary:');
console.log('================');

const tests = [
  'Apollo Client installation',
  'Apollo Client configuration', 
  'DataConnectCRM component',
  'Database schema',
  'App.jsx routing',
  'Environment configuration',
  'Setup documentation'
];

console.log('\n🎯 Next Steps:');
console.log('1. Follow the setup guide: scripts/FIREBASE_DATA_CONNECT_SETUP.md');
console.log('2. Enable Firebase Data Connect in Firebase Console');
console.log('3. Create Google Cloud SQL PostgreSQL instance');
console.log('4. Run the database schema script');
console.log('5. Configure Data Connect data source');
console.log('6. Generate GraphQL schema');
console.log('7. Test your CRM at: http://localhost:5173/admin/:companyId/crm-data');

console.log('\n🚀 Your Firebase Data Connect CRM is ready for setup!');
console.log('Follow the guide to complete the configuration.'); 