import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/init'
import { useNavigate } from 'react-router-dom'
import { 
  Button, 
  Badge,
  Spinner,
  Card,
  TextInput,
  Select,
  Dropdown,
  Table,
  Avatar,
  Modal,
  Alert,
  Progress
} from 'flowbite-react'
import {
  PlusIcon,
  EyeIcon,
  UserIcon,
  PauseIcon,
  PlayIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  PencilIcon,
  Cog6ToothIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function TenantListPage() {
  const [tenants, setTenants] = useState([])
  const [filteredTenants, setFilteredTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingTestData, setCreatingTestData] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTenants, setSelectedTenants] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    filterAndSortTenants()
  }, [tenants, searchTerm, statusFilter, planFilter, sortBy, sortOrder])

  async function fetchTenants() {
    try {
      setLoading(true)
      const snap = await getDocs(collection(db, 'companies'))
      const tenantsData = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdAt: d.data().created || d.data().createdAt
      }))
      setTenants(tenantsData)
      
      if (tenantsData.length > 0) {
        console.log(`✅ Loaded ${tenantsData.length} tenants`)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      
      if (error.code !== 'permission-denied') {
        toast.error('Failed to load tenants')
      } else {
        toast.error('Access denied: Please check your admin permissions')
      }
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortTenants() {
    let filtered = [...tenants]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        (tenant.companyName || tenant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.adminEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.adminName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tenant => {
        if (statusFilter === 'active') return tenant.subscription?.active
        if (statusFilter === 'suspended') return !tenant.subscription?.active
        return true
      })
    }

    // Apply plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription?.plan === planFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'createdAt') {
        aValue = aValue?.seconds ? new Date(aValue.seconds * 1000) : new Date(aValue)
        bValue = bValue?.seconds ? new Date(bValue.seconds * 1000) : new Date(bValue)
      } else if (sortBy === 'companyName') {
        aValue = (a.companyName || a.name || '').toLowerCase()
        bValue = (b.companyName || b.name || '').toLowerCase()
      } else if (sortBy === 'subscription') {
        aValue = a.subscription?.plan || 'zzz'
        bValue = b.subscription?.plan || 'zzz'
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTenants(filtered)
  }

  async function createTestData() {
    setCreatingTestData(true)
    
    try {
      const testTenants = [
        {
          name: 'Städproffs Stockholm AB',
          companyName: 'Städproffs Stockholm AB',
          slug: 'stadproffs-stockholm',
          rutPercentage: 50,
          adminEmail: 'admin@stadproffs.se',
          adminName: 'Anna Andersson',
          phone: '+46 8 123 456 78',
          address: 'Storgatan 1, 111 51 Stockholm',
          subscription: {
            active: true,
            plan: 'premium',
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          settings: {
            emailNotifications: true,
            bookingConfirmation: true,
            automaticPricing: true
          },
          stats: {
            totalBookings: 247,
            monthlyRevenue: 28450,
            activeCalculators: 3
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Rengöring Plus Göteborg',
          companyName: 'Rengöring Plus Göteborg',
          slug: 'rengoring-plus-gbg',
          rutPercentage: 50,
          adminEmail: 'kontakt@rengoring-plus.se',
          adminName: 'Erik Eriksson',
          phone: '+46 31 987 654 32',
          address: 'Avenyn 42, 411 36 Göteborg',
          subscription: {
            active: true,
            plan: 'standard',
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          settings: {
            emailNotifications: true,
            bookingConfirmation: true,
            automaticPricing: false
          },
          stats: {
            totalBookings: 156,
            monthlyRevenue: 18750,
            activeCalculators: 2
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Hemstäd Malmö',
          companyName: 'Hemstäd Malmö',
          slug: 'hemstad-malmo',
          rutPercentage: 50,
          adminEmail: 'info@hemstad-malmo.se',
          adminName: 'Maria Svensson',
          phone: '+46 40 555 123 45',
          address: 'Södergatan 15, 211 34 Malmö',
          subscription: {
            active: false,
            plan: 'basic',
            status: 'suspended',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          settings: {
            emailNotifications: false,
            bookingConfirmation: true,
            automaticPricing: true
          },
          stats: {
            totalBookings: 89,
            monthlyRevenue: 0,
            activeCalculators: 1
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]

      for (const tenant of testTenants) {
        await addDoc(collection(db, 'companies'), tenant)
      }

      toast.success(`Created ${testTenants.length} test tenants!`)
      fetchTenants()
    } catch (error) {
      console.error('Error creating test data:', error)
      toast.error('Failed to create test data')
    } finally {
      setCreatingTestData(false)
    }
  }

  async function toggleTenantStatus(tenantId, currentStatus) {
    try {
      const tenantRef = doc(db, 'companies', tenantId)
      await updateDoc(tenantRef, {
        'subscription.active': !currentStatus,
        'subscription.status': !currentStatus ? 'active' : 'suspended',
        'subscription.updatedAt': serverTimestamp()
      })
      
      toast.success(`Tenant ${!currentStatus ? 'activated' : 'suspended'} successfully`)
      fetchTenants()
    } catch (error) {
      console.error('Error updating tenant status:', error)
      toast.error('Failed to update tenant status')
    }
  }

  const handleImpersonate = (tenant) => {
    sessionStorage.setItem('superAdminImpersonation', JSON.stringify({
      tenantId: tenant.id,
      tenantName: tenant.companyName || tenant.name || tenant.id,
      startTime: new Date().toISOString()
    }))
    
    toast.success(`Impersonating ${tenant.companyName || tenant.name}`)
    navigate(`/admin/${tenant.id}`)
  }

  const handleDeleteTenant = (tenant) => {
    setTenantToDelete(tenant)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!tenantToDelete) return
    
    try {
      // In a real app, you'd call a delete API
      toast.success(`Tenant ${tenantToDelete.companyName} marked for deletion`)
      setShowDeleteModal(false)
      setTenantToDelete(null)
    } catch (error) {
      toast.error('Failed to delete tenant')
    }
  }

  // Calculate stats
  const totalTenants = tenants.length
  const activeTenants = tenants.filter(t => t.subscription?.active).length
  const suspendedTenants = totalTenants - activeTenants
  const monthlyRevenue = tenants.reduce((total, tenant) => {
    if (!tenant.subscription?.active) return total
    const planPrices = { basic: 99, standard: 299, premium: 599 }
    return total + (planPrices[tenant.subscription?.plan] || 0)
  }, 0)

  const getStatusColor = (status) => {
    return status ? 'success' : 'failure'
  }

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'premium': return 'purple'
      case 'standard': return 'blue'
      case 'basic': return 'green'
      default: return 'gray'
    }
  }

  const getAvatarUrl = (name) => {
    const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=40`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-96 text-center shadow-xl">
          <div className="flex flex-col items-center p-6">
            <div className="relative">
              <Spinner size="xl" className="text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              Loading Tenants
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Fetching all company data...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Tenants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalTenants}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Companies registered
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Tenants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTenants}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {monthlyRevenue.toLocaleString()} SEK
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+8.2% from last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Issues
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {suspendedTenants}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Suspended accounts
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <TextInput
                icon={MagnifyingGlassIcon}
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
            
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              color="gray"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPlanFilter('all')
              }}
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => navigate('/super-admin/tenants/new')}
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Tenants ({filteredTenants.length})
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage companies and their subscriptions
            </p>
          </div>
          
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Button color="gray" size="sm">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Sort by {sortBy}
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4 ml-2" /> : <ArrowDownIcon className="w-4 h-4 ml-2" />}
              </Button>
            }
          >
            <Dropdown.Header>Sort Options</Dropdown.Header>
            <Dropdown.Item onClick={() => { setSortBy('companyName'); setSortOrder('asc') }}>
              Company A-Z
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortBy('companyName'); setSortOrder('desc') }}>
              Company Z-A
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortBy('createdAt'); setSortOrder('desc') }}>
              Newest First
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortBy('createdAt'); setSortOrder('asc') }}>
              Oldest First
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setSortBy('subscription'); setSortOrder('desc') }}>
              Plan (Premium First)
            </Dropdown.Item>
          </Dropdown>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            {tenants.length === 0 ? (
              <>
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tenants yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Get started by creating your first tenant company.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/super-admin/tenants/new')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Tenant
                  </Button>
                  <Button 
                    color="gray" 
                    onClick={createTestData}
                    disabled={creatingTestData}
                  >
                    {creatingTestData ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating Test Data...
                      </>
                    ) : (
                      <>
                        <BeakerIcon className="h-4 w-4 mr-2" />
                        Add Test Data
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button
                  color="gray"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPlanFilter('all')
                  }}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Company</Table.HeadCell>
                <Table.HeadCell>Contact</Table.HeadCell>
                <Table.HeadCell>Plan</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Performance</Table.HeadCell>
                <Table.HeadCell>Created</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <AnimatePresence>
                  {filteredTenants.map((tenant, index) => (
                    <motion.tr
                      key={tenant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            img={getAvatarUrl(tenant.companyName || tenant.name)}
                            size="sm"
                            rounded
                          />
                          <div>
                            <div className="font-semibold">
                              {tenant.companyName || tenant.name || 'Unnamed Company'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              /{tenant.slug || tenant.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{tenant.adminName || 'No name'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{tenant.adminEmail || 'No email'}</span>
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{tenant.phone}</span>
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <Badge color={getPlanColor(tenant.subscription?.plan)} size="sm">
                          {(tenant.subscription?.plan || 'NO PLAN').toUpperCase()}
                        </Badge>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            tenant.subscription?.active ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <Badge color={getStatusColor(tenant.subscription?.active)} size="sm">
                            {tenant.subscription?.active ? 'Active' : 'Suspended'}
                          </Badge>
                        </div>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Bookings</span>
                            <span className="font-medium">{tenant.stats?.totalBookings || 0}</span>
                          </div>
                          <Progress 
                            progress={Math.min((tenant.stats?.totalBookings || 0) / 5, 100)} 
                            size="sm" 
                            color="blue" 
                          />
                          <div className="text-xs text-gray-500">
                            {tenant.stats?.monthlyRevenue?.toLocaleString() || 0} SEK/month
                          </div>
                        </div>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="text-sm">
                          {tenant.createdAt ? (
                            <>
                              <div className="flex items-center text-gray-900 dark:text-white">
                                <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
                                {(tenant.createdAt.seconds ? 
                                  new Date(tenant.createdAt.seconds * 1000) : 
                                  new Date(tenant.createdAt)
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {(tenant.createdAt.seconds ? 
                                  new Date(tenant.createdAt.seconds * 1000) : 
                                  new Date(tenant.createdAt)
                                ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button color="gray" size="xs" onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button color="gray" size="xs" onClick={() => handleImpersonate(tenant)}>
                            <UserIcon className="w-4 h-4" />
                          </Button>
                          <Dropdown
                            arrowIcon={false}
                            inline
                            label={<Button color="gray" size="xs">•••</Button>}
                          >
                            <Dropdown.Item 
                              icon={PencilIcon}
                              onClick={() => navigate(`/super-admin/tenants/${tenant.id}/edit`)}
                            >
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item 
                              icon={Cog6ToothIcon}
                              onClick={() => navigate(`/super-admin/tenants/${tenant.id}/settings`)}
                            >
                              Settings
                            </Dropdown.Item>
                            <Dropdown.Item 
                              icon={tenant.subscription?.active ? PauseIcon : PlayIcon}
                              onClick={() => toggleTenantStatus(tenant.id, tenant.subscription?.active)}
                            >
                              {tenant.subscription?.active ? 'Suspend' : 'Activate'}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              icon={TrashIcon}
                              onClick={() => handleDeleteTenant(tenant)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Dropdown.Item>
                          </Dropdown>
                        </div>
                      </Table.Cell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md">
        <Modal.Header>Delete Tenant</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Alert color="warning">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">Warning!</span> This action cannot be undone.
            </Alert>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{tenantToDelete?.companyName}</strong>? 
              This will permanently remove all associated data including bookings, calculators, and customer information.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={confirmDelete}>
            Delete Tenant
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
} 