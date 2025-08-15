import { collection, query, getDocs, orderBy, addDoc, doc, where, updateDoc, getDoc, limit, startAfter, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase/init";
import DOMPurify from 'dompurify';
import { getAuth } from "firebase/auth"; // For client-side auth checks (UX/UI)
import toast from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';


// Note: Offline persistence is now configured in firebase/init.js using the new FirestoreSettings.cache API

// Cache for frequently accessed data
const customerCache = new Map();
const bookingCache = new Map();
const serviceCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// Encryption has been moved to a secure, server-side Cloud Function.
// The client will now call this function instead of handling encryption directly.
const functions = getFunctions();
const encryptData = httpsCallable(functions, 'encryptData');
const decryptData = httpsCallable(functions, 'decryptData');

const encryptPersonnummer = async (personnummer) => {
  if (!personnummer || personnummer.trim() === '') return '';
  try {
    const result = await encryptData({ data: personnummer.trim() });
    return result.data.encryptedData;
  } catch (error) {
    console.error('Server-side encryption failed:', error);
    logError('encryptPersonnummer', error);
    throw new Error('Failed to encrypt sensitive data.');
  }
};

const _decryptPersonnummer = async (encryptedPersonnummer) => {
  if (!encryptedPersonnummer || encryptedPersonnummer.trim() === '') return '';
  try {
    const result = await decryptData({ encryptedData: encryptedPersonnummer });
    return result.data.data;
  } catch (error) {
    console.error('Server-side decryption failed:', error);
    logError('decryptPersonnummer', error);
    return ''; // Return empty string on decryption failure
  }
};

// IMPORTANT: Firestore Security Rules are the PRIMARY enforcement layer for data access and security.
// The client-side checks below (e.g., checkAuthAndRole, rateLimit) are for UX/UI and preventing unnecessary API calls,
// but they DO NOT replace robust server-side security rules or Cloud Functions for sensitive operations.

// Centralized error logging utility with user notifications
const logError = (functionName, error, data = {}) => {
  console.error(`Error in ${functionName}:`, error);
  console.error('Context data:', data);
  
  // User-friendly error messages
  let userMessage = error.message;
  if (error.code === 'permission-denied') {
    userMessage = 'You do not have permission to perform this action.';
  } else if (error.code === 'unavailable') {
    userMessage = 'Service temporarily unavailable. Please try again.';
  } else if (error.code === 'deadline-exceeded') {
    userMessage = 'Request timed out. Please check your connection.';
  } else if (error.message.includes('Rate limit')) {
    userMessage = 'Too many requests. Please wait a moment and try again.';
  }
  
  toast.error(userMessage);
  // TODO: In production, integrate with a professional logging service (e.g., Google Cloud Logging, Sentry, Datadog)
};

// Success notification utility
const logSuccess = (message) => {
  toast.success(message);
};

// Cache management utilities
const setCacheWithExpiry = (cache, key, value, duration = CACHE_DURATION) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), duration);
};

const getCacheKey = (prefix, ...params) => {
  return `${prefix}-${params.filter(p => p !== undefined).join('-')}`;
};

// Helper to ensure common timestamping and initial 'deleted' status for new documents
const addTimestamps = (data, isNew = true) => {
  const timestampedData = { ...data, updatedAt: serverTimestamp() };
  if (isNew) {
    timestampedData.createdAt = serverTimestamp();
    timestampedData.deleted = false; // Default to not deleted for new documents
  }
  return timestampedData;
};

// Helper function to sanitize HTML strings using DOMPurify
const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

// Email validation regex
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// Personnummer validation (Swedish personal identity number format: YYYYMMDD-XXXX, used for RUT deduction)
const validatePersonnummer = (personnummer) => /^[0-9]{8}-[0-9]{4}$/.test(personnummer);

