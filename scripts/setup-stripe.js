#!/usr/bin/env node

/**
 * SwedPrime SaaS - Stripe Configuration Setup
 * 
 * This script helps configure Stripe environment variables for Firebase Functions.
 * Run this script after setting up your Stripe account and creating products/prices.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🚀 SwedPrime SaaS - Stripe Configuration Setup
===============================================

This script will help you configure Stripe environment variables for your Firebase Functions.

Before running this script, make sure you have:
1. Created a Stripe account
2. Created products and prices in your Stripe Dashboard
3. Installed the Firebase CLI (npm install -g firebase-tools)
4. Logged in to Firebase (firebase login)

Let's get started!
`);

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupStripeConfig() {
  try {
    console.log('\n📝 Stripe Configuration');
    console.log('========================\n');

    // Get Stripe secret key
    const secretKey = await prompt('Enter your Stripe Secret Key (sk_test_... or sk_live_...): ');
    if (!secretKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe secret key format');
    }

    // Get webhook secret
    console.log('\nFor webhook secret, you can:');
    console.log('1. Use Stripe CLI: stripe listen --forward-to http://localhost:5001/your-project/us-central1/handleStripeWebhook');
    console.log('2. Create an endpoint in Stripe Dashboard: https://dashboard.stripe.com/webhooks');
    
    const webhookSecret = await prompt('Enter your Stripe Webhook Secret (whsec_...): ');
    if (!webhookSecret.startsWith('whsec_')) {
      throw new Error('Invalid webhook secret format');
    }

    // Get price IDs
    console.log('\n💰 Product Prices');
    console.log('=================\n');
    console.log('You need to create three products in your Stripe Dashboard with monthly prices:');
    console.log('1. Basic Plan (recommended: 99 SEK/month)');
    console.log('2. Standard Plan (recommended: 199 SEK/month)');
    console.log('3. Premium Plan (recommended: 399 SEK/month)');
    
    const basicPriceId = await prompt('Enter Basic Plan Price ID (price_...): ');
    const standardPriceId = await prompt('Enter Standard Plan Price ID (price_...): ');
    const premiumPriceId = await prompt('Enter Premium Plan Price ID (price_...): ');

    // Get app URL
    const appUrl = await prompt('Enter your app URL (e.g., https://your-app.web.app or http://localhost:5173 for dev): ');

    console.log('\n🔧 Setting Firebase Functions configuration...\n');

    // Set environment variables using Firebase CLI
    const configs = [
      `stripe.secret_key="${secretKey}"`,
      `stripe.webhook_secret="${webhookSecret}"`,
      `stripe.basic_price_id="${basicPriceId}"`,
      `stripe.standard_price_id="${standardPriceId}"`,
      `stripe.premium_price_id="${premiumPriceId}"`,
      `app.url="${appUrl}"`
    ];

    // Set all configs at once
    const configCommand = `firebase functions:config:set ${configs.join(' ')}`;
    console.log('Running:', configCommand);
    
    execSync(configCommand, { stdio: 'inherit' });

    console.log('\n✅ Configuration set successfully!\n');

    // Show next steps
    console.log('🚀 Next Steps:');
    console.log('==============\n');
    console.log('1. Deploy your functions:');
    console.log('   firebase deploy --only functions\n');
    console.log('2. Set up webhook endpoint in Stripe Dashboard:');
    console.log(`   Endpoint URL: ${appUrl}/api/webhooks/stripe`);
    console.log('   Events to listen for:');
    console.log('   - checkout.session.completed');
    console.log('   - customer.subscription.created');
    console.log('   - customer.subscription.updated');
    console.log('   - customer.subscription.deleted');
    console.log('   - invoice.payment_succeeded');
    console.log('   - invoice.payment_failed');
    console.log('   - customer.subscription.trial_will_end\n');
    console.log('3. Test your integration:');
    console.log('   - Use Stripe test cards: 4242 4242 4242 4242');
    console.log('   - Test webhook events with Stripe CLI\n');
    console.log('4. For production:');
    console.log('   - Replace test keys with live keys');
    console.log('   - Update webhook endpoint to production URL');
    console.log('   - Test thoroughly before going live\n');

    console.log('📖 Documentation:');
    console.log('- Stripe Test Cards: https://stripe.com/docs/testing#cards');
    console.log('- Stripe CLI: https://stripe.com/docs/stripe-cli');
    console.log('- Firebase Functions: https://firebase.google.com/docs/functions\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('   npm install -g firebase-tools');
    console.error('   firebase login');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  checkFirebaseCLI();
  setupStripeConfig().catch((error) => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupStripeConfig }; 