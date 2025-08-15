// functions/bookings.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const yup = require('yup');
const { addWeeks, addMonths, setDate, lastDayOfMonth } = require('date-fns');

// Initialize admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * A secure, server-side callable function to create a series of recurring bookings.
 * This function handles all date calculations on the server to prevent race conditions and clock-skew issues.
 *
 * - Expects: An object with the initial booking data and recurrence rules.
 * - Returns: { success: true, bookingIds: [...] }
 * - Throws: 'unauthenticated', 'permission-denied', 'invalid-argument'
 */
exports.createRecurringBookings = functions.https.onCall(async (data, context) => {
    // 1. Authentication & Authorization
    if (!context.auth || !context.auth.token.adminOf || !context.auth.token.adminOf.includes(data.companyId)) {
        throw new functions.https.HttpsError(
            'permission-denied', 
            'You must be an admin of this company to perform this operation.'
        );
    }

    // 2. Validation
    const schema = yup.object({
        companyId: yup.string().required(),
        initialBooking: yup.object({
            customerId: yup.string().required(),
            serviceId: yup.string().required(),
            price: yup.number().positive().required(),
            // Add other fields from the original bookingData here
        }),
        recurrence: yup.object({
            frequency: yup.string().required().oneOf(['weekly', 'monthly']),
            occurrences: yup.number().integer().min(2).max(52), // At least 2 for a series
            startDate: yup.date().required(),
        }),
    });

    try {
        await schema.validate(data, { abortEarly: false });
    } catch (error) {
        const errorMessages = error.inner.map(e => e.message).join(', ');
        throw new functions.https.HttpsError('invalid-argument', `Invalid data: ${errorMessages}`);
    }

    // 3. Server-Side Date Calculation & Database Interaction
    const { companyId, initialBooking, recurrence } = data;
    const bookingsRef = db.collection('companies').doc(companyId).collection('bookings');
    const batch = db.batch();
    const bookingIds = [];
    
    let currentDate = recurrence.startDate;
    const originalDay = currentDate.getDate();

    for (let i = 0; i < recurrence.occurrences; i++) {
        const docRef = bookingsRef.doc(); // Auto-generate ID
        
        const newBookingData = {
            ...initialBooking,
            companyId: companyId,
            date: admin.firestore.Timestamp.fromDate(currentDate),
            isRecurring: true,
            recurrence: {
                frequency: recurrence.frequency,
                occurrenceNumber: i + 1,
                totalOccurrences: recurrence.occurrences,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deleted: false,
            createdBy: context.auth.uid,
        };

        batch.set(docRef, newBookingData);
        bookingIds.push(docRef.id);

        // Calculate the next date securely on the server
        if (recurrence.frequency === 'weekly') {
            currentDate = addWeeks(currentDate, 1);
        } else { // monthly
            currentDate = addMonths(currentDate, 1);
            // Handle month-end cases correctly (e.g., Jan 31 -> Feb 28)
            const lastDay = lastDayOfMonth(currentDate).getDate();
            currentDate = setDate(currentDate, Math.min(originalDay, lastDay));
        }
    }

    try {
        await batch.commit();
        return { success: true, bookingIds };
    } catch (error) {
        console.error('Error committing recurring bookings batch:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create recurring bookings.');
    }
});