// Client-side Rate limiting (for UX/UI, NOT security)
const rateLimit = (userId) => {
  const now = Date.now();
  // This Map should persist for the session, e.g., defined outside this function in module scope
  rateLimit.limits = rateLimit.limits || new Map();
  const userLimit = rateLimit.limits.get(userId) || { tokens: 50, lastReset: now };

  // Reset tokens every 60 seconds (1 minute)
  if (now - userLimit.lastReset > 60000) {
    userLimit.tokens = 50;
    userLimit.lastReset = now;
  }

  if (userLimit.tokens <= 0) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }

  userLimit.tokens--;
  rateLimit.limits.set(userId, userLimit);
  return true;

  // TODO: For production, consider enhancing rateLimit persistence across sessions/serverless invocations
  // (e.g., using Firebase Realtime Database, a dedicated cache, or Cloud Functions for server-side rate limiting)
};

// Client-side Authentication and Role check (for UI/UX, NOT security)
const checkAuthAndRole = async (companyId = null, requiredRole = 'adminOf') => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Authentication required. Please log in.');
  }

  // Ensure we have a valid Firebase Auth user with getIdTokenResult method
  if (!user.getIdTokenResult || typeof user.getIdTokenResult !== 'function') {
    throw new Error('Invalid user object. Please log in again.');
  }

  const token = await user.getIdTokenResult();

  // Check for superAdmin role claim
  if (requiredRole === 'superAdmin') {
    if (!token.claims.superAdmin) {
      throw new Error('Super admin permissions required for this operation.');
    }
    return true;
  }

  // Check for adminOf specific company claim
  if (requiredRole === 'adminOf' && companyId) {
    if (!token.claims.adminOf || !token.claims.adminOf.includes(companyId)) {
      throw new Error('Insufficient permissions. You are not an admin of this company.');
    }
    return true;
  }

  // Default: if no specific role or companyId is required, just check if authenticated
  if (requiredRole === null) {
    return true;
  }

  // Fallback for roles not explicitly handled
  throw new Error('Authorization check failed. Unknown role or missing permissions.');

  // TODO: Ensure a Cloud Function or other backend logic sets custom claims (adminOf, superAdmin) on user tokens after sign-up/role assignment.
};

// --- CRUD Operations ---

// Get all tenants (companies) from the 'companies' collection with pagination and soft-delete filtering
export const getAllTenants = async (options = {}) => {
  try {
    // No client-side auth/rate-limit here for initial public/unauthenticated list of tenants (if allowed by rules)
    // If this list should only be for super-admins, add checkAuthAndRole('superAdmin')
    const companiesRef = collection(db, 'companies');
    let q = query(
      companiesRef,
      where('deleted', '==', false), // Filter out soft-deleted companies
      orderBy('createdAt', 'desc'),
      limit(options.limit || 50)
    );

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const snapshot = await getDocs(q);
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`Fetched ${tenants.length} tenants from Firestore`);
    return { tenants, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  } catch (error) {
    logError('getAllTenants', error, { options });
    throw error;
  }

  // TODO: Run one-time migration script (webapp/scripts/migrateFirestore.js) to backfill
  // 'createdAt' and 'deleted: false' for existing company documents lacking them.
};

// This function is now deprecated. The logic has been moved to a secure Cloud Function.
// The `createTenant` function in `tenants.js` on the server should be used instead.
// See `webapp/src/pages/TenantOnboardPage.jsx` for an example of how to call the new function.
export const createTenant_DEPRECATED = async (tenantData) => {
  throw new Error("createTenant is deprecated. Use the 'createTenant' callable Cloud Function instead.");
};

