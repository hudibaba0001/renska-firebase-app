import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/init';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

// Import the getUserProfile function from services
import { getUserProfile } from '../services/firestore';

// Create context object
const AuthContext = createContext({ user: null, userProfile: null, loading: true, logout: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          // Get user profile from Firestore
          const userProfile = await getUserProfile(u.uid);
          
          // Merge auth data with profile data
          const fullUser = {
            ...u,
            ...userProfile
          };
          
          setUser(fullUser);
          setLoading(false);
        } catch (error) {
          // Log error without exposing sensitive data
          console.error('Error fetching user profile:', error.message);
          // Still set basic auth data even if profile fetch fails
          setUser(u);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, profileError, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
