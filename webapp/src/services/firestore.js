// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ============================================================================
// USER SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetches a user's profile from the Firestore database.
 * @param {string} userId - The unique ID of the user.
 * @returns {Promise<object|null>} A promise that resolves with the user's data object or null if not found.
 * @throws {Error} If userId is not provided or if there's a database error.
 */
export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch a user profile.");
  }
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn(`No user profile found for user ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile from Firestore.");
  }
};


// ============================================================================
// TENANT / COMPANY SERVICE FUNCTIONS
// ============================================================================

/**
 * Checks if a URL slug is already in use by another company.
 * @param {string} slug - The slug to check.
 * @returns {Promise<boolean>} True if the slug is available, false otherwise.
 * @throws {Error} If there is a database error.
 */
async function isSlugAvailable(slug) {
  try {
    const q = query(collection(db, 'companies'), where('slug', '==', slug.trim()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking slug availability:", error);
    throw new Error("Failed to check slug availability.");
  }
}

/**
 * Creates a new tenant (company) in the Firestore database.
 * @param {object} formData - The raw form data from the onboarding page.
 * @returns {Promise<string>} The ID of the newly created tenant document.
 * @throws {Error} If the slug is taken, data is missing, or a database error occurs.
 * @example
 *   const newTenantId = await createTenant({ name: 'Test Co', slug: 'test-co', ... });
 */
export const createTenant = async (formData) => {
  const { name, slug, plan, trialDays, contactName, contactEmail } = formData;
  if (!name || !slug || !plan || !contactName || !contactEmail) {
    throw new Error("Missing required tenant information.");
  }

  const slugIsAvailable = await isSlugAvailable(slug);
  if (!slugIsAvailable) {
    const error = new Error("This URL slug is already taken. Please choose another.");
    error.code = "slug-not-available";
    throw error;
  }

  const rawDocData = {
    name: name.trim(),
    companyName: name.trim(),
    slug: slug.trim(),
    subscription: {
      plan: plan,
      trialDays: parseInt(trialDays, 10) || 0,
      status: 'trial',
      active: true
    },
    billing: {
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim()
    },
    createdAt: serverTimestamp(),
    settings: {
      emailNotifications: true,
      bookingConfirmation: true,
      rutPercentage: 50,
      isPublic: false
    }
  };

  const docData = sanitizeObject(rawDocData);

  try {
    const docRef = await addDoc(collection(db, 'companies'), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating tenant in Firestore:", error);
    throw new Error("Failed to create tenant due to a database error.");
  }
};

/**
 * Fetches a single tenant (company) document from Firestore by its ID.
 * @param {string} tenantId - The unique ID of the tenant to fetch.
 * @returns {Promise<object|null>} An object containing the tenant's data, or null if not found.
 * @throws {Error} If tenantId is not provided or if a database error occurs.
 * @example
 *   const tenant = await getTenant('tenantId123');
 */
export const getTenant = async (tenantId) => {
  if (!tenantId) {
    throw new Error("Tenant ID is required to fetch a tenant.");
  }
  const tenantDocRef = doc(db, "companies", tenantId);
  try {
    const docSnap = await getDoc(tenantDocRef);
    if (docSnap.exists()) {
      // It's good practice to return the document ID along with the data.
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`No tenant found for ID: ${tenantId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching tenant with ID ${tenantId}:`, error);
    throw new Error("Failed to fetch tenant from Firestore.");
  }
};

/**
 * Fetches all tenant (company) documents from Firestore.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of tenant objects.
 * @throws {Error} If a database error occurs.
 * @example
 *   const tenants = await getAllTenants();
 */
export const getAllTenants = async () => {
    const tenantsCollectionRef = collection(db, "companies");
    try {
        const querySnapshot = await getDocs(tenantsCollectionRef);
        // Map over the documents to create an array of tenant objects, including their IDs.
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all tenants:", error);
        throw new Error("Failed to fetch all tenants from Firestore.");
    }
};

/**
 * Updates an existing tenant (company) document in Firestore.
 * @param {string} tenantId - The ID of the tenant to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @throws {Error} If tenantId or updatedData is not provided, or if a database error occurs.
 * @example
 *   await updateTenant('tenantId123', { name: 'New Company Name' });
 */
export const updateTenant = async (tenantId, updatedData) => {
    if (!tenantId) {
        throw new Error("Tenant ID is required to update a tenant.");
    }
    if (!updatedData || Object.keys(updatedData).length === 0) {
        throw new Error("Update data is required.");
    }

    const tenantDocRef = doc(db, "companies", tenantId);
    
    // For security, sanitize the incoming data before updating.
    const sanitizedData = sanitizeObject(updatedData);

    try {
        await updateDoc(tenantDocRef, sanitizedData);
    } catch (error) {
        console.error(`Error updating tenant with ID ${tenantId}:`, error);
        throw new Error("Failed to update tenant in Firestore.");
    }
};

/**
 * Deletes a tenant (company) document from Firestore.
 * @param {string} tenantId - The ID of the tenant to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 * @throws {Error} If tenantId is not provided or if a database error occurs.
 * @example
 *   await deleteTenant('tenantId123');
 */
export const deleteTenant = async (tenantId) => {
    if (!tenantId) {
        throw new Error("Tenant ID is required to delete a tenant.");
    }
    const tenantDocRef = doc(db, "companies", tenantId);
    try {
        await deleteDoc(tenantDocRef);
    } catch (error) {
        console.error(`Error deleting tenant with ID ${tenantId}:`, error);
        throw new Error("Failed to delete tenant from Firestore.");
    }
};
