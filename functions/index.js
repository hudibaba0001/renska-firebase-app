const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require('firebase-functions');
const crypto = require('crypto');

// Initialize Firebase Admin
try {
  admin.initializeApp();
  logger.info("Firebase Admin SDK initialized successfully.");
} catch (error) {
  logger.error("Firebase Admin SDK initialization failed:", error);
}
const db = admin.firestore();

// Set global options
setGlobalOptions({ region: "europe-west1" });

// Encryption configuration
let ENCRYPTION_KEY;
try {
  ENCRYPTION_KEY = functions.config().keys.encryption_key;
  if (!ENCRYPTION_KEY) {
    logger.error("ENCRYPTION_KEY is not set in Firebase environment config.");
  } else {
    logger.info("Encryption key loaded successfully.");
  }
} catch (error) {
  logger.error("Failed to load encryption key from Firebase config:", error);
}
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Health check endpoint
 */
exports.healthCheck = onRequest((req, res) => {
  logger.info("Health check endpoint called.");
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'swedprime-billing'
      });
    });

/**
 * Update Payment Settings (Callable Function)
 */
exports.updatePaymentSettings = onCall({ enforceAppCheck: true }, async (request) => {
  logger.info("updatePaymentSettings function called.");
  const { companyId, mode, provider, publishableKey, secretKey, instructions } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    logger.error("User is not authenticated.");
    throw new HttpsError('unauthenticated', 'You must be logged in to update settings.');
  }

  const companyRef = db.collection('companies').doc(companyId);
  const companySnap = await companyRef.get();

  if (!companySnap.exists || companySnap.data().adminUid !== uid) {
    logger.error("User does not have permission to update settings.");
    throw new HttpsError('permission-denied', 'You do not have permission to update these settings.');
  }

  const configRef = db.collection('companies').doc(companyId).collection('paymentConfig').doc('settings');

  const dataToStore = {
    mode: mode === 'online' ? 'online' : 'manual',
    provider: provider || 'stripe',
    publishableKey: publishableKey || '',
    instructions: instructions || '',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: uid
  };

  if (secretKey) {
    dataToStore.secretKey = encrypt(secretKey);
    dataToStore.secretKeyStored = true;
  }

  await configRef.set(dataToStore, { merge: true });

  logger.info("Payment settings updated successfully.");
  return { success: true, message: 'Payment settings updated successfully.' };
});


/**
 * Secure Company Signup Function
 */
exports.signupCompany = onCall({ timeoutSeconds: 30, memory: '256MiB', enforceAppCheck: true }, async (request) => {
  logger.info("signupCompany function called.");
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
    logger.info("Company and user created successfully.");
    return { success: true, companyId, adminUid: userRecord.uid };
          });
        });


/**
 * Create Stripe Checkout Session for SaaS Subscription (Callable Function)
 */
exports.createCheckoutSession = onCall({ enforceAppCheck: false }, async (data, context) => {
  logger.info("createCheckoutSession function called.");
  try {
    const stripe = require('stripe')(functions.config().stripe.secret_key);
    logger.info("Stripe instance created successfully.");

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
    const priceIds = {
      starter: functions.config().stripe.price_ids.starter,
      vaxt: functions.config().stripe.price_ids.vaxt,
      enterprise: functions.config().stripe.price_ids.enterprise
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: companyId,
      customer_email: company.adminEmail,
      metadata: {
        companyId,
        planId
      }
    });

    logger.info("Stripe checkout session created successfully.");
    return { sessionUrl: session.url };
  } catch (error) {
    logger.error('Error creating checkout session', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Create Booking Payment Intent (Callable Function)
 */
exports.createBookingPaymentIntent = onCall({ enforceAppCheck: true }, async (request) => {
  logger.info("createBookingPaymentIntent function called.");
  const { companyId, bookingData, successUrl, cancelUrl } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    logger.error("User is not authenticated.");
    throw new HttpsError('unauthenticated', 'You must be logged in to create a booking.');
  }

  const configRef = db.collection('companies').doc(companyId).collection('paymentConfig').doc('settings');
  const configSnap = await configRef.get();

  if (!configSnap.exists) {
    throw new HttpsError('not-found', 'Payment configuration not found for this company.');
  }
  const paymentConfig = configSnap.data();

  if (paymentConfig.mode !== 'online') {
    throw new HttpsError('failed-precondition', 'This company does not accept online payments.');
  }

  const stripeSecretKey = decrypt(paymentConfig.secretKey);
  const stripe = require('stripe')(stripeSecretKey);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'sek',
        product_data: {
          name: bookingData.service,
        },
        unit_amount: bookingData.totalPrice * 100, // Stripe expects the amount in öre
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      companyId,
      bookingId: bookingData.id // Assuming the booking ID is passed in the bookingData
    }
  });

  logger.info("Stripe checkout session for booking created successfully.");
  return { sessionUrl: session.url };
});


/**
 * Stripe Webhook Handler
 */
exports.handleStripeWebhook = onRequest({ timeoutSeconds: 60, memory: "256MiB" }, async (req, res) => {
  logger.info("handleStripeWebhook function called.");
  const stripe = require('stripe')(functions.config().stripe.webhook_secret);

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, functions.config().stripe.webhook_secret);
    logger.info("Stripe webhook event constructed successfully.");
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
            logger.info("Checkout session completed event received.");
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
