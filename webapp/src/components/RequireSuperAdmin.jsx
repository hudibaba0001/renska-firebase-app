import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner, Alert } from 'flowbite-react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function RequireSuperAdmin({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isCheckingClaims, setIsCheckingClaims] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function checkSuperAdminClaims() {
      if (!user) {
        setIsCheckingClaims(false)
        return
      }

      try {
        // First check custom claims (for production)
        const idTokenResult = await user.getIdTokenResult()
        const claims = idTokenResult.claims

        if (claims.superAdmin) {
          setIsSuperAdmin(true)
          setError(null)
          setIsCheckingClaims(false)
          return
        }

        // Fallback: Check Firestore for super admin status (for development)
        const { doc, getDoc, getFirestore } = await import('firebase/firestore')
        const db = getFirestore()
        const superAdminDoc = await getDoc(doc(db, 'superAdminUsers', user.uid))
        
        if (superAdminDoc.exists() && superAdminDoc.data().isSuperAdmin) {
          setIsSuperAdmin(true)
          setError(null)
        } else {
          setIsSuperAdmin(false)
          setError(null)
        }
      } catch (err) {
        console.error('Error checking super admin claims:', err)
        setError('Failed to verify admin privileges')
        setIsSuperAdmin(false)
      } finally {
        setIsCheckingClaims(false)
      }
    }

    if (user) {
      checkSuperAdminClaims()
    } else {
      setIsCheckingClaims(false)
    }
  }, [user])

  // Show loading spinner while checking authentication and claims
  if (loading || isCheckingClaims) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600">Verifying admin privileges...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Show error if there was a problem checking claims
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full">
          <Alert color="failure" icon={ExclamationTriangleIcon}>
            <span className="font-medium">Access Error</span>
            <p className="mt-2">{error}</p>
            <p className="mt-2 text-sm">Please try refreshing the page or contact support.</p>
          </Alert>
        </div>
      </div>
    )
  }

  // Show access denied if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full text-center">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have super-administrator privileges to access this area.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                Go Back
              </button>
              <a
                href="/"
                className="block w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and has super admin privileges
  return children
} 