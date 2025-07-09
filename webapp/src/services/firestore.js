// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ... (validation helpers and other functions remain the same) ...
const validateEmail = (email) => { /* ... */ };
const validateSlug = (slug) => { /* ... */ };
export const getUserProfile = async (userId) => { /* ... */ };
export const createTenant = async (formData) => { /* ... */ };
export const getTenant = async (tenantId) => { /* ... */ };
export const getAllTenants = async () => { /* ... */ };


/**
 * Updates an existing tenant (company) document with enhanced validation.
 * @param {string} tenantId - The ID of the tenant to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or a database error occurs.
 */
export const updateTenant = async (tenantId, updatedData) => {
  if (!tenantId) {
    throw new Error("Tenant ID is required to update a tenant.");
  }
  if (!updatedData || Object.keys(updatedData).length === 0) {
    throw new Error("Update data must be provided.");
  }

  // **1. Validate updatedData fields before proceeding**
  const { name, slug, billing, subscription, settings } = updatedData;
  if (name !== undefined && (name.length < 2 || name.length > 100)) {
    throw new Error("Company name must be between 2 and 100 characters.");
  }
  if (slug !== undefined) {
    if (slug.length < 2 || slug.length > 50 || !validateSlug(slug)) {
      throw new Error("URL slug must be 2-50 characters and contain only lowercase letters, numbers, and hyphens.");
    }
    // Check if the new slug is already taken by another company.
    const q = query(collection(db, 'companies'), where('slug', '==', slug.trim()));
    const slugCheck = await getDocs(q);
    if (!slugCheck.empty && slugCheck.docs[0].id !== tenantId) {
      throw new Error("This URL slug is already taken by another company.");
    }
  }
  if (billing?.contactEmail !== undefined && !validateEmail(billing.contactEmail)) {
      throw new Error("A valid billing contact email address is required.");
  }
  if (subscription?.trialDays !== undefined && (isNaN(parseInt(subscription.trialDays)) || subscription.trialDays < 0 || subscription.trialDays > 90)) {
      throw new Error("Trial period must be a number between 0 and 90 days.");
  }

  // **2. Sanitize the data before sending it to Firestore**
  // This is a crucial security step to prevent injection attacks.
  const sanitizedData = sanitizeObject(updatedData);

  // **3. Prepare the document reference and perform the update**
  const tenantDocRef = doc(db, "companies", tenantId);
  
  try {
    // Add a server timestamp to track when the document was last updated.
    await updateDoc(tenantDocRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating tenant with ID ${tenantId}:`, error);
    throw new Error("Failed to update tenant due to a database error.");
  }
};

export const deleteTenant = async (tenantId) => { /* ... */ };

// ... other services ...
export const createService = async (companyId, serviceData) => { /* ... */ };
// ... etc. ...
