import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/init'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-xl">R</span>
            <span className="text-xl font-bold text-blue-700 tracking-tight">Reniska</span>
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4">
          <NavLink
            to="/booking/reniska"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md font-medium transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`
            }
          >
            Book Service
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/admin/reniska"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md font-medium transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`
                }
              >
                Admin Dashboard
              </NavLink>
              <button
                onClick={() => signOut(auth)}
                className="px-3 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-50 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md font-medium transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`
                }
              >
                Admin Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md font-medium transition ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-green-50'}`
                }
              >
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
} 