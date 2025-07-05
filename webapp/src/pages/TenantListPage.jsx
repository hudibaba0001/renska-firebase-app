import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/init'
import { useNavigate } from 'react-router-dom'
import { 
  Button, 
  Badge,
  Spinner
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
  BeakerIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import DashboardCard from '../components/DashboardCard'
import DataTable from '../components/DataTable'

export default function TenantListPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingTestData, setCreatingTestData] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTenants()
  }, [])

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
      
      // Only show success message if there are tenants (avoid spam)
      if (tenantsData.length > 0) {
        console.log(`✅ Loaded ${tenantsData.length} tenants`)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      
      // Only show error toast for actual errors, not empty collections
      if (error.code !== 'permission-denied') {
        toast.error('Failed to load tenants')
      } else {
        toast.error('Access denied: Please check your admin permissions')
      }
    } finally {
      setLoading(false)
    }
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]

      // Create each test tenant
      for (const tenant of testTenants) {
        await addDoc(collection(db, 'companies'), tenant)
      }

      toast.success(`Created ${testTenants.length} test tenants!`)
      fetchTenants() // Refresh the list
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
      fetchTenants() // Refresh the list
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

  // Calculate stats
  const totalTenants = tenants.length
  const activeTenants = tenants.filter(t => t.subscription?.active).length
  const suspendedTenants = totalTenants - activeTenants
  const monthlyRevenue = tenants.reduce((total, tenant) => {
    if (!tenant.subscription?.active) return total
    const planPrices = { basic: 99, standard: 299, premium: 599 }
    return total + (planPrices[tenant.subscription?.plan] || 0)
  }, 0)

  // Table columns configuration
  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      render: (value, tenant) => (
        <div>
          <p className="font-semibold text-gray-900">{value || tenant.name || 'Unnamed'}</p>
          {tenant.slug && (
            <p className="text-sm text-gray-500 font-mono">/{tenant.slug}</p>
          )}
        </div>
      )
    },
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {value.substring(0, 8)}...
        </span>
      )
    },
    {
      key: 'adminEmail',
      label: 'Admin Contact',
      render: (value, tenant) => (
        <div className="text-sm">
          <p className="text-gray-900">{tenant.adminName || '—'}</p>
          <p className="text-gray-500">{value || 'No email'}</p>
        </div>
      )
    },
    {
      key: 'subscription',
      label: 'Plan',
      type: 'badge',
      render: (value) => (
        <Badge color={
          value?.plan === 'premium' ? 'purple' :
          value?.plan === 'standard' ? 'info' :
          value?.plan === 'basic' ? 'success' :
          'gray'
        }>
          {value?.plan?.toUpperCase() || 'NO PLAN'}
        </Badge>
      )
    },
    {
      key: 'subscription',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value?.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <Badge color={value?.active ? 'success' : 'failure'}>
            {value?.active ? 'Active' : 'Suspended'}
          </Badge>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      render: (value) => {
        if (!value) return '—'
        const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value)
        return (
          <div className="text-sm">
            <p className="text-gray-900">{date.toLocaleDateString()}</p>
            <p className="text-gray-500">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )
      }
    }
  ]

  // Table actions
  const actions = [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: (tenant) => navigate(`/super-admin/tenants/${tenant.id}`)
    },
    {
      label: 'Impersonate',
      icon: UserIcon,
      onClick: handleImpersonate
    },
    {
      label: (tenant) => tenant.subscription?.active ? 'Suspend' : 'Activate',
      icon: (tenant) => tenant.subscription?.active ? PauseIcon : PlayIcon,
      onClick: (tenant) => toggleTenantStatus(tenant.id, tenant.subscription?.active)
    }
  ]

  // Empty state
  const emptyState = (
    <div className="text-center py-12">
      <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants yet</h3>
      <p className="text-gray-500 mb-6">Get started by creating your first tenant company.</p>
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
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600 font-mono">Loading tenants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Tenants"
          value={totalTenants.toString()}
          icon={BuildingOfficeIcon}
          color="blue"
          description="Companies registered"
        />
        <DashboardCard
          title="Active Tenants"
          value={activeTenants.toString()}
          icon={ChartBarIcon}
          color="green"
          trend="from last month"
          trendValue="+12%"
          trendDirection="up"
        />
        <DashboardCard
          title="Monthly Revenue"
          value={`${monthlyRevenue.toLocaleString()} SEK`}
          icon={CurrencyDollarIcon}
          color="purple"
          trend="from last month"
          trendValue="+8.2%"
          trendDirection="up"
        />
        <DashboardCard
          title="Issues"
          value={suspendedTenants.toString()}
          icon={ExclamationTriangleIcon}
          color="red"
          description="Suspended accounts"
        />
      </div>

      {/* Tenants Table */}
      <DataTable
        title="All Tenants"
        subtitle={`Manage ${totalTenants} companies and their subscriptions`}
        columns={columns}
        data={tenants}
        actions={actions}
        emptyState={emptyState}
        onRowClick={(tenant) => navigate(`/super-admin/tenants/${tenant.id}`)}
      />
    </div>
  )
} 