// Update a tenant (company) in the 'companies' collection by ID
export const updateTenant = async (tenantId, tenantData) => {
  try {
    await checkAuthAndRole(tenantId, 'adminOf'); // Only admins of this company can update
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (tenantData.name !== undefined && !sanitizeHtml(tenantData.name).trim()) {
      throw new Error('Name cannot be empty.');
    }
    if (tenantData.contactEmail !== undefined && !validateEmail(sanitizeHtml(tenantData.contactEmail))) {
      throw new Error('Invalid contact email format.');
    }
    if (tenantData.RUTEligible !== undefined && typeof tenantData.RUTEligible !== 'boolean') {
      throw new Error('RUTEligible must be a boolean.');
    }
    if (tenantData.personnummer !== undefined && tenantData.personnummer && !validatePersonnummer(sanitizeHtml(tenantData.personnummer))) {
      throw new Error('Invalid personnummer format (YYYYMMDD-XXXX) if provided.');
    }
    if (tenantData.consent !== undefined && typeof tenantData.consent !== 'boolean') {
      throw new Error('Consent must be a boolean.');
    }

    const sanitizedData = addTimestamps({
      name: sanitizeHtml(tenantData.name || ''),
      contactEmail: sanitizeHtml(tenantData.contactEmail || ''),
      address: sanitizeHtml(tenantData.address || ''),
      RUTEligible: tenantData.RUTEligible,
      personnummer: sanitizeHtml(tenantData.personnummer || ''), // Store personnummer
      consent: tenantData.consent,
      consentTimestamp: tenantData.consent ? serverTimestamp() : null, // Update timestamp if consent changes
      consentDetails: sanitizeHtml(tenantData.consentDetails || ''),
      // Using dot notation for specific subscription field updates to avoid overwriting the entire sub-object
      'subscription.active': tenantData.subscription?.active,
      'subscription.plan': tenantData.subscription?.plan,
      // Add other top-level fields here if they are part of the update
    }, false); // Not a new document, so only update 'updatedAt'

    // Clean up undefined values from the sanitizedData before sending to Firestore
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) delete sanitizedData[key];
    });

    const tenantDocRef = doc(db, 'companies', tenantId);
    await updateDoc(tenantDocRef, sanitizedData);

    return true;
  } catch (error) {
    logError('updateTenant', error, { tenantId, tenantData });
    throw error;
  }

  // Important Note on Nested Object Updates:
  // For fields like 'subscription', 'contact', 'settings', etc.,
  // if the client sends a partial update (e.g., only 'subscription.active'),
  // use Firestore's dot notation (e.g., { 'nestedObject.field': value }).
  // If the intent is to COMPLETELY REPLACE a nested object (e.g., all of 'contact'),
  // the client MUST send the complete new object for that field.
  // Be mindful of this client-side data construction to avoid unintended overwrites
  // or data loss of other nested fields not provided in the update payload.
};

// Soft-delete a tenant (company) from the 'companies' collection by ID
export const deleteTenant = async (tenantId, userId = null) => { // userId for audit trail
  try {
    await checkAuthAndRole(tenantId, 'adminOf'); // Only admins of this company can initiate soft-delete
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    const tenantDocRef = doc(db, 'companies', tenantId);
    await updateDoc(tenantDocRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId || getAuth().currentUser?.uid || 'system', // Track who initiated the soft-delete
      updatedAt: serverTimestamp() // Update timestamp for this action
    });

    return true;
  } catch (error) {
    logError('deleteTenant', error, { tenantId, userId });
    throw error;
  }

  // WARNING: This function only soft-deletes the parent 'company' document.
  // For full cascade soft-deletion of associated subcollections (services, customers, bookings)
  // and cleanup of any related top-level documents, a Firebase Cloud Function (e.g., functions/cascadeDelete.js)
  // triggered by this 'deleted' flag change is required.
};

