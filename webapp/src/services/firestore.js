// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ============================================================================
// INTERNAL VALIDATION HELPERS
// ============================================================================

/**
 * Validates an email address format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
const validateEmail = (email) => {
  if (!email) return false;
  const re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validates a URL slug format (lowercase, numbers, hyphens).
 * @param {string} slug - The slug to validate.
 * @returns {boolean} True if the slug format is valid.
 */
const validateSlug = (slug) => {
  if (!slug) return false;
  const re = /^[a-z0-9-]+$/;
  return re.test(slug);
};

// ============================================================================
// USER SERVICE FUNCTIONS
// ============================================================================
export const getUserProfile = async (userId) => { /* ... */ };

// ============================================================================
// TENANT / COMPANY SERVICE FUNCTIONS
// ============================================================================

/**
 * Creates a new tenant (company) with enhanced validation.
 * @param {object} formData - The raw form data from the onboarding page.
 * @returns {Promise<string>} The ID of the newly created tenant document.
 * @throws {Error} If validation fails or a database error occurs.
 */
export const createTenant = async (formData) => {
  const { name, slug, plan, trialDays, contactName, contactEmail } = formData;

  // 1. **Robust Input Validation**
  if (!name || name.length < 2 || name.length > 100) {
    throw new Error("Company name must be between 2 and 100 characters.");
  }
  if (!slug || slug.length < 2 || slug.length > 50 || !validateSlug(slug)) {
    throw new Error("URL slug must be 2-50 characters and contain only lowercase letters, numbers, and hyphens.");
  }
  if (!plan) {
    throw new Error("A subscription plan must be selected.");
  }
  if (trialDays === null || trialDays === undefined || isNaN(parseInt(trialDays)) || trialDays < 0 || trialDays > 90) {
      throw new Error("Trial period must be a number between 0 and 90 days.");
  }
  if (!contactName || contactName.length < 2 || contactName.length > 100) {
      throw new Error("Contact name must be between 2 and 100 characters.");
  }
  if (!contactEmail || !validateEmail(contactEmail)) {
      throw new Error("A valid contact email address is required.");
  }

  // 2. **Check for Slug Availability**
  const q = query(collection(db, 'companies'), where('slug', '==', slug.trim()));
  const slugCheck = await getDocs(q);
  if (!slugCheck.empty) {
    const error = new Error("This URL slug is already taken. Please choose another.");
    error.code = "slug-not-available"; // Specific code for UI handling
    throw error;
  }

  // 3. **Construct and Sanitize Data**
  const rawDocData = {
    name: name.trim(),
    companyName: name.trim(),
    slug: slug.trim(),
    subscription: { plan, trialDays: parseInt(trialDays, 10), status: 'trial', active: true },
    billing: { contactName: contactName.trim(), contactEmail: contactEmail.trim() },
    createdAt: serverTimestamp(),
    settings: { emailNotifications: true, bookingConfirmation: true, rutPercentage: 50, isPublic: false }
  };
  const docData = sanitizeObject(rawDocData);

  // 4. **Create Document in Firestore**
  try {
    const docRef = await addDoc(collection(db, 'companies'), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating tenant in Firestore:", error);
    // Provide a more generic but helpful error for the user.
    throw new Error("Could not create the tenant due to a database error. Please try again later.");
  }
};

export const getTenant = async (tenantId) => { /* ... */ };
export const getAllTenants = async () => { /* ... */ };
export const updateTenant = async (tenantId, updatedData) => { /* ... */ };
export const deleteTenant = async (tenantId) => { /* ... */ };

// ... other services
export const createService = async (companyId, serviceData) => { /* ... */ };
export const getAllServicesForCompany = async (companyId) => { /* ... */ };
export const updateService = async (companyId, serviceId, updatedData) => { /* ... */ };
export const deleteService = async (companyId, serviceId) => { /* ... */ };
export const createBooking = async (companyId, bookingData) => { /* ... */ };
export const getAllBookingsForCompany = async (companyId) => { /* ... */ };
export const updateBooking = async (companyId, bookingId, updatedData) => { /* ... */ };
export const deleteBooking = async (companyId, bookingId) => { /* ... */ };
