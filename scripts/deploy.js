#!/usr/bin/env node

/**
 * SwedPrime SaaS - Deployment Script
 * 
 * This script handles manual deployments to different environments
 * with proper validation, building, and health checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function execCommand(command, options = {}) {
  try {
    log(`🔧 Running: ${command}`, 'cyan');
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: options.cwd || process.cwd(),
      ...options 
    });
    return result;
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    throw error;
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log('✅ Firebase CLI found', 'green');
  } catch (error) {
    log('❌ Firebase CLI not found. Install with: npm install -g firebase-tools', 'red');
    process.exit(1);
  }

  // Check if user is logged in to Firebase
  try {
    execSync('firebase list --token $(firebase login:list --json | jq -r ".[0].localId" 2>/dev/null || echo "")', { stdio: 'pipe' });
    log('✅ Firebase authentication verified', 'green');
  } catch (error) {
    log('❌ Not logged in to Firebase. Run: firebase login', 'red');
    process.exit(1);
  }

  // Check if webapp directory exists
  if (!fs.existsSync('webapp')) {
    log('❌ webapp directory not found', 'red');
    process.exit(1);
  }

  // Check if functions directory exists
  if (!fs.existsSync('functions')) {
    log('❌ functions directory not found', 'red');
    process.exit(1);
  }

  log('✅ All prerequisites met', 'green');
}

function buildWebapp() {
  log('🏗️ Building webapp...', 'blue');
  
  const webappDir = path.join(process.cwd(), 'webapp');
  
  // Install dependencies
  execCommand('npm ci', { cwd: webappDir });
  
  // Run linting
  try {
    execCommand('npm run lint', { cwd: webappDir });
    log('✅ Linting passed', 'green');
  } catch (error) {
    log('⚠️ Linting failed but continuing...', 'yellow');
  }
  
  // Build the application
  execCommand('npm run build', { cwd: webappDir });
  
  // Check if dist directory was created
  const distDir = path.join(webappDir, 'dist');
  if (!fs.existsSync(distDir)) {
    log('❌ Build failed - dist directory not found', 'red');
    process.exit(1);
  }
  
  log('✅ Webapp build completed', 'green');
}

function prepareFunctions() {
  log('⚙️ Preparing functions...', 'blue');
  
  const functionsDir = path.join(process.cwd(), 'functions');
  
  // Install dependencies
  execCommand('npm ci', { cwd: functionsDir });
  
  // Run linting
  try {
    execCommand('npm run lint', { cwd: functionsDir });
    log('✅ Functions linting passed', 'green');
  } catch (error) {
    log('⚠️ Functions linting failed but continuing...', 'yellow');
  }
  
  log('✅ Functions prepared', 'green');
}

async function selectEnvironment() {
  log('\n🎯 Select deployment environment:', 'blue');
  log('1. 🧪 Staging (staging environment)');
  log('2. 🚀 Production (live environment)');
  log('3. 🏠 Local (preview only)');
  
  const choice = await prompt('\nEnter your choice (1-3): ');
  
  switch (choice) {
    case '1':
      return 'staging';
    case '2':
      return 'production';
    case '3':
      return 'local';
    default:
      log('❌ Invalid choice', 'red');
      return await selectEnvironment();
  }
}

async function confirmDeployment(environment) {
  if (environment === 'production') {
    log('\n⚠️  WARNING: You are about to deploy to PRODUCTION!', 'yellow');
    log('This will affect live users and cannot be easily undone.', 'yellow');
    
    const confirm = await prompt('Type "DEPLOY" to confirm production deployment: ');
    if (confirm !== 'DEPLOY') {
      log('❌ Deployment cancelled', 'red');
      process.exit(0);
    }
  }
  
  return true;
}

function deployToFirebase(environment) {
  log(`🚀 Deploying to ${environment}...`, 'blue');
  
  try {
    // Switch to the correct Firebase project
    if (environment !== 'local') {
      execCommand(`firebase use ${environment}`);
    }
    
    if (environment === 'local') {
      // Local preview
      log('🏠 Starting local preview...', 'blue');
      log('Press Ctrl+C to stop the preview', 'yellow');
      execCommand('firebase serve --only hosting');
    } else {
      // Deploy to Firebase
      const deployCommand = environment === 'staging' 
        ? 'firebase deploy --only hosting,firestore:rules'
        : 'firebase deploy';
      
      execCommand(deployCommand);
      
      log(`✅ Deployment to ${environment} completed!`, 'green');
    }
  } catch (error) {
    log(`❌ Deployment to ${environment} failed`, 'red');
    throw error;
  }
}

async function performHealthCheck(environment) {
  if (environment === 'local') {
    log('⏭️ Skipping health check for local deployment', 'yellow');
    return;
  }
  
  log('🏥 Performing health check...', 'blue');
  
  try {
    // Get the Firebase project info to construct the URL
    const projectId = execSync(`firebase use --current`, { encoding: 'utf8' }).trim();
    const healthUrl = `https://${projectId}.web.app/api/health`;
    
    // Wait a bit for deployment to propagate
    log('⏳ Waiting for deployment to propagate...', 'cyan');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Perform health check
    execCommand(`curl -f ${healthUrl} || exit 1`);
    
    log('✅ Health check passed!', 'green');
    log(`🌐 Your app is live at: https://${projectId}.web.app`, 'bright');
    
  } catch (error) {
    log('❌ Health check failed', 'red');
    log('The deployment completed but the app may not be responding correctly', 'yellow');
    throw error;
  }
}

function showPostDeploymentInfo(environment) {
  if (environment === 'local') return;
  
  const projectId = execSync(`firebase use --current`, { encoding: 'utf8' }).trim();
  const baseUrl = `https://${projectId}.web.app`;
  
  log('\n🎉 Deployment Summary:', 'green');
  log('=====================================', 'green');
  log(`📍 Environment: ${environment.toUpperCase()}`, 'bright');
  log(`🌐 Main URL: ${baseUrl}`, 'cyan');
  log(`📊 Admin: ${baseUrl}/admin/demo-company`, 'cyan');
  log(`💳 Pricing: ${baseUrl}/pricing`, 'cyan');
  log(`📝 Booking: ${baseUrl}/booking/demo-company`, 'cyan');
  log(`🏥 Health: ${baseUrl}/api/health`, 'cyan');
  
  log('\n📋 Next Steps:', 'blue');
  log('- Test key functionality on the live site');
  log('- Monitor Firebase Console for any errors');
  log('- Check Stripe webhook delivery in Stripe Dashboard');
  log('- Verify Firestore security rules are working');
  
  if (environment === 'production') {
    log('\n🔔 Production Checklist:', 'yellow');
    log('- Update DNS records if using custom domain');
    log('- Monitor application performance and errors');
    log('- Verify SSL certificates are valid');
    log('- Test payment flow with real cards (if applicable)');
  }
}

async function main() {
  try {
    log('🚀 SwedPrime SaaS Deployment Script', 'bright');
    log('=====================================\n', 'bright');
    
    // Check prerequisites
    checkPrerequisites();
    
    // Select environment
    const environment = await selectEnvironment();
    
    // Confirm deployment for production
    await confirmDeployment(environment);
    
    // Build and prepare
    buildWebapp();
    prepareFunctions();
    
    // Deploy
    deployToFirebase(environment);
    
    // Health check (except for local)
    if (environment !== 'local') {
      await performHealthCheck(environment);
      showPostDeploymentInfo(environment);
    }
    
    log('\n🎉 Deployment completed successfully!', 'green');
    
  } catch (error) {
    log('\n❌ Deployment failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('SwedPrime SaaS Deployment Script', 'bright');
  log('Usage: node scripts/deploy.js [options]', 'cyan');
  log('\nOptions:');
  log('  --help, -h     Show this help message');
  log('  --staging      Deploy directly to staging');
  log('  --production   Deploy directly to production (with confirmation)');
  log('  --local        Start local preview');
  log('\nInteractive mode will be used if no environment is specified.');
  process.exit(0);
}

// Direct environment selection via CLI args
if (args.includes('--staging')) {
  process.env.DEPLOY_ENV = 'staging';
} else if (args.includes('--production')) {
  process.env.DEPLOY_ENV = 'production';
} else if (args.includes('--local')) {
  process.env.DEPLOY_ENV = 'local';
}

// Run the deployment
if (require.main === module) {
  main().catch((error) => {
    log(`❌ Deployment script failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main }; 