// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ============================================================================
// USER SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetches a user's profile from the Firestore database.
 * @param {string} userId - The unique ID of the user.
 * @returns {Promise<object|null>} The user's data object or null.
 * @throws {Error} If userId is missing or on database error.
 */
export const getUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID is required.");
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile.");
  }
};

// ============================================================================
// TENANT / COMPANY SERVICE FUNCTIONS
// ============================================================================

/**
 * Creates a new tenant (company) in the Firestore database.
 * @param {object} formData - The raw form data.
 * @returns {Promise<string>} The ID of the new tenant.
 * @throws {Error} On validation or database error.
 */
export const createTenant = async (formData) => {
  const { name, slug, plan, trialDays, contactName, contactEmail } = formData;
  if (!name || !slug || !plan || !contactName || !contactEmail) {
    throw new Error("Missing required tenant information.");
  }
  const q = query(collection(db, 'companies'), where('slug', '==', slug.trim()));
  const slugCheck = await getDocs(q);
  if (!slugCheck.empty) {
    const error = new Error("This URL slug is already taken.");
    error.code = "slug-not-available";
    throw error;
  }
  const rawDocData = {
    name: name.trim(),
    companyName: name.trim(),
    slug: slug.trim(),
    subscription: { plan, trialDays: parseInt(trialDays, 10) || 0, status: 'trial', active: true },
    billing: { contactName: contactName.trim(), contactEmail: contactEmail.trim() },
    createdAt: serverTimestamp(),
    settings: { emailNotifications: true, bookingConfirmation: true, rutPercentage: 50, isPublic: false }
  };
  const docData = sanitizeObject(rawDocData);
  try {
    const docRef = await addDoc(collection(db, 'companies'), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw new Error("Failed to create tenant.");
  }
};

/**
 * Fetches a single tenant document by its ID.
 * @param {string} tenantId - The ID of the tenant.
 * @returns {Promise<object|null>} The tenant's data or null.
 * @throws {Error} On validation or database error.
 */
export const getTenant = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant ID is required.");
  const tenantDocRef = doc(db, "companies", tenantId);
  try {
    const docSnap = await getDoc(tenantDocRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error(`Error fetching tenant ${tenantId}:`, error);
    throw new Error("Failed to fetch tenant.");
  }
};

/**
 * Fetches all tenant documents.
 * @returns {Promise<Array<object>>} An array of tenant objects.
 * @throws {Error} On database error.
 */
export const getAllTenants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "companies"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all tenants:", error);
    throw new Error("Failed to fetch all tenants.");
  }
};

/**
 * Updates an existing tenant document.
 * @param {string} tenantId - The ID of the tenant to update.
 * @param {object} updatedData - The data to update.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 */
export const updateTenant = async (tenantId, updatedData) => {
  if (!tenantId) throw new Error("Tenant ID is required.");
  if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Update data is required.");
  const tenantDocRef = doc(db, "companies", tenantId);
  const sanitizedData = sanitizeObject(updatedData);
  try {
    await updateDoc(tenantDocRef, sanitizedData);
  } catch (error) {
    console.error(`Error updating tenant ${tenantId}:`, error);
    throw new Error("Failed to update tenant.");
  }
};

/**
 * Deletes a tenant document from Firestore.
 * @param {string} tenantId - The ID of the tenant to delete.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 */
export const deleteTenant = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant ID is required.");
  const tenantDocRef = doc(db, "companies", tenantId);
  try {
    await deleteDoc(tenantDocRef);
  } catch (error) {
    console.error(`Error deleting tenant ${tenantId}:`, error);
    throw new Error("Failed to delete tenant.");
  }
};


// ============================================================================
// SERVICE-RELATED FUNCTIONS (Subcollection of Company)
// ============================================================================

/**
 * Creates a new service for a specific company.
 * Services are stored in a subcollection: /companies/{companyId}/services.
 * @param {string} companyId - The ID of the parent company.
 * @param {object} serviceData - The data for the new service.
 * @returns {Promise<string>} The ID of the newly created service.
 * @throws {Error} On validation or database error.
 * @example
 *   const newServiceId = await createService('tenantId123', { name: 'Window Cleaning', price: 1500 });
 */
export const createService = async (companyId, serviceData) => {
    if (!companyId) throw new Error("Company ID is required to create a service.");
    if (!serviceData || !serviceData.name) throw new Error("Service data with a name is required.");

    // Define the path to the 'services' subcollection for the given company.
    const servicesCollectionRef = collection(db, 'companies', companyId, 'services');
    
    // Sanitize the service data before saving.
    const sanitizedData = sanitizeObject(serviceData);
    
    try {
        const docRef = await addDoc(servicesCollectionRef, {
            ...sanitizedData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error creating service for company ${companyId}:`, error);
        throw new Error("Failed to create service.");
    }
};

/**
 * Fetches all services for a specific company.
 * @param {string} companyId - The ID of the company whose services to fetch.
 * @returns {Promise<Array<object>>} An array of service objects, each including their ID.
 * @throws {Error} On validation or database error.
 * @example
 *   const services = await getAllServicesForCompany('tenantId123');
 */
export const getAllServicesForCompany = async (companyId) => {
    if (!companyId) throw new Error("Company ID is required to fetch services.");
    
    const servicesCollectionRef = collection(db, 'companies', companyId, 'services');
    // Optional: Order services by creation date.
    const q = query(servicesCollectionRef, orderBy('createdAt', 'desc'));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching services for company ${companyId}:`, error);
        throw new Error("Failed to fetch services.");
    }
};

/**
 * Updates a specific service within a company's services subcollection.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} serviceId - The ID of the service to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 * @example
 *   await updateService('tenantId123', 'serviceId456', { price: 1600 });
 */
export const updateService = async (companyId, serviceId, updatedData) => {
    if (!companyId || !serviceId) throw new Error("Company ID and Service ID are required.");
    if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Update data is required.");

    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    const sanitizedData = sanitizeObject(updatedData);

    try {
        await updateDoc(serviceDocRef, sanitizedData);
    } catch (error) {
        console.error(`Error updating service ${serviceId} for company ${companyId}:`, error);
        throw new Error("Failed to update service.");
    }
};

/**
 * Deletes a specific service from a company's services subcollection.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} serviceId - The ID of the service to delete.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 * @example
 *   await deleteService('tenantId123', 'serviceId456');
 */
export const deleteService = async (companyId, serviceId) => {
    if (!companyId || !serviceId) throw new Error("Company ID and Service ID are required.");

    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);

    try {
        await deleteDoc(serviceDocRef);
    } catch (error) {
        console.error(`Error deleting service ${serviceId} for company ${companyId}:`, error);
        throw new Error("Failed to delete service.");
    }
};
