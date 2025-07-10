import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/init'

<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/init'
// Remove the import for getUserProfile since it no longer exists
// import { getUserProfile } from '../services/firestore'

// Create context object
const AuthContext = createContext({ user: null, userProfile: null, loading: true, logout: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    // Check for super admin impersonation
    const impersonation = sessionStorage.getItem('superAdminImpersonation');
    if (impersonation) {
      const { tenantId, tenantName } = JSON.parse(impersonation);
      // Inject a fake user object for impersonation
      setUser({
        uid: 'super-admin-impersonate',
        email: 'superadmin@impersonate.local',
        displayName: `SuperAdmin (Impersonating ${tenantName})`,
        companyId: tenantId,
        role: 'super-admin-impersonate',
        isImpersonating: true
      });
      setUserProfile({
        companyId: tenantId,
        companyName: tenantName,
        role: 'super-admin-impersonate',
        isImpersonating: true
      });
      setLoading(false);
      return;
    }
    // Subscribe to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(true)
      setProfileError('')
      if (u) {
        try {
          // Replace usage of getUserProfile with a TODO or fallback
          // const profile = await getUserProfile(u.uid)
          // TODO: Implement getUserProfile or use a fallback profile object
          const profile = {};
          setUserProfile(profile)
        } catch {
          // Error handling if needed
        }
      } else {
        setUserProfile(null)
      }
=======
// Create context object
const AuthContext = createContext({ user: null, loading: true, logout: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
>>>>>>> parent of 17b29e4 (refactor: Create Firestore service and refactor AuthContext)
      setLoading(false)
    })
    // Cleanup on unmount
    return unsubscribe
  }, [])

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

<<<<<<< HEAD
export const useAuth = () => useContext(AuthContext)
=======
export const useAuth = () => useContext(AuthContext) 
>>>>>>> parent of 17b29e4 (refactor: Create Firestore service and refactor AuthContext)
