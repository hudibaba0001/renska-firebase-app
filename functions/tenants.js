// functions/tenants.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const yup = require('yup');

// Initialize admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * A secure, server-side callable function to create a new tenant.
 * This function handles authentication, authorization, validation, and database interaction.
 *
 * - Expects: An object with tenant data (name, slug, plan, etc.)
 * - Returns: { success: true, tenantId: "new tenant's ID" }
 * - Throws: 'unauthenticated', 'permission-denied', 'invalid-argument', 'already-exists'
 */
exports.createTenant = functions.https.onCall(async (data, context) => {
    // 1. Authentication & Authorization: Check if the user is a logged-in superAdmin.
    if (!context.auth || !context.auth.token.superAdmin) {
        throw new functions.https.HttpsError(
            'permission-denied', 
            'You must be a super admin to perform this operation.'
        );
    }

    // 2. Validation: Define a strict schema for the incoming data using yup.
    const schema = yup.object({
        name: yup.string().required().trim().min(2).max(100),
        slug: yup.string().required().trim().lowercase().matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.').min(2).max(50),
        plan: yup.string().required().oneOf(['basic', 'standard', 'premium']),
        trialDays: yup.number().integer().min(0).max(90),
        contactName: yup.string().required().trim().min(2).max(100),
        contactEmail: yup.string().required().email(),
    });

    try {
        await schema.validate(data, { abortEarly: false });
    } catch (error) {
        // Combine all validation errors into one message.
        const errorMessages = error.inner.map(e => e.message).join(', ');
        throw new functions.https.HttpsError('invalid-argument', `Invalid data: ${errorMessages}`);
    }

    // 3. Business Logic: Check if the slug is already in use.
    const slug = data.slug;
    const companiesRef = db.collection('companies');
    const existingCompany = await companiesRef.where('slug', '==', slug).limit(1).get();

    if (!existingCompany.empty) {
        throw new functions.https.HttpsError('already-exists', `The URL slug "${slug}" is already taken. Please choose another.`);
    }

    // 4. Database Interaction: Create the new tenant document.
    try {
        const newTenantRef = await companiesRef.add({
            name: data.name,
            slug: data.slug,
            contact: {
                name: data.contactName,
                email: data.contactEmail,
            },
            subscription: {
                plan: data.plan,
                status: 'trialing',
                trialEnds: admin.firestore.Timestamp.fromDate(new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000)),
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deleted: false,
            createdBy: context.auth.uid, // Audit trail
        });

        return { success: true, tenantId: newTenantRef.id };

    } catch (error) {
        console.error('Error creating tenant in Firestore:', error);
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while creating the tenant.');
    }
});
