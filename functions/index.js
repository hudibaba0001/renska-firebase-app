
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
exports.createCheckoutSession = onCall({ enforceAppCheck: false }, async (data, context) => {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new HttpsError('internal', 'Stripe is not configured.');
    }

    const { companyId, planId, successUrl, cancelUrl } = data;
    if (!companyId || !planId) {
      throw new HttpsError('invalid-argument', 'Missing required fields.');
    }

    // Get company data
    const companyDoc = await admin.firestore().collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      throw new HttpsError('not-found', 'Company not found.');
    }
    const company = companyDoc.data();

    // Get the price ID for the selected plan
    // You can set these with: firebase functions:config:set stripe.price_ids.starter="price_123" stripe.price_ids.vaxt="price_456" stripe.price_ids.enterprise="price_789"
    const priceIds = {
      starter: process.env.STRIPE_STARTER_PRICE_ID || functions.config().stripe?.price_ids?.starter,
      vaxt: process.env.STRIPE_VAXT_PRICE_ID || functions.config().stripe?.price_ids?.vaxt,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || functions.config().stripe?.price_ids?.enterprise
    };
    
    const priceId = priceIds[planId];
    if (!priceId) {
      throw new HttpsError('invalid-argument', `Invalid plan ID: ${planId}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL || 'https://your-app-url.com'}/admin/${companyId}?payment=success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'https://your-app-url.com'}/payment?companyId=${companyId}&plan=${planId}&canceled=true`,
      client_reference_id: companyId,
      customer_email: company.adminEmail,
      metadata: {
        companyId,
        planId
      }
    });

    return { sessionUrl: session.url };
  } catch (error) {
    logger.error('Error creating checkout session', error);
    throw new HttpsError('internal', error.message);
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
