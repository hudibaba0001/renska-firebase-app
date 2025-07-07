// src/pages/BookingPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db }                           from '../firebase/init'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import BookingCalculator from '../components/BookingCalculator'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/init'

export default function BookingPage() {
  const { companyId } = useParams()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  console.log('🔧 BookingPage rendered with companyId:', companyId)

  useEffect(() => {
    console.log('🔧 useEffect triggered for companyId:', companyId)
    async function loadConfig() {
      try {
        console.log('🔧 Loading config for companyId:', companyId)
        const ref  = doc(db, 'companies', companyId)
        const snap = await getDoc(ref)
        console.log('🔧 Firestore response:', snap.exists() ? 'exists' : 'not found')
        if (!snap.exists()) {
          setError(`No config found for "${companyId}".`)
        } else {
          setConfig(snap.data())
        }
      } catch (e) {
        console.error('🔧 Error loading config:', e)
        setError('Failed to load configuration.')
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [companyId])

  console.log('🔧 Current state - loading:', loading, 'error:', error, 'config:', config)

  if (loading) {
    console.log('🔧 Rendering loading state')
    return <div>Loading configuration…</div>
  }

  if (error) {
    console.log('🔧 Rendering error state:', error)
    return <div className="text-red-600">{error}</div>
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Booking for: <span className="capitalize">{companyId}</span>
        </h1>
        <BookingCalculator />
      </div>
    </div>
  )
}

// --- AdminDashboard with search/filter and details modal ---
export function AdminDashboard() {
  const { companyId } = useParams()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true)
      setError('')
      try {
        const q = query(
          collection(db, 'bookings'),
          where('service', '!=', ''),
          orderBy('created', 'desc')
        )
        const snap = await getDocs(q)
        setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (e) {
        setError('Failed to load bookings.')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [companyId])

  // Filter bookings by search and service
  const filtered = bookings.filter(b => {
    const matchesZip = search === '' || (b.zip || '').toLowerCase().includes(search.toLowerCase())
    const matchesService = !filterService || b.service === filterService
    return matchesZip && matchesService
  })
  const allServices = Array.from(new Set(bookings.map(b => b.service).filter(Boolean)))

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.error('Sign out failed', e)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Admin Dashboard: {companyId}</h1>
          <div className="flex gap-2">
            <Link
              to={`/admin/${companyId}/config`}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Edit Price Calculator
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            className="border rounded p-2 flex-1 min-w-[180px]"
            placeholder="Search by ZIP code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border rounded p-2 min-w-[180px]"
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
          >
            <option value="">All services</option>
            {allServices.map(svc => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>
        </div>
        {loading && <div>Loading bookings…</div>}
        {error && <div className="text-red-600">{error}</div>}
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Sqm</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">ZIP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr
                key={b.id}
                className="odd:bg-gray-50 cursor-pointer hover:bg-blue-50"
                onClick={() => setSelected(b)}
              >
                <td className="p-2 border">{b.created?.toDate?.().toLocaleString?.() || ''}</td>
                <td className="p-2 border">{b.service}</td>
                <td className="p-2 border">{b.sqm}</td>
                <td className="p-2 border">{b.total} kr</td>
                <td className="p-2 border">{b.zip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && <div className="text-gray-500 mt-4">No bookings found.</div>}

        {/* Booking details modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">Booking Details</h2>
              <div className="space-y-2">
                <div><b>Date:</b> {selected.created?.toDate?.().toLocaleString?.() || ''}</div>
                <div><b>Service:</b> {selected.service}</div>
                <div><b>Sqm:</b> {selected.sqm}</div>
                <div><b>Total:</b> {selected.total} kr</div>
                <div><b>ZIP:</b> {selected.zip}</div>
                <div><b>Frequency:</b> {selected.freq}</div>
                <div><b>RUT:</b> {selected.useRut ? 'Yes' : 'No'}</div>
                <div><b>Add-Ons:</b> {selected.chosenAddOns?.length ? selected.chosenAddOns.join(', ') : 'None'}</div>
                <div><b>Window Cleaning:</b> {selected.windowSize || 'None'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
