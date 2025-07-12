
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require('firebase-functions');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with secret key from Firebase config
const stripeConfig = functions.config().stripe;
if (!stripeConfig || !stripeConfig.secret_key || !stripeConfig.webhook_secret) {
    logger.error("Stripe configuration is missing. Ensure you have run 'firebase functions:config:set stripe.secret_key=YOUR_KEY stripe.webhook_secret=YOUR_SECRET'");
}

const stripe = require('stripe')(stripeConfig.secret_key);

setGlobalOptions({ maxInstances: 10, region: 'europe-west1' });

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


/**
 * Secure Company Signup Function
 * Allows public users to sign up a new company and admin user via a callable HTTPS function.
 * Performs input validation, duplicate checks, and writes to Firestore.
 */
exports.signupCompany = onCall({ timeoutSeconds: 30, memory: '256MiB' }, async (request) => {
  const {
    companyName,
    address,
    orgNumber,
    adminName,
    email,
    phone,
    password
  } = request.data || {};

  // Validation functions
  const isValidEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isValidPhone = (phone) => /^\+?[0-9\- ]{6,20}$/.test(phone);
  const isValidOrgNumber = (org) => /^[0-9A-Za-z\-]{4,20}$/.test(org);

  // Input validation checks
  if (!companyName || companyName.length < 2 || companyName.length > 100) throw new HttpsError('invalid-argument', 'Invalid company name.');
  if (!address || address.length < 3) throw new HttpsError('invalid-argument', 'Invalid address.');
  if (!orgNumber || !isValidOrgNumber(orgNumber)) throw new HttpsError('invalid-argument', 'Invalid organization number.');
  if (!adminName || adminName.length < 2) throw new HttpsError('invalid-argument', 'Invalid admin name.');
  if (!email || !isValidEmail(email)) throw new HttpsError('invalid-argument', 'Invalid email address.');
  if (!phone || !isValidPhone(phone)) throw new HttpsError('invalid-argument', 'Invalid phone number.');
  if (!password || password.length < 6) throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.');

  const companyId = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const companyRef = db.collection('companies').doc(companyId);

  // Firestore transaction for atomicity
  return db.runTransaction(async (transaction) => {
    const companySnap = await transaction.get(companyRef);
    if (companySnap.exists) {
      throw new HttpsError('already-exists', 'A company with this name already exists.');
    }

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: adminName,
        phoneNumber: phone.startsWith('+') ? phone : undefined
      });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'Email already in use.');
      }
      logger.error("Failed to create user", {error: err});
      throw new HttpsError('internal', 'Failed to create user.');
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Create company document
    transaction.set(companyRef, {
      companyName, address, orgNumber, adminName,
      adminEmail: email, adminPhone: phone, adminUid: userRecord.uid,
      created: timestamp, pricePerSqm: 0, services: [],
      frequencyMultiplier: {}, addOns: {}, windowCleaningPrices: {},
      zipAreas: [], rutEnabled: false, isPublic: false
    });

    // Create user profile document
    const userRef = db.collection('users').doc(userRecord.uid);
    transaction.set(userRef, {
      email, name: adminName, companyId, phone,
      created: timestamp, adminOf: companyId
    });
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { adminOf: companyId });

    return { success: true, companyId, adminUid: userRecord.uid };
  });
});

/**
 * Create Stripe Checkout Session (Callable Function)
 */
