import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-6">Checking authentication…</div>
  }

  if (!user) {
    // Redirect unauthenticated users to login page, preserving the attempted location
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
} 