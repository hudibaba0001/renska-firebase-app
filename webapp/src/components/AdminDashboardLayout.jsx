import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init'
import { useAuth } from '../context/AuthContext'
import { 
  Button, 
  Avatar, 
  Dropdown, 
  Card, 
  Spinner, 
  Alert, 
  Badge, 
  Breadcrumb,
  TextInput,
  Modal
} from 'flowbite-react'
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
  CreditCardIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminDashboardLayout() {
  const { companyId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications] = useState([
    {
      id: 1,
      title: 'New booking received',
      message: 'Anna Andersson booked Hemstädning Premium',
      time: '2 minutes ago',
      unread: true,
      type: 'booking'
    },
    {
      id: 2,
      title: 'Payment processed',
      message: 'Erik Svensson - 1,200 kr',
      time: '1 hour ago',
      unread: true,
      type: 'payment'
    },
    {
      id: 3,
      title: 'Calculator published',
      message: 'Window Cleaning calculator is now live',
      time: '2 hours ago',
      unread: false,
      type: 'system'
    }
  ])

  // Check for super admin impersonation
  const impersonationData = JSON.parse(sessionStorage.getItem('superAdminImpersonation') || 'null')
  const isImpersonating = impersonationData && impersonationData.tenantId === companyId

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
    } else if (pathSegments.includes('bookings')) {
      items.push({ label: 'Bookings', href: `/admin/${companyId}/bookings` })
    } else if (pathSegments.includes('analytics')) {
      items.push({ label: 'Analytics', href: `/admin/${companyId}/analytics` })
    } else if (pathSegments.includes('billing')) {
      items.push({ label: 'Billing', href: `/admin/${companyId}/billing` })
    } else if (pathSegments.includes('forms')) {
      items.push({ label: 'Form Builder', href: `/admin/${companyId}/forms` })
    } else if (pathSegments.includes('customers')) {
      items.push({ label: 'Customers', href: `/admin/${companyId}/customers` })
    }
    
    return items
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/config')) return 'Calculator Configuration'
    if (path.includes('/bookings')) return 'Booking Management'
    if (path.includes('/analytics')) return 'Analytics & Reports'
    if (path.includes('/billing')) return 'Billing & Subscriptions'
    if (path.includes('/customers')) return 'Customer Management'
    if (path.includes('/forms')) return 'Form Builder'
    return 'Dashboard Overview'
  }

  const unreadCount = notifications.filter(n => n.unread).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96 text-center shadow-xl">
          <div className="flex flex-col items-center p-6">
            <div className="relative">
              <Spinner size="xl" className="text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              Loading SwedPrime Dashboard
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we fetch your company information...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    // Still show the beautiful layout even with company error
    setCompany({ 
      companyName: 'Demo Company (Not Found)', 
      serviceType: 'cleaning' 
    })
    setError('')
  }

  const navigationItems = [
    {
      label: 'Dashboard',
      href: `/admin/${companyId}`,
      icon: HomeIcon,
      exact: true,
      badge: null,
      description: 'Overview and quick actions'
    },
    {
      label: 'Form Builder',
      href: `/admin/${companyId}/forms`,
      icon: CogIcon,
      badge: null,
      description: 'Create booking calculators'
    },
    {
      label: 'Bookings',
      href: `/admin/${companyId}/bookings`,
      icon: DocumentTextIcon,
      badge: '12',
      description: 'Manage customer bookings'
    },
    {
      label: 'Analytics',
      href: `/admin/${companyId}/analytics`,
      icon: ChartBarIcon,
      badge: null,
      description: 'Performance metrics and reports'
    },
    {
      label: 'Customers',
      href: `/admin/${companyId}/customers`,
      icon: UserGroupIcon,
      badge: null,
      description: 'Customer management'
    },
    {
      label: 'Settings',
      href: `/admin/${companyId}/config`,
      icon: CogIcon,
      badge: null,
      description: 'Configuration and settings'
    },
    {
      label: 'Billing',
      href: `/admin/${companyId}/billing`,
      icon: CreditCardIcon,
      badge: null,
      description: 'Subscription and payments'
    }
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? '#374151' : '#ffffff',
              color: darkMode ? '#ffffff' : '#000000',
            },
          }}
        />
        
        {/* Super Admin Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-red-600 text-white px-4 py-2 text-sm flex items-center justify-between relative z-50">
            <div className="flex items-center gap-2">
              <span>🦹‍♀️</span>
              <span>
                Super Admin Mode: Impersonating <strong>{impersonationData.tenantName}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('superAdminImpersonation');
                window.location.href = '/super-admin/tenants';
              }}
              className="underline hover:no-underline"
            >
              Exit Impersonation
            </button>
          </div>
        )}
        
        {/* Top Navigation Bar */}
        <nav className={`fixed ${isImpersonating ? 'top-10' : 'top-0'} z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700`}>
          <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start rtl:justify-end">
                {/* Mobile menu button - only visible on mobile */}
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <span className="sr-only">Toggle sidebar</span>
                  {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                </Button>
                
                {/* Logo */}
                <Link to="/" className="flex items-center ml-2 md:mr-24">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                    SwedPrime
                  </span>
                </Link>
              </div>
              
              {/* Right side items */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </Button>
                
                {/* Dark mode toggle */}
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </Button>
                
                {/* Notifications */}
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <span
                      className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    >
                      <BellIcon className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900">
                          {unreadCount}
                        </div>
                      )}
                    </span>
                  }
                >
                  <Dropdown.Header>
                    <div className="flex items-center justify-between">
                      <span className="block text-sm font-medium">Notifications</span>
                      <Badge color="info" size="sm">{unreadCount} new</Badge>
                    </div>
                  </Dropdown.Header>
                  {notifications.slice(0, 3).map((notification) => (
                    <Dropdown.Item key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start space-x-3 p-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item>
                    <span className="block text-sm text-center text-gray-500 dark:text-gray-400">
                      View all notifications
                    </span>
                  </Dropdown.Item>
                </Dropdown>
                
                {/* User menu */}
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <Avatar
                      alt="Admin"
                      img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                      rounded
                      size="sm"
                      className="cursor-pointer"
                    />
                  }
                >
                  <Dropdown.Header>
                    <span className="block text-sm font-medium">
                      {user?.email || 'Admin User'}
                    </span>
                    <span className="block text-sm text-gray-500 truncate">
                      {user?.email || 'admin@swedprime.com'}
                    </span>
                  </Dropdown.Header>
                  <Dropdown.Item icon={UserIcon}>
                    Profile Settings
                  </Dropdown.Item>
                  <Dropdown.Item icon={BuildingOfficeIcon}>
                    Company Settings
                  </Dropdown.Item>
                  <Dropdown.Item icon={CreditCardIcon}>
                    Billing
                  </Dropdown.Item>
                  <Dropdown.Item icon={QuestionMarkCircleIcon}>
                    Help & Support
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item icon={ArrowRightOnRectangleIcon}>
                    Sign Out
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile overlay - only for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar - Always visible on desktop, toggleable on mobile */}
        <aside className={`
          fixed ${isImpersonating ? 'top-20' : 'top-0'} left-0 z-40 w-64 h-screen ${isImpersonating ? 'pt-10' : 'pt-20'} transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-gray-200 
          dark:bg-gray-800 dark:border-gray-700
        `}>
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
            {/* Company Info Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{company?.companyName || 'Company'}</h3>
                  <p className="text-xs text-blue-100 capitalize">{company?.serviceType || 'Cleaning Service'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge color="success" size="sm">Pro Plan</Badge>
                <Link
                  to={`/booking/${companyId}`}
                  className="text-xs text-blue-100 hover:text-white underline"
                >
                  View Live Form →
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group flex items-center w-full p-2 text-sm font-normal rounded-lg transition duration-75 ${
                      isActive
                        ? 'text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                    }`
                  }
                  onClick={() => {
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false)
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className="ml-3 flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <Badge color="info" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Need Help?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-200 mb-3">
                  Check our documentation or contact support for assistance.
                </p>
                <Button size="xs" color="blue" className="w-full">
                  Get Support
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Always has left margin on desktop to account for fixed sidebar */}
        <div className={`min-h-screen transition-all duration-300 ease-in-out ${isImpersonating ? 'pt-20' : 'pt-16'} pl-0 lg:pl-64`}>
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <Breadcrumb className="mb-2">
                {getBreadcrumbItems().map((item, index) => (
                  <Breadcrumb.Item key={index} href={item.href}>
                    {item.label}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>

            {/* Page Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Outlet context={{ company }} />
            </motion.div>
          </div>
        </div>

        {/* Search Modal */}
        <Modal show={searchOpen} onClose={() => setSearchOpen(false)} size="2xl">
          <Modal.Header>Quick Search</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <TextInput
                icon={MagnifyingGlassIcon}
                placeholder="Search bookings, customers, calculators..."
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                <p>Try searching for:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Customer names (e.g., "Anna Andersson")</li>
                  <li>• Booking IDs (e.g., "BK-2024-001")</li>
                  <li>• Calculator names (e.g., "Premium Cleaning")</li>
                </ul>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  )
} 