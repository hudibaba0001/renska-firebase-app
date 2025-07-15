// webapp/src/services/firestore.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/init";
import { logger } from "../utils/logger";

/**
 * Fetches a user's profile from the Firestore database.
 * This function encapsulates the logic for retrieving a user document from the 'users' collection.
 * It's designed to be used throughout the application wherever user data is needed.
 *
 * @param {string} userId - The unique ID of the user whose profile is to be fetched.
 *   This ID is typically obtained from the Firebase Auth user object.
 * @returns {Promise<object|null>} A promise that resolves with the user's data object if the
 *   document exists. If the document does not exist, it resolves with null.
 * @throws {Error} Throws an error if the `userId` is not provided, or if there is an
 *   issue with the Firestore database connection or the query itself. This allows for
 *   robust error handling in the calling components.
 */
export const getUserProfile = async (userId) => {
  // Input validation: Ensure a userId is provided before proceeding.
  // This is a crucial security and stability check.
  if (!userId) {
    throw new Error("User ID is required to fetch a user profile.");
  }

  // Create a document reference to the specific user's document in the 'users' collection.
  // This reference points to the exact location of the data in Firestore.
  const userDocRef = doc(db, "users", userId);

  try {
    // Asynchronously fetch the document snapshot from Firestore.
    const docSnap = await getDoc(userDocRef);

    // Check if the document snapshot contains data.
    if (docSnap.exists()) {
      // If the document exists, return the data contained within it.
      return docSnap.data();
    } else {
      // If no document is found for the given userId, it's not necessarily an error,
      // but it's important to handle this case. We log a warning for debugging purposes.
      logger.warn('FirestoreService', `No user profile found for user ID: ${userId}`);
      return null;
    }
  } catch (error) {
    // If any error occurs during the Firestore operation, we log it for debugging.
    // Re-throwing the error allows the calling function to implement its own error handling logic,
    // such as showing a notification to the user.
    logger.error('FirestoreService', "Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile from Firestore.");
  }
};
