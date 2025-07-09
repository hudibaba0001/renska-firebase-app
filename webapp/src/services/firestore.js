// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ... (helpers and other functions) ...
const validateEmail = (email) => { /* ... */ };
const validateSlug = (slug) => { /* ... */ };
export const getUserProfile = async (userId) => { /* ... */ };
export const createTenant = async (formData) => { /* ... */ };
export const getTenant = async (tenantId) => { /* ... */ };
export const getAllTenants = async () => { /* ... */ };
export const updateTenant = async (tenantId, updatedData) => { /* ... */ };
export const deleteTenant = async (tenantId) => { /* ... */ };


// ============================================================================
// SERVICE-RELATED FUNCTIONS (Subcollection of Company)
// ============================================================================

/**
 * Creates a new service for a specific company with enhanced validation.
 * @param {string} companyId - The ID of the parent company.
 * @param {object} serviceData - The data for the new service.
 * @returns {Promise<string>} The ID of the newly created service.
 * @throws {Error} On validation or database error.
 */
export const createService = async (companyId, serviceData) => {
    if (!companyId) throw new Error("Company ID is required to create a service.");
    
    // **1. Validate Service Data**
    const { name, pricingModel, minimumPrice, vatRate } = serviceData;
    if (!name || name.length < 2 || name.length > 100) {
        throw new Error("Service name must be between 2 and 100 characters.");
    }
    if (!pricingModel) { // In a real app, you'd check if it's one of the valid PRICING_MODELS
        throw new Error("A valid pricing model is required.");
    }
    if (minimumPrice !== undefined && (isNaN(parseFloat(minimumPrice)) || minimumPrice < 0)) {
        throw new Error("Minimum price must be a non-negative number.");
    }
     if (vatRate === undefined || isNaN(parseFloat(vatRate)) || vatRate < 0 || vatRate > 1) {
        throw new Error("VAT rate must be a number between 0 and 1 (e.g., 0.25 for 25%).");
    }

    // **2. Sanitize and Create Document**
    const servicesCollectionRef = collection(db, 'companies', companyId, 'services');
    const sanitizedData = sanitizeObject(serviceData);
    
    try {
        const docRef = await addDoc(servicesCollectionRef, {
            ...sanitizedData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error creating service for company ${companyId}:`, error);
        throw new Error("Failed to create service due to a database error.");
    }
};

export const getAllServicesForCompany = async (companyId) => { /* ... */ };

/**
 * Updates a specific service with enhanced validation.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} serviceId - The ID of the service to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 */
export const updateService = async (companyId, serviceId, updatedData) => {
    if (!companyId || !serviceId) throw new Error("Company ID and Service ID are required.");
    if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Update data is required.");

    // **1. Validate updatedData fields before proceeding**
    const { name, pricingModel, minimumPrice, vatRate } = updatedData;
    if (name !== undefined && (name.length < 2 || name.length > 100)) {
        throw new Error("Service name must be between 2 and 100 characters.");
    }
    if (pricingModel !== undefined && !pricingModel) {
        throw new Error("A valid pricing model is required.");
    }
    if (minimumPrice !== undefined && (isNaN(parseFloat(minimumPrice)) || minimumPrice < 0)) {
        throw new Error("Minimum price must be a non-negative number.");
    }
    if (vatRate !== undefined && (isNaN(parseFloat(vatRate)) || vatRate < 0 || vatRate > 1)) {
        throw new Error("VAT rate must be a number between 0 and 1.");
    }

    // **2. Sanitize and Update Document**
    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    const sanitizedData = sanitizeObject(updatedData);

    try {
        await updateDoc(serviceDocRef, {
            ...sanitizedData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error updating service ${serviceId}:`, error);
        throw new Error("Failed to update service due to a database error.");
    }
};

export const deleteService = async (companyId, serviceId) => { /* ... */ };

// ... Booking functions
export const createBooking = async (companyId, bookingData) => { /* ... */ };
export const getAllBookingsForCompany = async (companyId) => { /* ... */ };
export const updateBooking = async (companyId, bookingId, updatedData) => { /* ... */ };
export const deleteBooking = async (companyId, bookingId) => { /* ... */ };
