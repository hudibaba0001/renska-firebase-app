
const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require('firebase-functions');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Set global options
setGlobalOptions({ region: "europe-west1" });

// Helper function to safely get Stripe config and initialize Stripe
const getStripeInstance = () => {
    try {
        const stripeConfig = functions.config().stripe;
        if (!stripeConfig || !stripeConfig.secret_key) {
            throw new Error("Stripe secret key is missing in Firebase environment config.");
        }
        return require('stripe')(stripeConfig.secret_key);
    } catch (err) {
        logger.error("Stripe initialization failed", { error: err.message });
        return null;
    }
};


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
 */
exports.signupCompany = onCall({ timeoutSeconds: 30, memory: '256MiB', enforceAppCheck: true }, async (request) => {
  const {
    companyName,
    address,
    orgNumber,
    adminName,
    email,
    phone,
    password
  } = request.data || {};

  // Validation
  if (!companyName || companyName.length < 2) throw new HttpsError('invalid-argument', 'Invalid company name.');
  if (!email) throw new HttpsError('invalid-argument', 'Invalid email address.');
  if (!password || password.length < 6) throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.');

  const companyId = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const companyRef = db.collection('companies').doc(companyId);

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
        phoneNumber: phone && phone.startsWith('+') ? phone : undefined
      });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'Email already in use.');
      }
      logger.error("Failed to create user", {error: err});
      throw new HttpsError('internal', 'Failed to create user.');
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    transaction.set(companyRef, {
      companyName, address, orgNumber, adminName,
      adminEmail: email, adminPhone: phone, adminUid: userRecord.uid,
      created: timestamp, isPublic: false
    });
    
    const userRef = db.collection('users').doc(userRecord.uid);
    transaction.set(userRef, {
      email, name: adminName, companyId, phone,
      created: timestamp, adminOf: companyId
    });
    
    await admin.auth().setCustomUserClaims(userRecord.uid, { adminOf: companyId });
    return { success: true, companyId, adminUid: userRecord.uid };
  });
});


/**
 * Create Stripe Checkout Session (Callable Function)
 */
exports.createCheckoutSession = onCall({ cors: true, timeoutSeconds: 30, memory: "256MiB", enforceAppCheck: true }, async (request) => {
  const stripe = getStripeInstance();
  if (!stripe) {
      throw new HttpsError('internal', 'Stripe is not configured.');
  }

  const { planId, companyId, successUrl, cancelUrl } = request.data;
  logger.info("🛒 Creating checkout session", { planId, companyId });

  if (!planId || !companyId) {
    throw new HttpsError('invalid-argument', 'Missing required parameters: planId and companyId');
  }
  
  const appUrl = functions.config().app.url;
  if(!appUrl){
      logger.error("App URL is not configured.");
      throw new HttpsError('internal', 'Application URL is not configured.');
  }

  const priceId = functions.config().stripe.price_ids[planId];
   if (!priceId) {
        logger.error(`Invalid plan or price ID not found: ${planId}`);
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
        trial_period_days: 14,
        metadata: { companyId, planId }
      },
      allow_promotion_codes: true,
    });
    return { sessionId: session.id, url: session.url };
  } catch (error) {
    logger.error("❌ Error creating checkout session", { error: error.message, planId, companyId });
    throw new HttpsError('internal', `Failed to create checkout session: ${error.message}`);
  }
});


/**
 * Stripe Webhook Handler
 */
exports.handleStripeWebhook = onRequest({ timeoutSeconds: 60, memory: "256MiB" }, async (req, res) => {
  const stripe = getStripeInstance();
  if (!stripe) {
      res.status(500).send('Stripe is not configured.');
      return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  const stripeConfig = functions.config().stripe;

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeConfig.webhook_secret);
  } catch (err) {
    logger.error("❌ Webhook signature verification failed", { error: err.message });
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  
  // Handle the event
  try {
    switch (event.type) {
        case 'checkout.session.completed':
            // Business logic for checkout completion
            break;
        // ... other event types
        default:
            logger.info(`🤷 Unhandled event type: ${event.type}`);
    }
    res.status(200).json({ received: true });
  } catch(err) {
      logger.error("Error processing webhook", { eventType: event.type, error: err.message });
      res.status(500).send("Internal Server Error");
  }
});