// Get a tenant (company) by ID
export const getTenant = async (tenantId) => {
  try {
    console.log('🔍 getTenant called with tenantId:', tenantId);
    
    // No client-side auth/rate-limit here, as this might be called by the client directly after login
    // Security Rules are crucial here to ensure only authorized users can read.
    const tenantDocRef = doc(db, 'companies', tenantId);
    console.log('📄 Attempting to fetch document from:', `companies/${tenantId}`);
    
    const tenantSnap = await getDoc(tenantDocRef);
    console.log('📄 Document exists:', tenantSnap.exists());

    // Client-side filtering of soft-deleted documents (Security Rules should also enforce this)
    if (tenantSnap.exists() && tenantSnap.data().deleted !== true) { 
      const data = tenantSnap.data();
      console.log('✅ Company found and not soft-deleted:', { name: data.name, deleted: data.deleted });
      // Return full data from Firestore document. Security rules will minimize read costs.
      return { id: tenantSnap.id, ...data };
    } else {
      console.log('❌ Company not found or is soft-deleted');
      return null; // Tenant not found or is soft-deleted
    }
  } catch (error) {
    console.error('❌ Error in getTenant:', error);
    logError('getTenant', error, { tenantId });
    throw error;
  }
};

// Create a new service in the 'services' subcollection for a specific company
export const createService = async (companyId, serviceData) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can create services
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (!serviceData.name || !sanitizeHtml(serviceData.name).trim()) {
      throw new Error('Service name is required and cannot be empty.');
    }
    if (typeof serviceData.price !== 'number' || serviceData.price <= 0) {
      throw new Error('Price must be a positive number.');
    }
    if (serviceData.duration !== undefined && (typeof serviceData.duration !== 'number' || serviceData.duration < 0)) {
      throw new Error('Duration must be a non-negative number.');
    }
    if (serviceData.RUTEligible !== undefined && typeof serviceData.RUTEligible !== 'boolean') {
      throw new Error('RUTEligible must be a boolean.');
    }

    const sanitizedData = addTimestamps({
      name: sanitizeHtml(serviceData.name),
      price: serviceData.price,
      duration: serviceData.duration || 0,
      RUTEligible: !!serviceData.RUTEligible,
      consent: true, // Required by Firestore security rules
      // 'deleted: false' is added by addTimestamps helper for new documents
      // Include other service-specific fields here, ensuring sanitization for strings
    }, true);

    const servicesRef = collection(db, 'companies', companyId, 'services');
    const docRef = await addDoc(servicesRef, sanitizedData);

    return docRef.id;
  } catch (error) {
    logError('createService', error, { companyId, serviceData });
    throw error;
  }
};

// Update a service in the 'services' subcollection for a specific company
export const updateService = async (companyId, serviceId, serviceData) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can update services
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (serviceData.name !== undefined && !sanitizeHtml(serviceData.name).trim()) {
      throw new Error('Service name cannot be empty.');
    }
    if (serviceData.price !== undefined && (typeof serviceData.price !== 'number' || serviceData.price <= 0)) {
      throw new Error('Price must be a positive number.');
    }
    if (serviceData.duration !== undefined && (typeof serviceData.duration !== 'number' || serviceData.duration < 0)) {
      throw new Error('Duration must be a non-negative number.');
    }
    if (serviceData.RUTEligible !== undefined && typeof serviceData.RUTEligible !== 'boolean') {
      throw new Error('RUTEligible must be a boolean.');
    }

    const sanitizedData = addTimestamps({
      name: sanitizeHtml(serviceData.name || ''),
      price: serviceData.price,
      duration: serviceData.duration,
      RUTEligible: serviceData.RUTEligible,
      pricingModel: serviceData.pricingModel,
      tiers: serviceData.tiers,
      addOns: serviceData.addOns,
      customFees: serviceData.customFees,
      perRoomRates: serviceData.perRoomRates,
      windowTypes: serviceData.windowTypes,
      frequencyMultipliers: serviceData.frequencyMultipliers,
      zipAreas: serviceData.zipAreas,
      description: sanitizeHtml(serviceData.description || ''),
      // Include other service-specific fields here, ensuring sanitization for strings
    }, false);

    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) delete sanitizedData[key];
    });

    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    await updateDoc(serviceDocRef, sanitizedData);

    // Clear the services cache to force a fresh fetch
    console.log('🧹 Clearing services cache after update');
    serviceCache.clear();

    return true;
  } catch (error) {
    logError('updateService', error, { companyId, serviceId, serviceData });
    throw error;
  }
};