exports.createCheckoutSession = onCall({ cors: true, timeoutSeconds: 30, memory: "256MiB" }, async (request) => {
  const { planId, companyId, successUrl, cancelUrl } = request.data;
  logger.info("🛒 Creating checkout session", { planId, companyId });

  if (!planId || !companyId) {
    throw new HttpsError('invalid-argument', 'Missing required parameters: planId and companyId');
  }

  const appUrl = functions.config().app.url;
  if (!appUrl) {
    logger.error("App URL not configured");
    throw new HttpsError('internal', 'Application URL is not configured.');
  }

  const priceId = functions.config().stripe.price_ids[planId];
  if (!priceId) {
    logger.error(`Invalid plan: ${planId}`);
    throw new HttpsError('invalid-argument', `Invalid plan: ${planId}`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${appUrl}/admin/${companyId}/billing?success=true&plan=${planId}`,
      cancel_url: cancelUrl || `${appUrl}/pricing`,
      metadata: { companyId, planId },
      subscription_data: {
        trial_period_days: planId === 'basic' ? 14 : 7,
        metadata: { companyId, planId }
      },
      allow_promotion_codes: true,
    });

    logger.info("✅ Checkout session created", { sessionId: session.id, planId, companyId });
    return { sessionId: session.id, url: session.url };
  } catch (error) {
    logger.error("❌ Error creating checkout session", { error: error.message, planId, companyId });
    throw new HttpsError('internal', `Failed to create checkout session: ${error.message}`);
  }
});



// The following are Stripe webhook handlers. They are not exported as individual functions.
// Instead, you should have a single webhook endpoint that handles all events.

const handleWebhookEvent = async (event) => {
  const handlers = {
    'checkout.session.completed': handleCheckoutCompleted,
    'customer.subscription.created': handleSubscriptionEvent,
    'customer.subscription.updated': handleSubscriptionEvent,
    'customer.subscription.deleted': handleSubscriptionEvent,
    'invoice.payment_succeeded': handleInvoiceEvent,
    'invoice.payment_failed': handleInvoiceEvent,
    'customer.subscription.trial_will_end': handleTrialWillEnd,
  };

  const handler = handlers[event.type] || ((e) => logger.info(`🤷 Unhandled event type: ${e.type}`));
  await handler(event.data.object);
};

exports.handleStripeWebhook = onRequest({ timeoutSeconds: 60, memory: "256MiB" }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = stripeConfig.webhook_secret;

  if (!webhookSecret) {
    logger.error("❌ Stripe webhook secret not configured");
    return res.status(500).send('Webhook secret not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    logger.info("✅ Webhook signature verified", { eventType: event.type, eventId: event.id });
    
    await handleWebhookEvent(event);
    
    res.status(200).json({ received: true });
  } catch (err) {_
    logger.error("❌ Webhook error", { error: err.message });
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});


async function getCompanyRefBySubscription(subscriptionId) {
    const query = db.collection('companies').where('subscription.stripeSubscriptionId', '==', subscriptionId).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : snapshot.docs[0].ref;
}

async function getCompanyRefByCustomer(customerId) {
    const query = db.collection('companies').where('subscription.stripeCustomerId', '==', customerId).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : snapshot.docs[0].ref;
}

async function handleCheckoutCompleted(session) {
  const { companyId, planId } = session.metadata;
  if (!companyId) {
    logger.error("❌ No companyId in session metadata", { sessionId: session.id });
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const companyRef = db.collection('companies').doc(companyId);

  await companyRef.set({
    subscription: {
      active: true,
      status: subscription.status,
      plan: planId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, { merge: true });

  logger.info("✅ Company subscription activated", { companyId, plan: planId, subscriptionId: subscription.id });
}

async function handleSubscriptionEvent(subscription) {
    const companyRef = await getCompanyRefBySubscription(subscription.id) || await getCompanyRefByCustomer(subscription.customer);
    if (!companyRef) {
        logger.warn("⚠️ No company found for subscription", { subscriptionId: subscription.id, customerId: subscription.customer });
        return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    const priceToPlanMapping = {
      'price_basic_monthly': 'basic',
      'price_standard_monthly': 'standard',
      'price_premium_monthly': 'premium'
    };
    const planId = priceToPlanMapping[priceId] || 'basic';

    const status = subscription.status;
    const isCancelled = subscription.cancel_at_period_end || status === 'canceled';

    await companyRef.update({
        'subscription.status': status,
        'subscription.active': status === 'active' || status === 'trialing',
        'subscription.plan': planId,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': isCancelled,
        'subscription.canceledAt': isCancelled ? admin.firestore.FieldValue.serverTimestamp() : null,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`✅ Subscription event '${subscription.status}' processed`, { companyId: companyRef.id, subscriptionId: subscription.id });
}

async function handleInvoiceEvent(invoice) {
    if (!invoice.subscription) return;
    const companyRef = await getCompanyRefBySubscription(invoice.subscription);
    if (!companyRef) return;
    
    const updateData = {
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (invoice.payment_succeeded) {
        updateData['subscription.lastPaymentAt'] = admin.firestore.FieldValue.serverTimestamp();
        updateData['subscription.status'] = 'active'; // Ensure status is active
    } else if (invoice.payment_failed) {
        updateData['subscription.lastPaymentFailedAt'] = admin.firestore.FieldValue.serverTimestamp();
        updateData['subscription.status'] = 'past_due';
    }

    await companyRef.update(updateData);
    logger.info(`✅ Invoice event processed`, { companyId: companyRef.id, invoiceId: invoice.id });
}

async function handleTrialWillEnd(subscription) {
  const companyRef = await getCompanyRefBySubscription(subscription.id);
  if (companyRef) {
    logger.info("⏰ Trial ending notification processed", { companyId: companyRef.id, subscriptionId: subscription.id });
    // TODO: Send trial ending notification email or in-app message
  }
}
