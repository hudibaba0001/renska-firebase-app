import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init'
import { Sidebar, Button, Avatar, Dropdown, Card, Spinner, Alert, Badge, Breadcrumb } from 'flowbite-react'
import { 
  HomeIcon, 
  CogIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminLayout() {
  const { companyId } = useParams()
  const location = useLocation()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true)
      setError('')
      try {
        const ref = doc(db, 'companies', companyId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setCompany(snap.data())
          toast.success(`Welcome to ${snap.data().companyName}!`)
        } else {
          setError('Company not found.')
          toast.error('Company not found')
        }
      } catch {
        setError('Failed to load company data.')
        toast.error('Failed to load company data')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [companyId])

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const items = [
      { label: 'Dashboard', href: `/admin/${companyId}` }
    ]
    
    if (pathSegments.includes('config')) {
      items.push({ label: 'Configuration', href: `/admin/${companyId}/config` })
    }
    
    return items
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96 text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Company Data</h3>
          <p className="text-gray-500">Please wait while we fetch your company information...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <Alert color="failure" className="mb-4">
            <span className="font-medium">Error!</span> {error}
          </Alert>
          <Button as={Link} to="/" color="gray" className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    )
  }

  const navigationItems = [
    {
      label: 'Dashboard',
      href: `/admin/${companyId}`,
      icon: HomeIcon,
      exact: true,
      badge: null
    },
    {
      label: 'Bookings',
      href: `/admin/${companyId}/bookings`,
      icon: DocumentTextIcon,
      badge: '12'
    },
    {
      label: 'Calculator Config',
      href: `/admin/${companyId}/config`,
      icon: CogIcon,
      badge: null
    },
    {
      label: 'Billing',
      href: `/admin/${companyId}/billing`,
      icon: CreditCardIcon,
      badge: null
    },
    {
      label: 'Analytics',
      href: `/admin/${companyId}/analytics`,
      icon: ChartBarIcon,
      badge: null
    },
    {
      label: 'Customers',
      href: `/admin/${companyId}/customers`,
      icon: UserGroupIcon,
      badge: null
    }
  ]

  return (
    <div className="min-h-screen bg-background font-mono text-gray-900">
      <Toaster position="top-right" />
      
      <div className="flex">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            color="gray"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl
          lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none lg:flex-shrink-0
          transition-transform duration-300 ease-in-out
        `}>
          <div className="flex flex-col h-full">
            {/* Logo and Company Info */}
            <div className="p-6 bg-brand text-white">
              <Link to="/" className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">SwedPrime</h1>
                  <p className="text-sm text-brand-light">Admin Dashboard</p>
                </div>
              </Link>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{company?.companyName}</p>
                    <p className="text-xs text-brand-light capitalize">{company?.serviceType || 'Cleaning Service'}</p>
                  </div>
                  <Badge color="success" size="sm">Active</Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge color="info" size="sm" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar
                      alt="Admin"
                      img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                      rounded
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Admin User</p>
                      <p className="text-xs text-gray-500 truncate">admin@swedprime.com</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm font-medium">Admin User</span>
                  <span className="block text-sm text-gray-500">admin@swedprime.com</span>
                </Dropdown.Header>
                <Dropdown.Item>Profile Settings</Dropdown.Item>
                <Dropdown.Item>Company Settings</Dropdown.Item>
                <Dropdown.Item>Billing</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>Sign Out</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-brand text-white shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Breadcrumb className="mb-2">
                    {getBreadcrumbItems().map((item, index) => (
                      <Breadcrumb.Item key={index} href={item.href}>
                        {item.label}
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                  <h1 className="text-2xl font-bold">
                    {location.pathname.includes('/config') ? 'Calculator Configuration' : 'Dashboard'}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button color="light" size="sm" className="relative">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  </Button>
                  <Button as={Link} to={`/booking/${companyId}`} color="light" size="sm">
                    View Live Form
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 max-w-screen-xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet context={{ company }} />
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="bg-brand-dark text-white p-4 text-center">
            <p className="text-sm">© {new Date().getFullYear()} SwedPrime - {company?.companyName}</p>
          </footer>
        </div>
      </div>
    </div>
  )
} 