// Soft-delete a service from the 'services' subcollection for a specific company
export const deleteService = async (companyId, serviceId, userId = null) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can soft-delete services
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    console.log(`🗑️ Soft-deleting service ${serviceId} for company ${companyId}`);

    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    await updateDoc(serviceDocRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId || getAuth().currentUser?.uid || 'system',
      updatedAt: serverTimestamp()
    });

    // Clear the services cache to force a fresh fetch
    console.log('🧹 Clearing services cache after deletion');
    serviceCache.clear();

    console.log(`✅ Service ${serviceId} soft-deleted successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting service ${serviceId}:`, error);
    logError('deleteService', error, { companyId, serviceId, userId });
    throw error;
  }
};

// Get all services for a specific company (tenant) by companyId with pagination and soft-delete filtering
export const getAllServicesForCompany = async (companyId, options = {}) => {
  try {
    console.log('🔍 getAllServicesForCompany called with companyId:', companyId);
    
    // Check cache first
    const cacheKey = getCacheKey('services', companyId, options.limit || 50, options.lastDoc?.id || 'start');
    if (serviceCache.has(cacheKey)) {
      console.log(`Serving services from cache for company ${companyId}`);
      return serviceCache.get(cacheKey);
    }

    console.log('🔐 Checking auth and role for company:', companyId);
    await checkAuthAndRole(companyId, 'adminOf'); // Only company members can read services
    console.log('✅ Auth check passed for company:', companyId);

    const servicesRef = collection(db, 'companies', companyId, 'services');
    console.log('📄 Attempting to fetch services from:', `companies/${companyId}/services`);
    
    // Get all services first, then filter in memory to handle services without 'deleted' field
    let q = query(
      servicesRef,
      limit(options.limit || 50)
    );

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const snapshot = await getDocs(q);
    const allServices = snapshot.docs.map(doc => {
      // Return full data from Firestore document. Security rules will minimize read costs.
      return { id: doc.id, ...doc.data() };
    });
    
    // Filter out soft-deleted services (including those without 'deleted' field)
    const services = allServices.filter(service => service.deleted !== true);
    
    // Sort services by createdAt if available, otherwise by updatedAt, otherwise by id
    services.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || b.updatedAt?.toDate?.() || new Date(0);
      return bTime - aTime; // Descending order (newest first)
    });

    const result = { services, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
    
    // Cache the result
    setCacheWithExpiry(serviceCache, cacheKey, result);
    
    // Clear cache to force fresh fetch for old services
    serviceCache.clear();

    console.log(`✅ Fetched ${services.length} services for company ${companyId}`);
    return result;
  } catch (error) {
    console.error('❌ Error in getAllServicesForCompany:', error);
    logError('getAllServicesForCompany', error, { companyId, options });
    throw error;
  }
};

