import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth'
import { auth } from '../firebase/init'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

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
          // Check for super admin custom claims first
          const tokenResult = await getIdTokenResult(u);
          const isSuperAdmin = tokenResult.claims.superAdmin === true;
          
          console.log('=== AUTH DEBUG ===');
          console.log('User UID:', u.uid);
          console.log('User email:', u.email);
          console.log('Auth token claims:', tokenResult.claims);
          console.log('Is super admin:', isSuperAdmin);
          console.log('==================');
          
          if (isSuperAdmin) {
            // User is super admin based on custom claims
            setUserProfile({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              role: 'superAdmin',
              isSuperAdmin: true
            });
            setLoading(false);
            return;
          }
          
          // Fetch user profile from Firestore for regular users
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // If user has a company ID, fetch company data
            if (userData.companyId) {
              const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
              
              if (companyDoc.exists()) {
                const companyData = companyDoc.data();
                
                // Combine user and company data into profile
                setUserProfile({
                  ...userData,
                  companyName: companyData.companyName,
                  plan: companyData.plan || 'basic',
                  role: companyData.adminUid === u.uid ? 'admin' : 'user'
                });
              } else {
                setUserProfile(userData);
              }
            } else {
              setUserProfile(userData);
            }
          } else {
            // No user profile found
            setProfileError('User profile not found');
            setUserProfile({});
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setProfileError('Error fetching user profile');
          setUserProfile({});
        }
      } else {
        setUserProfile(null)
      }
      
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

export const useAuth = () => useContext(AuthContext)
