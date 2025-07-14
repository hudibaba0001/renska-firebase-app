import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/init'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/reniska'

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Sign in with Firebase Authentication
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const idTokenResult = await userCred.user.getIdTokenResult()
      const claims = idTokenResult.claims || {}

      // Fetch user profile from Firestore
      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid))
      
      if (!userDoc.exists()) {
        setError('User profile not found. Please contact support.')
        setLoading(false)
        return
      }
      
      const userData = userDoc.data()
      
      // Priority: 1) Preserve original redirect, 2) Super Admin, 3) Company Admin, 4) Fallback dashboard
      let target = from

      if (!location.state?.from) {
        if (claims.superAdmin) {
          target = '/super-admin'
        } else {
          // Check Firestore for super admin status
          const superAdminDoc = await getDoc(doc(db, 'superAdminUsers', userCred.user.uid))
          
          if (superAdminDoc.exists() && superAdminDoc.data().isSuperAdmin) {
            target = '/super-admin'
          } else if (userData.companyId) {
            // User has a company ID, redirect to company admin dashboard
            target = `/admin/${userData.companyId}`
          } else {
            target = '/admin/companies'
          }
        }
      }

      navigate(target, { replace: true })
    } catch (e) {
      console.error('Login error:', e)
      
      // Provide more specific error messages
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('Invalid email or password.')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.')
      } else {
        setError(`Login failed: ${e.message}`)
      }
      
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        {error && <div className="mb-4 text-red-600" role="alert">{error}</div>}
        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/pricing" className="text-blue-600 hover:underline">Sign Up</Link>
        </div>
      </form>
    </div>
  )
} 