// Create a new booking in the 'bookings' subcollection for a specific company
export const createBooking = async (companyId, bookingData) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can create bookings
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (!bookingData.customerEmail || !validateEmail(sanitizeHtml(bookingData.customerEmail))) {
      throw new Error('Valid customer email is required.');
    }
    if (bookingData.price !== undefined && (typeof bookingData.price !== 'number' || bookingData.price <= 0)) {
      throw new Error('Price must be a positive number.');
    }

    // Personnummer is optional, but if provided, it must be valid
    if (bookingData.personnummer && !validatePersonnummer(sanitizeHtml(bookingData.personnummer))) {
      throw new Error('Invalid personnummer format (YYYYMMDD-XXXX) if provided.');
    }
    if (!bookingData.customerId || !sanitizeHtml(bookingData.customerId).trim()) {
      throw new Error('Customer ID is required and cannot be empty.');
    }
    if (!bookingData.serviceId || !sanitizeHtml(bookingData.serviceId).trim()) {
      throw new Error('Service ID is required and cannot be empty.');
    }

    // Date Validation: bookingData.date should be a client-provided scheduled date
    if (bookingData.date && !(bookingData.date instanceof Date || (bookingData.date.toDate && typeof bookingData.date.toDate === 'function'))) {
      throw new Error('Invalid date format for booking date. Must be a Date object or Firestore Timestamp.');
    }
    if (bookingData.consent !== undefined && typeof bookingData.consent !== 'boolean') {
      throw new Error('Consent must be a boolean.');
    }

    const sanitizedData = addTimestamps({
      // companyId is implicitly part of the subcollection path here, but included for clarity in data
      companyId: companyId,
      customerId: sanitizeHtml(bookingData.customerId),
      serviceId: sanitizeHtml(bookingData.serviceId),
      date: bookingData.date || serverTimestamp(), // Fallback to creation timestamp if no specific date is provided
      personnummer: sanitizeHtml(bookingData.personnummer || ''), // Store personnummer
      consent: !!bookingData.consent,
      consentTimestamp: bookingData.consent ? serverTimestamp() : null,
      consentDetails: sanitizeHtml(bookingData.consentDetails || ''),
      RUTEligible: !!bookingData.RUTEligible,
      customerEmail: sanitizeHtml(bookingData.customerEmail),
      price: bookingData.price,
      // 'deleted: false' is added by addTimestamps helper for new documents
      // Include other booking-specific fields here, ensuring sanitization for strings
    }, true);

    if (!sanitizedData.consent) {
      throw new Error('Consent required to create booking (GDPR compliance).');
    }

    const bookingsRef = collection(db, 'companies', companyId, 'bookings'); // Use subcollection
    const docRef = await addDoc(bookingsRef, sanitizedData);

    return { id: docRef.id, ...sanitizedData };
  } catch (error) {
    logError('createBooking', error, { companyId, bookingData });
    throw error;
  }
};

// This function is now deprecated. The logic has been moved to a secure Cloud Function.
// The `createRecurringBookings` function in `functions/bookings.js` should be used instead.
export const createRecurringBooking_DEPRECATED = async (companyId, bookingData, frequency, occurrences) => {
  throw new Error("createRecurringBooking is deprecated. Use the 'createRecurringBookings' callable Cloud Function instead.");
};

// Update a booking in the 'bookings' subcollection for a specific company
export const updateBooking = async (companyId, bookingId, bookingData) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can update bookings
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (bookingData.customerEmail !== undefined && !validateEmail(sanitizeHtml(bookingData.customerEmail))) {
      throw new Error('Invalid customer email format.');
    }
    if (bookingData.price !== undefined && (typeof bookingData.price !== 'number' || bookingData.price <= 0)) {
      throw new Error('Price must be a positive number.');
    }
    if (bookingData.personnummer !== undefined && bookingData.personnummer && !validatePersonnummer(sanitizeHtml(bookingData.personnummer))) {
      throw new Error('Invalid personnummer format (YYYYMMDD-XXXX) if provided.');
    }
    if (bookingData.customerId !== undefined && !sanitizeHtml(bookingData.customerId).trim()) {
      throw new Error('Customer ID cannot be empty.');
    }
    if (bookingData.serviceId !== undefined && !sanitizeHtml(bookingData.serviceId).trim()) {
      throw new Error('Service ID cannot be empty.');
    }
    if (bookingData.date !== undefined && bookingData.date && !(bookingData.date instanceof Date || (bookingData.date.toDate && typeof bookingData.date.toDate === 'function'))) {
      throw new Error('Invalid date format for booking date. Must be a Date object or Firestore Timestamp.');
    }
    if (bookingData.consent !== undefined && typeof bookingData.consent !== 'boolean') {
      throw new Error('Consent must be a boolean.');
    }

    const sanitizedData = addTimestamps({
      customerId: sanitizeHtml(bookingData.customerId || ''),
      serviceId: sanitizeHtml(bookingData.serviceId || ''),
      date: bookingData.date,
      personnummer: sanitizeHtml(bookingData.personnummer || ''), // Store personnummer
      consent: bookingData.consent,
      consentTimestamp: bookingData.consent ? serverTimestamp() : null,
      consentDetails: sanitizeHtml(bookingData.consentDetails || ''),
      RUTEligible: bookingData.RUTEligible,
      customerEmail: sanitizeHtml(bookingData.customerEmail || ''),
      price: bookingData.price,
      // Include other booking-specific fields here, ensuring sanitization for strings
    }, false);

    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) delete sanitizedData[key];
    });

    const bookingDocRef = doc(db, 'companies', companyId, 'bookings', bookingId);
    await updateDoc(bookingDocRef, sanitizedData);

    return true;
  } catch (error) {
    logError('updateBooking', error, { companyId, bookingId, bookingData });
    throw error;
  }
};

