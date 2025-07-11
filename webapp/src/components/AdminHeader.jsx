import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminHeader({
  darkMode,
  setDarkMode,
  setSearchOpen,
  unreadCount = 0,
  notifications = []
}) {
  return (
    <nav className="fixed top-0 z-50 w-full h-16 bg-white border-b border-gray-200 flex items-center dark:bg-gray-800 dark:border-gray-700 overflow-visible min-w-0">
      <div className="px-3 lg:px-5 lg:pl-3 w-full overflow-visible min-w-0">
        <div className="flex items-center justify-between h-16 w-full min-w-0 overflow-visible">
          {/* Left: Logo only */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center md:mr-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                SwedPrime
              </span>
            </Link>
          </div>

          {/* Right: Search, Dark mode, Notifications, User */}
          <div className="flex items-center space-x-3 flex-shrink-0 border-2 border-red-500 bg-yellow-100 min-w-0 overflow-visible">
            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen && setSearchOpen(true)}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={() => setDarkMode && setDarkMode(!darkMode)}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            {/* Notifications Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none">
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900">
                    {unreadCount}
                  </div>
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-sm font-medium">Notifications</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{unreadCount} new</span>
                    </div>
                    {notifications.length === 0 && (
                      <div className="text-center text-gray-400 py-4">No notifications</div>
                    )}
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <span className={`block text-sm text-center text-gray-500 dark:text-gray-400 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>View all notifications</span>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            {/* User Dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="focus:outline-none">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                  alt="Admin"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-3">
                    <span className="block text-sm font-medium">Admin User</span>
                    <span className="block text-sm text-gray-500 truncate">admin@swedprime.com</span>
                  </div>
                  <div className="py-1">
                    <Menu.Item>{({ active }) => (<span className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>Profile Settings</span>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<span className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>Company Settings</span>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<span className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>Billing</span>)}</Menu.Item>
                    <Menu.Item>{({ active }) => (<span className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>Help & Support</span>)}</Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>{({ active }) => (<span className={`block px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>Sign Out</span>)}</Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
