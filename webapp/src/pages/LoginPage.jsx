import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/init'
import { logger } from '../utils/logger'

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
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const idTokenResult = await userCred.user.getIdTokenResult()
      const claims = idTokenResult.claims || {}

      // Priority: 1) Preserve original redirect, 2) Super Admin, 3) Company Admin, 4) Fallback dashboard
      let target = from

      if (!location.state?.from) {
        if (claims.superAdmin) {
          target = '/super-admin'
        } else {
          // Check Firestore for super admin status (fallback for development)
          const { doc, getDoc, getFirestore } = await import('firebase/firestore')
          const db = getFirestore()
          const superAdminDoc = await getDoc(doc(db, 'superAdminUsers', userCred.user.uid))
          
          if (superAdminDoc.exists() && superAdminDoc.data().isSuperAdmin) {
            target = '/super-admin'
          } else if (claims.adminOf) {
            target = `/admin/${claims.adminOf}`
          } else {
            target = '/admin/companies'
          }
        }
      }

      navigate(target, { replace: true })
    } catch (e) {
      logger.error('LoginPage', 'Login error:', e)
      setError('Invalid email or password.')
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
      </form>
    </div>
  )
} 