// Soft-delete a booking from the 'bookings' subcollection for a specific company
export const deleteBooking = async (companyId, bookingId, userId = null) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can soft-delete bookings
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    const bookingDocRef = doc(db, 'companies', companyId, 'bookings', bookingId);
    await updateDoc(bookingDocRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId || getAuth().currentUser?.uid || 'system',
        updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    logError('deleteBooking', error, { companyId, bookingId, userId });
    throw error;
  }
};

// Get all bookings for a specific company (tenant) by companyId with pagination and soft-delete filtering
export const getAllBookingsForCompany = async (companyId, options = {}) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only company members can read bookings

    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    let q = query(
      bookingsRef,
      where('deleted', '==', false), // Filter out soft-deleted bookings
      orderBy('createdAt', 'desc'),
      limit(options.limit || 50)
    );

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => {
      // Return full data from Firestore document. Security rules will minimize read costs.
      return { id: doc.id, ...doc.data() };
    });

    console.log(`Fetched ${bookings.length} bookings for company ${companyId}`);
    return { bookings, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  } catch (error) {
    logError('getAllBookingsForCompany', error, { companyId, options });
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    // Client-side filtering of soft-deleted documents (Security Rules should also enforce this)
    if (userSnap.exists() && userSnap.data().deleted === false) { 
      // Return full data from Firestore document. Security rules will minimize read costs.
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null; // User not found or is soft-deleted
    }
  } catch (error) {
    logError('getUserProfile', error, { userId });
    throw error;
  }
};

// Create a new customer in the 'customers' subcollection for a specific company
export const createCustomer = async (companyId, customerData) => {
  try {
    await checkAuthAndRole(companyId, 'adminOf'); // Only admins of this company can create customers
    rateLimit(getAuth().currentUser.uid); // Apply client-side rate limit

    // Validation
    if (!customerData.name || !sanitizeHtml(customerData.name).trim()) {
      throw new Error('Customer name is required and cannot be empty.');
    }
    if (!customerData.email || !validateEmail(sanitizeHtml(customerData.email))) {
      throw new Error('Valid email is required.');
    }
    if (customerData.personnummer !== undefined && !validatePersonnummer(sanitizeHtml(customerData.personnummer))) {
      throw new Error('Invalid personnummer format (YYYYMMDD-XXXX) if provided.');
    }
    if (customerData.consent !== undefined && typeof customerData.consent !== 'boolean') {
      throw new Error('Consent must be a boolean.');
    }
    if (customerData.totalSpent !== undefined && (typeof customerData.totalSpent !== 'number' || customerData.totalSpent < 0)) {
      throw new Error('Total spent must be a non-negative number.');
    }

    // Encrypt personnummer before storage
    const encryptedPersonnummer = customerData.personnummer ? 
      await encryptPersonnummer(sanitizeHtml(customerData.personnummer)) : '';

    const sanitizedData = addTimestamps({
      name: sanitizeHtml(customerData.name),
      email: sanitizeHtml(customerData.email),
      status: sanitizeHtml(customerData.status || 'lead'),
      customerType: sanitizeHtml(customerData.customerType || 'private'),
      source: sanitizeHtml(customerData.source || 'unknown'),
      personnummer: encryptedPersonnummer, // Store encrypted personnummer
      consent: !!customerData.consent,
      consentTimestamp: customerData.consent ? serverTimestamp() : null,
      consentDetails: sanitizeHtml(customerData.consentDetails || ''),
      totalSpent: customerData.totalSpent || 0,
      companyId: companyId, // Add companyId for collection group queries
      // 'deleted: false' is added by addTimestamps helper for new documents
      // Include other customer-specific fields here, ensuring sanitization for strings
    }, true);

    if (!sanitizedData.consent) {
      throw new Error('Consent required to create customer (GDPR compliance).');
    }

    // Note: For production SaaS, 'totalSpent' should ideally be a derived field
    // calculated via Cloud Functions triggered by related booking/payment events
    // to ensure data integrity and prevent manual inconsistencies.

    const customersRef = collection(db, 'companies', companyId, 'customers');
    const docRef = await addDoc(customersRef, sanitizedData);

    return docRef.id;
  } catch (error) {
    logError('createCustomer', error, { companyId, customerData });
    throw error;
  }
};

