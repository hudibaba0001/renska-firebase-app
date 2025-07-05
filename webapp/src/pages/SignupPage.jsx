import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/init'
import { db } from '../firebase/init'
import { doc, getDoc, setDoc } from 'firebase/firestore'

function toCompanyId(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [orgNumber, setOrgNumber] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!companyName || !address || !orgNumber || !adminName || !email || !phone || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const companyId = toCompanyId(companyName)
    try {
      // Check if company already exists
      const companyRef = doc(db, 'companies', companyId)
      const companySnap = await getDoc(companyRef)
      if (companySnap.exists()) {
        setError('A company with this name already exists. Please choose a different name.')
        setLoading(false)
        return
      }
      // Create user
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      // Create company document
      await setDoc(companyRef, {
        companyName,
        address,
        orgNumber,
        adminName,
        adminEmail: email,
        adminPhone: phone,
        adminUid: userCred.user.uid,
        created: new Date(),
        pricePerSqm: 0,
        services: [],
        frequencyMultiplier: {},
        addOns: {},
        windowCleaningPrices: {},
        zipAreas: [],
        rutEnabled: false,
      })
      // Create user profile document
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email,
        name: adminName,
        companyId,
        phone,
        created: new Date(),
      })
      setSuccess('Account and company created! Redirecting…')
      setTimeout(() => navigate(`/admin/${companyId}`), 1500)
    } catch (e) {
      setError(e.message.replace('Firebase:', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up Your Company</h1>
        {error && <div className="mb-4 text-red-600" role="alert">{error}</div>}
        {success && <div className="mb-4 text-green-700" role="alert">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Company Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Organization Number</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={orgNumber}
              onChange={e => setOrgNumber(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Company Address</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Full Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded p-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </div>
      </form>
    </div>
  )
} 