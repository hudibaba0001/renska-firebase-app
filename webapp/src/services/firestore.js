// webapp/src/services/firestore.js

import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";
import { sanitizeObject } from "../utils/security";

// ============================================================================
// USER SERVICE FUNCTIONS
// ============================================================================
export const getUserProfile = async (userId) => { /* ... */ };

// ============================================================================
// TENANT / COMPANY SERVICE FUNCTIONS
// ============================================================================
export const createTenant = async (formData) => { /* ... */ };
export const getTenant = async (tenantId) => { /* ... */ };
export const getAllTenants = async () => { /* ... */ };
export const updateTenant = async (tenantId, updatedData) => { /* ... */ };
export const deleteTenant = async (tenantId) => { /* ... */ };

// ============================================================================
// SERVICE-RELATED FUNCTIONS (Subcollection of Company)
// ============================================================================
export const createService = async (companyId, serviceData) => { /* ... */ };
export const getAllServicesForCompany = async (companyId) => { /* ... */ };
export const updateService = async (companyId, serviceId, updatedData) => { /* ... */ };
export const deleteService = async (companyId, serviceId) => { /* ... */ };


// ============================================================================
// BOOKING-RELATED FUNCTIONS (Subcollection of Company)
// ============================================================================

/**
 * Creates a new booking for a specific company.
 * Bookings are stored in a subcollection: /companies/{companyId}/bookings.
 * @param {string} companyId - The ID of the parent company for the booking.
 * @param {object} bookingData - The data for the new booking.
 * @returns {Promise<string>} The ID of the newly created booking document.
 * @throws {Error} On validation or database error.
 * @example
 *   const newBookingId = await createBooking('tenantId123', { customerName: 'John Doe', ... });
 */
export const createBooking = async (companyId, bookingData) => {
    if (!companyId) throw new Error("Company ID is required to create a booking.");
    if (!bookingData || !bookingData.customerEmail) throw new Error("Booking data with a customer email is required.");

    const bookingsCollectionRef = collection(db, 'companies', companyId, 'bookings');
    const sanitizedData = sanitizeObject(bookingData);

    try {
        const docRef = await addDoc(bookingsCollectionRef, {
            ...sanitizedData,
            status: 'pending', // All new bookings start as pending.
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error creating booking for company ${companyId}:`, error);
        throw new Error("Failed to create booking.");
    }
};

/**
 * Fetches all bookings for a specific company, ordered by creation date.
 * @param {string} companyId - The ID of the company whose bookings to fetch.
 * @returns {Promise<Array<object>>} An array of booking objects, each including their ID.
 * @throws {Error} On validation or database error.
 * @example
 *   const bookings = await getAllBookingsForCompany('tenantId123');
 */
export const getAllBookingsForCompany = async (companyId) => {
    if (!companyId) throw new Error("Company ID is required to fetch bookings.");

    const bookingsCollectionRef = collection(db, 'companies', companyId, 'bookings');
    const q = query(bookingsCollectionRef, orderBy('createdAt', 'desc'));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching bookings for company ${companyId}:`, error);
        throw new Error("Failed to fetch bookings.");
    }
};

/**
 * Updates a specific booking within a company's subcollection.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} bookingId - The ID of the booking to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 * @example
 *   await updateBooking('tenantId123', 'bookingId789', { status: 'confirmed' });
 */
export const updateBooking = async (companyId, bookingId, updatedData) => {
    if (!companyId || !bookingId) throw new Error("Company ID and Booking ID are required.");
    if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Update data is required.");

    const bookingDocRef = doc(db, 'companies', companyId, 'bookings', bookingId);
    const sanitizedData = sanitizeObject(updatedData);

    try {
        await updateDoc(bookingDocRef, {
            ...sanitizedData,
            updatedAt: serverTimestamp() // Always update the timestamp on modification.
        });
    } catch (error) {
        console.error(`Error updating booking ${bookingId}:`, error);
        throw new Error("Failed to update booking.");
    }
};

/**
 * Deletes a specific booking from a company's subcollection.
 * @param {string} companyId - The ID of the parent company.
 * @param {string} bookingId - The ID of the booking to delete.
 * @returns {Promise<void>}
 * @throws {Error} On validation or database error.
 * @example
 *   await deleteBooking('tenantId123', 'bookingId789');
 */
export const deleteBooking = async (companyId, bookingId) => {
    if (!companyId || !bookingId) throw new Error("Company ID and Booking ID are required.");

    const bookingDocRef = doc(db, 'companies', companyId, 'bookings', bookingId);

    try {
        await deleteDoc(bookingDocRef);
    } catch (error) {
        console.error(`Error deleting booking ${bookingId}:`, error);
        throw new Error("Failed to delete booking.");
    }
};