export const getCustomersForCompany = async (companyId, options = {}) => {
  try {
    // Check cache first
    const cacheKey = getCacheKey('customers', companyId, options.status || 'all', options.limit || 50, options.lastDoc?.id || 'start');
    if (customerCache.has(cacheKey)) {
      console.log(`Serving customers from cache for company ${companyId}`);
      return customerCache.get(cacheKey);
    }

    await checkAuthAndRole(companyId, 'adminOf'); // Only company members can read customers

    const customersRef = collection(db, 'companies', companyId, 'customers');
    let q = query(customersRef);
    
    // Filter out soft-deleted documents
    q = query(q, where('deleted', '==', false));

    if (options.status && options.status !== 'all') q = query(q, where('status', '==', options.status));
    if (options.customerType && options.customerType !== 'all') q = query(q, where('customerType', '==', options.customerType));

    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortDirection || 'desc';
    q = query(q, orderBy(sortField, sortDirection));
    
    if (options.limit) q = query(q, limit(options.limit));
    if (options.lastDoc) q = query(q, startAfter(options.lastDoc));
    
    const snapshot = await getDocs(q);
    const customers = snapshot.docs.map(doc => {
      // Return full data from Firestore document. Security rules will minimize read costs.
      return { id: doc.id, ...doc.data() };
    });

    const result = { customers, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
    
    // Cache the result
    setCacheWithExpiry(customerCache, cacheKey, result);

    console.log(`Fetched ${customers.length} customers for company ${companyId}`);
    return result;
  } catch (error) {
    logError('getCustomersForCompany', error, { companyId, options });
    throw error;
  }
};

// Debug function to list all companies in the database
export const debugListAllCompanies = async () => {
  if (import.meta.env.PROD) {
    console.warn('debugListAllCompanies is disabled in production');
    return [];
  }

  try {
    await checkAuthAndRole(null, 'superAdmin'); // Only super admins can use this debug function

    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    const companies = [];

    console.log(`Found ${snapshot.size} companies in the database:`);

    snapshot.forEach(doc => {
      const companyData = doc.data(); // Get raw data
      companies.push({ id: doc.id, ...companyData }); // Store full data in array

      // In non-production, log only essential, non-sensitive data
      console.log(`Company ID: ${doc.id}`);
      console.log(`Name: ${companyData.name || 'No name'}`);
      console.log(`Deleted: ${companyData.deleted || false}`);
      // Explicitly avoid logging sensitive fields like contactEmail, personnummer, subscription details here
      console.log('-----------------------------------');
    });

    return companies;
  } catch (error) {
    logError('debugListAllCompanies', error);
    return [];
  }
};