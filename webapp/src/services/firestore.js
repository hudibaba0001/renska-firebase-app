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
export const createService = async (companyId, serviceData) => { /* ... */ };
export const getAllServicesForCompany = async (companyId) => { /* ... */ };
export const updateService = async (companyId, serviceId, updatedData) => { /* ... */ };
export const deleteService = async (companyId, serviceId) => { /* ... */ };


// ============================================================================
// BOOKING-RELATED FUNCTIONS (Subcollection of Company)
// ============================================================================

/**
 * Creates a new booking with enhanced validation.
 * @param {string} companyId - The ID of the parent company.
 * @param {object} bookingData - The data for the new booking.
 * @returns {Promise<string>} The ID of the new booking.
 * @throws {Error} On validation or database error.
 */
export const createBooking = async (companyId, bookingData) => {
    if (!companyId) throw new Error("Company ID is required to create a booking.");
    
    // **1. Validate Booking Data**
    const { customerInfo, serviceId, totalPrice, status } = bookingData;
    if (!customerInfo || !customerInfo.name || !validateEmail(customerInfo.email)) {
        throw new Error("Valid customer name and email are required.");
    }
    if (!serviceId) {
        throw new Error("A service must be selected for the booking.");
    }
    if (totalPrice === undefined || isNaN(parseFloat(totalPrice)) || totalPrice < 0) {
        throw new Error("Total price must be a non-negative number.");
    }
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        throw new Error("Invalid booking status provided.");
    }

    // **2. Sanitize and Create Document**
    const bookingsCollectionRef = collection(db, 'companies', companyId, 'bookings');
    const sanitizedData = sanitizeObject(bookingData);

    try {
        const docRef = await addDoc(bookingsCollectionRef, {
            ...sanitizedData,
            status: status || 'pending', // Default to pending if not provided
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error creating booking for company ${companyId}:`, error);
        throw new Error("Failed to create booking due to a database error.");
    }
};

export const getAllBookingsForCompany = async (companyId) => { /* ... */ };

/**
 * Updates a specific booking with enhanced validation.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} bookingId - The ID of the booking to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 */
export const updateBooking = async (companyId, bookingId, updatedData) => {
    if (!companyId || !bookingId) throw new Error("Company ID and Booking ID are required.");
    if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Update data is required.");

    // **1. Validate updatedData fields before proceeding**
    const { customerInfo, totalPrice, status } = updatedData;
    if (customerInfo && (customerInfo.name === '' || (customerInfo.email && !validateEmail(customerInfo.email)))) {
         throw new Error("Valid customer name and email are required if customer info is being updated.");
    }
    if (totalPrice !== undefined && (isNaN(parseFloat(totalPrice)) || totalPrice < 0)) {
        throw new Error("Total price must be a non-negative number.");
    }
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        throw new Error("Invalid booking status provided.");
    }

    // **2. Sanitize and Update Document**
    const bookingDocRef = doc(db, 'companies', companyId, 'bookings', bookingId);
    const sanitizedData = sanitizeObject(updatedData);

    try {
        await updateDoc(bookingDocRef, {
            ...sanitizedData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error updating booking ${bookingId}:`, error);
        throw new Error("Failed to update booking due to a database error.");
    }
};

export const deleteBooking = async (companyId, bookingId) => { /* ... */ };
