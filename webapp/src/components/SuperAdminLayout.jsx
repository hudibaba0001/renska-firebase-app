import React, { useState } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Button, 
  Dropdown, 
  Avatar, 
  Badge,
  TextInput
} from 'flowbite-react'
import {
  BuildingOfficeIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  BellIcon,
  HomeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import {
  BuildingOfficeIcon as BuildingOfficeSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon
} from '@heroicons/react/24/solid'

import toast from 'react-hot-toast'

export default function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Navigation items with better organization
  const navigationItems = [
    {
      name: 'Overview',
      href: '/super-admin',
      icon: HomeIcon,
      iconSolid: ChartBarSolidIcon,
      current: location.pathname === '/super-admin',
      description: 'Platform overview and key metrics'
    },
    {
      name: 'Tenants',
      href: '/super-admin/tenants',
      icon: BuildingOfficeIcon,
      iconSolid: BuildingOfficeSolidIcon,
      current: location.pathname.startsWith('/super-admin/tenants'),
      description: 'Manage companies and organizations',
      badge: '12'
    },
    {
      name: 'Plans & Billing',
      href: '/super-admin/plans',
      icon: CreditCardIcon,
      current: location.pathname === '/super-admin/plans',
      description: 'Subscription plans and pricing'
    },
    {
      name: 'Global Config',
      href: '/super-admin/global-config',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothSolidIcon,
      current: location.pathname === '/super-admin/global-config',
      description: 'System-wide configuration'
    },
    {
      name: 'Audit Logs',
      href: '/super-admin/audit-logs',
      icon: DocumentTextIcon,
      current: location.pathname === '/super-admin/audit-logs',
      description: 'Security and activity logs'
    },
    {
      name: 'Users & Roles',
      href: '/super-admin/users',
      icon: UsersIcon,
      current: location.pathname === '/super-admin/users',
      description: 'User management and permissions'
    }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="min-h-screen bg-background font-mono text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-brand text-white">
            <Link to="/super-admin" className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-3">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SwedPrime</h1>
                <p className="text-xs text-brand-light">Super Admin</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <TextInput
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
                sizing="sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.current ? (item.iconSolid || item.icon) : item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    } group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      <IconComponent
                        className={`${
                          item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        } mr-3 h-5 w-5 transition-colors duration-200`}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${item.current ? 'text-brand-light' : 'text-gray-500'} mt-0.5`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge color={item.current ? "info" : "gray"} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <Dropdown
              label={
                <div className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar
                    img={user?.photoURL}
                    alt={user?.displayName || user?.email}
                    rounded
                    size="sm"
                  />
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.displayName || 'Super Admin'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              }
              arrowIcon={false}
              inline
              placement="top"
            >
              <Dropdown.Header>
                <Badge color="failure" size="sm">
                  Super Administrator
                </Badge>
              </Dropdown.Header>
              <Dropdown.Item icon={UserIcon}>
                Profile Settings
              </Dropdown.Item>
              <Dropdown.Item icon={GlobeAltIcon}>
                <Link to="/">Back to Main Site</Link>
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                icon={ArrowLeftOnRectangleIcon}
                onClick={handleLogout}
              >
                Sign out
              </Dropdown.Item>
            </Dropdown>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="bg-brand text-white shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 mr-2"
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                  <h1 className="text-2xl font-bold">
                    {navigationItems.find(item => item.current)?.name || 'Dashboard'}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Quick Actions */}
                  <Button
                    size="sm"
                    onClick={() => navigate('/super-admin/tenants/new')}
                    className="hidden sm:flex font-mono"
                    color="light"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Tenant
                  </Button>
                  
                  {/* Notifications */}
                  <button className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 relative">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 max-w-screen-xl mx-auto w-full">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-brand-dark text-white p-4 text-center">
            <p className="text-sm">© {new Date().getFullYear()} SwedPrime - Super Admin Panel</p>
          </footer>
        </div>
      </div>
    </div>
  )
} 