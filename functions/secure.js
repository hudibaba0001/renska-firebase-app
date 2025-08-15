// functions/secure.js
const functions = require('firebase-functions');
const CryptoJS = require('crypto-js');
const yup = require('yup');

// Securely retrieve the encryption key from Firebase Functions configuration.
// This key is NOT available on the client-side.
let encryptionKey;
try {
    encryptionKey = functions.config().app.encryption_key;
} catch (error) {
    console.error('CRITICAL: Could not retrieve functions.config().app.encryption_key. Ensure it is set by running: firebase functions:config:set app.encryption_key="YOUR_SECURE_KEY"');
}

if (!encryptionKey || encryptionKey.length < 32) {
    console.error('CRITICAL: app.encryption_key must be set in Firebase config and be at least 32 characters long.');
}

/**
 * A callable function to encrypt sensitive data on the server.
 * - Expects: { data: "string to encrypt" }
 * - Returns: { encryptedData: "encrypted string" }
 * - Throws: 'unauthenticated', 'invalid-argument'
 */
exports.encryptData = functions.https.onCall(async (data, context) => {
    // 1. Authentication: Ensure the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this operation.');
    }

    // 2. Validation: Ensure the input is a non-empty string.
    const schema = yup.object({
        data: yup.string().required().min(1),
    });

    try {
        await schema.validate(data);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid input: ${error.message}`);
    }
    
    // 3. Authorization: (Placeholder) In a real app, you would check if this user
    // has permission to encrypt data (e.g., they are an admin of a specific company).
    // For now, we just require authentication.

    // 4. Encryption
    if (!encryptionKey) {
         console.error('Encryption key is not configured. Cannot proceed.');
         throw new functions.https.HttpsError('internal', 'The server is not configured for encryption.');
    }

    try {
        const encryptedData = CryptoJS.AES.encrypt(data.data.trim(), encryptionKey).toString();
        return { encryptedData };
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to encrypt data due to a server error.');
    }
});

/**
 * A callable function to decrypt sensitive data on the server.
 * - Expects: { encryptedData: "string to decrypt" }
 * - Returns: { data: "decrypted string" }
 * - Throws: 'unauthenticated', 'invalid-argument'
 */
exports.decryptData = functions.https.onCall(async (data, context) => {
    // 1. Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to perform this operation.');
    }

    // 2. Validation
    const schema = yup.object({
        encryptedData: yup.string().required().min(1),
    });

    try {
        await schema.validate(data);
    } catch (error) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid input: ${error.message}`);
    }

    // 3. Authorization (Placeholder)
    // Add role/permission checks here.

    // 4. Decryption
    if (!encryptionKey) {
         console.error('Encryption key is not configured. Cannot proceed.');
         throw new functions.https.HttpsError('internal', 'The server is not configured for encryption.');
    }
    
    try {
        const bytes = CryptoJS.AES.decrypt(data.encryptedData, encryptionKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            throw new Error('Decryption resulted in an empty string. The key may be incorrect or the data corrupted.');
        }

        return { data: decryptedData };
    } catch (error) {
        console.error('Decryption failed:', error);
        // Do not leak specific error details to the client.
        throw new functions.https.HttpsError('internal', 'Failed to decrypt data. The data may be corrupt or the operation is not permitted.');
    }
});
