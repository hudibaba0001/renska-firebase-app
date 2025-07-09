// webapp/src/context/AuthContext.jsx

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
