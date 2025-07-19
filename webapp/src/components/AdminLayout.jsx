import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init'
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
import { AnimatePresence } from 'framer-motion'
import AdminHeader from './AdminHeader'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminLayout() {
  const { companyId } = useParams()
  const location = useLocation()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96 shadow-xl">
          <div className="p-6">
            <Alert color="failure" className="mb-4">
              <span className="font-medium">Error!</span> {error}
            </Alert>
            <Button as={Link} to="/" color="gray" className="w-full">
              Return to Home
            </Button>
          </div>
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
      badge: null,
      description: 'Overview and quick actions'
    },
    {
      label: 'Bookings',
      href: `/admin/${companyId}/bookings`,
      icon: DocumentTextIcon,
      badge: '12',
      description: 'Manage customer bookings'
    },
    {
      label: 'Calculator Config',
      href: `/admin/${companyId}/config`,
      icon: CogIcon,
      badge: null,
      description: 'Configure pricing calculators'
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
      label: 'Billing',
      href: `/admin/${companyId}/billing`,
      icon: CreditCardIcon,
      badge: null,
      description: 'Subscription and payments'
    }
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} overflow-visible`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-visible">
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
        
        {/* Top Navigation Bar replaced by AdminHeader */}
        <AdminHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setSearchOpen={setSearchOpen}
          unreadCount={unreadCount}
          notifications={notifications}
        />

        {/* Mobile overlay */}
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
        
        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white border-r border-gray-200 lg:translate-x-0
          dark:bg-gray-800 dark:border-gray-700
        `}>
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
            {/* Company Info Card */}
            <div className="mb-6 p-4 rounded-lg text-white custom-company-header" style={{backgroundColor: '#005659', background: '#005659 !important', backgroundImage: 'none !important'}}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-white">{company?.companyName}</h3>
                  <p className="text-xs text-white capitalize">{company?.serviceType || 'Cleaning Service'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge color="success" size="sm">Pro Plan</Badge>
                <Link
                  to={`/booking/${companyId}`}
                  className="text-xs text-white hover:text-gray-200 underline"
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
                  onClick={() => setSidebarOpen(false)}
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

        {/* Main Content */}
        <div className="p-4 lg:ml-64 overflow-y-auto">
          <div className="p-4 mt-14">
            {/* Page Header */}
            <div className="mb-4">
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