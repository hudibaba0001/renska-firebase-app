// webapp/src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/init';
// Import the new centralized function for fetching user profiles.
// This helps in abstracting the data fetching logic from the component.
import { getUserProfile } from '../services/firestore';

/**
 * @typedef {object} UserProfile
 * This type definition helps with code completion and clarity,
 * representing the structure of a user's profile data from Firestore.
 */

/**
 * @typedef {object} AuthState
 * @property {object|null} user - The Firebase auth user object combined with their Firestore profile.
 * @property {boolean} loading - True while checking the auth state, false otherwise.
 * @property {function} logout - Function to sign the user out.
 */

// Create a React Context for authentication.
// This context will provide authentication state and functions to the rest of the app.
// We initialize it with a default shape to help with autocompletion and testing.
const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
});

/**
 * The AuthProvider component is a "provider" that wraps parts of the application
 * that need access to authentication state. It manages the user's session,
 * fetching their data, and providing it to all child components.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 */
export function AuthProvider({ children }) {
  // State to hold the authenticated user object (auth data + profile data).
  const [user, setUser] = useState(null);
  // State to indicate if the authentication status is still being determined.
  // This is useful for showing loading screens and preventing content flashes.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is a Firebase listener that triggers whenever the user's
    // login state changes (login, logout).
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If the user is logged in, we fetch their profile data from Firestore.
        // This combines the authentication data with application-specific data.
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          // We merge the Firebase auth object with the Firestore profile.
          // The spread syntax (...) is used to create a new object containing properties from both.
          setUser({ ...firebaseUser, ...userProfile });
        } catch (error) {
          // If fetching the profile fails, we log the error and only set the basic
          // Firebase user data. This prevents the app from crashing.
          console.error("Failed to fetch user profile, proceeding with auth data only.", error);
          setUser(firebaseUser);
        }
      } else {
        // If the user is logged out, we reset the user state to null.
        setUser(null);
      }
      // Once we have a definitive answer on the user's auth state, we set loading to false.
      setLoading(false);
    });

    // The returned function from useEffect is a cleanup function.
    // It unsubscribes from the onAuthStateChanged listener when the component unmounts
    // to prevent memory leaks.
    return () => unsubscribe();
  }, []); // The empty dependency array [] means this effect runs only once on component mount.

  /**
   * Logs the user out of the application using Firebase Authentication.
   * This function is provided through the context to any component that needs it.
   */
  const logout = async () => {
    try {
      // Use the signOut function from the Firebase auth SDK.
      await signOut(auth);
      // After signing out, the onAuthStateChanged listener will automatically
      // update the user state to null.
    } catch (error) {
      console.error('Error signing out:', error);
      // Re-throw the error so it can be caught by the calling component if needed,
      // for example, to show a user notification.
      throw error;
    }
  };

  // The Provider component makes the auth state (user, loading) and logout function
  // available to any child component that calls the `useAuth` hook.
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * A custom hook for consuming the AuthContext.
 * This is the standard and recommended way to access the context's value.
 * It simplifies the process of using the context in functional components.
 *
 * @returns {AuthState} The current authentication state and functions.
 */
export const useAuth = () => useContext(AuthContext);
