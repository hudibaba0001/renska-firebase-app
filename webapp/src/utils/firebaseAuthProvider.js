import { auth } from '../firebase/init';
import { onAuthStateChanged } from 'firebase/auth';

export const createFirebaseAuthProvider = () => {
  return {
    // Called when the user attempts to log in
    login: () => Promise.resolve(),

    // Called when the user clicks on the logout button
    logout: () => Promise.resolve(),

    // Called when the API returns an error
    checkError: () => Promise.resolve(),

    // Called when the user navigates to a new location, to check for authentication
    checkAuth: () => Promise.resolve(),

    // Called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => Promise.resolve({}),

    // Called when the user profile is requested
    getIdentity: () => {
      const user = auth.currentUser;
      if (user) {
        return Promise.resolve({
          id: user.uid,
          fullName: user.displayName || user.email,
          avatar: user.photoURL
        });
      }
      return Promise.resolve({
        id: 'anonymous',
        fullName: 'Anonymous User'
      });
    }
  };
};