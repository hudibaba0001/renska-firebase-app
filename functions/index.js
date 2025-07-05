/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with secret key from Firebase config
const functions = require('firebase-functions');

// Initialize Stripe with configuration
const stripeConfig = functions.config().stripe || {};
const stripe = require('stripe')(stripeConfig.secret_key || 'sk_test_dummy_key');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * SwedPrime SaaS Platform - Firebase Cloud Functions
 * Handles Stripe webhooks for subscription billing management
 */

/**
 * Stripe Webhook Handler
 * Handles all subscription-related events from Stripe
 */
exports.handleStripeWebhook = onRequest({
  cors: true,
  timeoutSeconds: 60,
  memory: "256MiB"
}, async (req, res) => {
  logger.info("🔔 Stripe webhook received", { method: req.method, headers: req.headers });

  // Only accept POST requests
  if (req.method !== 'POST') {
    logger.warn("❌ Invalid request method", { method: req.method });
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = stripeConfig.webhook_secret;
  
  if (!webhookSecret) {
    logger.error("❌ Stripe webhook secret not configured");
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    logger.info("✅ Webhook signature verified", { eventType: event.type, eventId: event.id });
  } catch (err) {
    logger.error("❌ Webhook signature verification failed", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      default:
        logger.info("🤷 Unhandled event type", { eventType: event.type });
    }

    // Return success response
    res.status(200).json({ received: true, eventType: event.type });

  } catch (error) {
    logger.error("❌ Error processing webhook", { 
      error: error.message, 
      eventType: event.type,
      eventId: event.id 
    });
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session) {
  logger.info("💰 Processing checkout completion", { sessionId: session.id });

  const companyId = session.metadata && session.metadata.companyId;
  const planId = session.metadata && session.metadata.planId;

  if (!companyId) {
    logger.error("❌ No companyId in session metadata", { sessionId: session.id });
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customer = await stripe.customers.retrieve(session.customer);

    // Update company record
    await db.collection('companies').doc(companyId).set({
      subscription: {
        active: true,
        status: subscription.status,
        plan: planId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }, { merge: true });

    logger.info("✅ Company subscription activated", { 
      companyId, 
      plan: planId,
      subscriptionId: subscription.id 
    });

    // TODO: Send welcome email to customer
    // await sendWelcomeEmail(customer.email, companyId, planId);

  } catch (error) {
    logger.error("❌ Error handling checkout completion", { 
      error: error.message, 
      companyId, 
      sessionId: session.id 
    });
    throw error;
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  logger.info("🆕 Processing subscription creation", { subscriptionId: subscription.id });

  try {
    // Find company by customer ID
    const companiesRef = db.collection('companies');
    const query = companiesRef.where('subscription.stripeCustomerId', '==', subscription.customer);
    const snapshot = await query.get();

    if (snapshot.empty) {
      logger.warn("⚠️ No company found for customer", { customerId: subscription.customer });
      return;
    }

    // Update all matching companies (should be only one)
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        'subscription.status': subscription.status,
        'subscription.active': subscription.status === 'active',
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    logger.info("✅ Subscription creation processed", { subscriptionId: subscription.id });

  } catch (error) {
    logger.error("❌ Error handling subscription creation", { 
      error: error.message, 
      subscriptionId: subscription.id 
    });
    throw error;
  }
}

/**
 * Handle subscription updates (plan changes, etc.)
 */
async function handleSubscriptionUpdated(subscription) {
  logger.info("🔄 Processing subscription update", { subscriptionId: subscription.id });

  try {
    // Find company by subscription ID
    const companiesRef = db.collection('companies');
    const query = companiesRef.where('subscription.stripeSubscriptionId', '==', subscription.id);
    const snapshot = await query.get();

    if (snapshot.empty) {
      logger.warn("⚠️ No company found for subscription", { subscriptionId: subscription.id });
      return;
    }

    // Get the new price ID to determine plan
    const priceId = subscription.items.data[0] && subscription.items.data[0].price && subscription.items.data[0].price.id;
    let planId = 'basic'; // default

    // Map price ID to plan ID (you'll need to maintain this mapping)
    const priceToplanMapping = {
      // Add your actual Stripe price IDs here
      'price_basic_monthly': 'basic',
      'price_standard_monthly': 'standard',
      'price_premium_monthly': 'premium'
    };
    
    if (priceToplanMapping[priceId]) {
      planId = priceToplanMapping[priceId];
    }

    // Update all matching companies
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        'subscription.status': subscription.status,
        'subscription.active': subscription.status === 'active',
        'subscription.plan': planId,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    logger.info("✅ Subscription update processed", { 
      subscriptionId: subscription.id, 
      newPlan: planId,
      status: subscription.status 
    });

  } catch (error) {
    logger.error("❌ Error handling subscription update", { 
      error: error.message, 
      subscriptionId: subscription.id 
    });
    throw error;
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  logger.info("🗑️ Processing subscription deletion", { subscriptionId: subscription.id });

  try {
    // Find company by subscription ID
    const companiesRef = db.collection('companies');
    const query = companiesRef.where('subscription.stripeSubscriptionId', '==', subscription.id);
    const snapshot = await query.get();

    if (snapshot.empty) {
      logger.warn("⚠️ No company found for subscription", { subscriptionId: subscription.id });
      return;
    }

    // Deactivate subscription for all matching companies
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        'subscription.active': false,
        'subscription.status': 'canceled',
        'subscription.canceledAt': admin.firestore.FieldValue.serverTimestamp(),
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    logger.info("✅ Subscription deletion processed", { subscriptionId: subscription.id });

    // TODO: Send cancellation confirmation email
    // TODO: Schedule data retention according to your policy

  } catch (error) {
    logger.error("❌ Error handling subscription deletion", { 
      error: error.message, 
      subscriptionId: subscription.id 
    });
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  logger.info("💳 Processing successful payment", { invoiceId: invoice.id });

  try {
    if (invoice.subscription) {
      // Find company by subscription ID
      const companiesRef = db.collection('companies');
      const query = companiesRef.where('subscription.stripeSubscriptionId', '==', invoice.subscription);
      const snapshot = await query.get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.update(doc.ref, {
            'subscription.active': true,
            'subscription.status': 'active',
            'subscription.lastPaymentAt': admin.firestore.FieldValue.serverTimestamp(),
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();
        logger.info("✅ Payment success processed", { invoiceId: invoice.id });
      }
    }

    // TODO: Send payment receipt email
    // TODO: Log payment for accounting

  } catch (error) {
    logger.error("❌ Error handling payment success", { 
      error: error.message, 
      invoiceId: invoice.id 
    });
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  logger.info("⚠️ Processing failed payment", { invoiceId: invoice.id });

  try {
    if (invoice.subscription) {
      // Find company by subscription ID
      const companiesRef = db.collection('companies');
      const query = companiesRef.where('subscription.stripeSubscriptionId', '==', invoice.subscription);
      const snapshot = await query.get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.update(doc.ref, {
            'subscription.status': 'past_due',
            'subscription.lastPaymentFailedAt': admin.firestore.FieldValue.serverTimestamp(),
            'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();
        logger.info("✅ Payment failure processed", { invoiceId: invoice.id });
      }
    }

    // TODO: Send payment failure notification email
    // TODO: Implement grace period logic

  } catch (error) {
    logger.error("❌ Error handling payment failure", { 
      error: error.message, 
      invoiceId: invoice.id 
    });
    throw error;
  }
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription) {
  logger.info("⏰ Processing trial ending notification", { subscriptionId: subscription.id });

  try {
    // Find company by subscription ID
    const companiesRef = db.collection('companies');
    const query = companiesRef.where('subscription.stripeSubscriptionId', '==', subscription.id);
    const snapshot = await query.get();

    if (!snapshot.empty) {
      // TODO: Send trial ending notification email
      // TODO: Show in-app notifications
      logger.info("✅ Trial ending notification processed", { subscriptionId: subscription.id });
    }

  } catch (error) {
    logger.error("❌ Error handling trial ending", { 
      error: error.message, 
      subscriptionId: subscription.id 
    });
    throw error;
  }
}

/**
 * Create Stripe Checkout Session (Callable Function)
 * Called from the frontend to initiate checkout
 */
exports.createCheckoutSession = onCall({
  cors: true,
  timeoutSeconds: 30,
  memory: "256MiB"
}, async (request) => {
  const { planId, companyId, successUrl, cancelUrl } = request.data;

  logger.info("🛒 Creating checkout session", { planId, companyId });

  try {
    // Validate input
    if (!planId || !companyId) {
      throw new Error('Missing required parameters: planId and companyId');
    }

    // Map plan to price ID (you'll need to set these in your environment)
    const planToPriceMapping = {
      'basic': process.env.STRIPE_BASIC_PRICE_ID,
      'standard': process.env.STRIPE_STANDARD_PRICE_ID,
      'premium': process.env.STRIPE_PREMIUM_PRICE_ID
    };

    const priceId = planToPriceMapping[planId];
    if (!priceId) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl || `${process.env.APP_URL}/admin/${companyId}/billing?success=true&plan=${planId}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/pricing`,
      metadata: {
        companyId,
        planId,
      },
      subscription_data: {
        trial_period_days: planId === 'basic' ? 14 : 7, // Basic gets longer trial
        metadata: {
          companyId,
          planId,
        }
      },
      allow_promotion_codes: true,
    });

    logger.info("✅ Checkout session created", { 
      sessionId: session.id, 
      planId, 
      companyId 
    });

    return { sessionId: session.id, url: session.url };

  } catch (error) {
    logger.error("❌ Error creating checkout session", { 
      error: error.message, 
      planId, 
      companyId 
    });
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
});

/**
 * Health check endpoint
 */
exports.healthCheck = onRequest((req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'swedprime-billing'
  });
});
