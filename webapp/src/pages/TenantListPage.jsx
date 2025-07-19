// webapp/src/pages/TenantListPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // Import the full suite of tenant service functions.
  // This replaces all direct 'firebase/firestore' imports.
  getAllTenants,
  deleteTenant,
  updateTenant,
  createTenant
} from '../services/firestore';
import {
  Button,
  Badge,
  Spinner,
  Card,
  TextInput,
  Select,
  Dropdown,
  
  Avatar,
  Modal,
  Alert,
  Progress,
} from 'flowbite-react';
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
  PhoneIcon,
} from '@heroicons/react/24/outline';

import toast from 'react-hot-toast';
import { serverTimestamp } from 'firebase/firestore'; // Keep for test data creation

export default function TenantListPage() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingTestData, setCreatingTestData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Used in UI and filtering
  const [planFilter, setPlanFilter] = useState('all'); // Used in UI and filtering
  const [sortBy, setSortBy] = useState('createdAt'); // Used in UI and filtering
  const [sortOrder, setSortOrder] = useState('desc'); // Used in UI and filtering
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenants();
  }, []);

  /**
   * Fetches all tenant data by calling the centralized `getAllTenants` service function.
   * This simplifies the component's responsibility to just handling the state.
   */
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      // Then fetch tenants as normal
      console.log('DEBUG: Fetching tenants for display:');
      console.log('DEBUG: Current user auth state should be checked here');
      const fetchedTenants = await getAllTenants();
      console.log(`DEBUG: Fetched ${fetchedTenants.length} tenants for display`);
      console.log('DEBUG: Raw fetched tenants:', fetchedTenants);
      
      // Log each tenant's subscription status
      fetchedTenants.forEach(tenant => {
        console.log(`DEBUG: Tenant ${tenant.id} (${tenant.companyName || tenant.name || 'Unnamed'})`);
        console.log(`DEBUG: Subscription:`, tenant.subscription || 'No subscription');
        console.log(`DEBUG: Will be displayed as: ${tenant.subscription?.active !== false ? 'ACTIVE' : 'INACTIVE'}`);
      });
      
      setTenants(fetchedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      console.error('Error details:', error.code, error.message);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  // The filterAndSortTenants function remains the same as it operates on local state.
  // Use useCallback to memoize the filterAndSortTenants function
  const filterAndSortTenants = useCallback(() => {
    let filtered = [...tenants];
    console.log('Filtering tenants, total before filter:', filtered.length);
    
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        (tenant.companyName || tenant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }
    
    if (statusFilter !== 'all') {
      // More defensive check for subscription status
      filtered = filtered.filter(tenant => {
        // Default to treating companies without subscription info as active
        if (!tenant.subscription) {
          console.log(`Tenant ${tenant.id} missing subscription, treating as ACTIVE by default`);
          // Always treat missing subscription as active
          return statusFilter === 'active';
        }
        
        // If subscription exists but active is undefined or null, default to active
        if (tenant.subscription.active === undefined || tenant.subscription.active === null) {
          console.log(`Tenant ${tenant.id} has subscription but active is undefined/null, treating as ACTIVE by default`);
          // Always treat undefined/null active status as active
          return statusFilter === 'active';
        }
        
        // For explicit boolean values, use the actual value
        const isActive = tenant.subscription.active !== false;
        console.log(`Tenant ${tenant.id} has explicit active status: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        return statusFilter === 'active' ? isActive : !isActive;
      });
      console.log('After status filter:', filtered.length);
    }
    
    if (planFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription?.plan === planFilter);
      console.log('After plan filter:', filtered.length);
    }
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'createdAt' && aValue?.seconds) aValue = new Date(aValue.seconds * 1000);
      if (sortBy === 'createdAt' && bValue?.seconds) bValue = new Date(bValue.seconds * 1000);
      if (sortBy === 'companyName') aValue = (a.companyName || a.name || '').toLowerCase();
      if (sortBy === 'companyName') bValue = (b.companyName || b.name || '').toLowerCase();
      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
    setFilteredTenants(filtered);
  }, [tenants, searchTerm, statusFilter, planFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortTenants();
  }, [filterAndSortTenants]);

  /**
   * Creates test tenant data using the `createTenant` service function.
   * This ensures that even test data is created through our standardized process.
   */
  const createTestData = useCallback(async () => {
    setCreatingTestData(true);
    try {
      // Test data is now created using the same `createTenant` function as the real form.
      // Note: `createTenant` doesn't support all these fields, so we map them.
      const testTenantPromises = [
        { name: 'Städproffs Stockholm AB', slug: 'stadproffs-stockholm', plan: 'premium', trialDays: 0, contactName: 'Anna Andersson', contactEmail: 'admin@stadproffs.se' },
        { name: 'Rengöring Plus Göteborg', slug: 'rengoring-plus-gbg', plan: 'standard', trialDays: 14, contactName: 'Erik Eriksson', contactEmail: 'kontakt@rengoring-plus.se' },
        { name: 'Hemstäd Malmö (Suspended)', slug: 'hemstad-malmo', plan: 'basic', trialDays: 0, contactName: 'Maria Svensson', contactEmail: 'info@hemstad-malmo.se' },
      ].map(tenantData => createTenant(tenantData));
      
      await Promise.all(testTenantPromises);

      toast.success(`Created ${testTenantPromises.length} test tenants!`);
      fetchTenants(); // Refresh the list from the service.
    } catch (error) {
      console.error('Error creating test data:', error);
      toast.error('Failed to create test data. A slug might be taken.');
    } finally {
      setCreatingTestData(false);
    }
  }, [fetchTenants]);

  /**
   * Toggles a tenant's active status using the `updateTenant` service function.
   * This abstracts the database write operation away from the component.
   */
  async function toggleTenantStatus(tenantId, currentStatus) {
    try {
      const updateData = {
        'subscription.active': !currentStatus,
        'subscription.status': !currentStatus ? 'active' : 'suspended',
        'subscription.updatedAt': serverTimestamp()
      };
      // Replaced direct Firestore call with the service function.
      await updateTenant(tenantId, updateData);
      
      toast.success(`Tenant ${!currentStatus ? 'activated' : 'suspended'} successfully`);
      fetchTenants(); // Refresh the list to show the change.
    } catch (error) {
      console.error('Error updating tenant status:', error);
      toast.error(error.message || 'Failed to update tenant status');
    }
  }

  // handleImpersonate remains the same as it uses sessionStorage.
  const handleImpersonate = (tenant) => {
    sessionStorage.setItem('superAdminImpersonation', JSON.stringify({
      tenantId: tenant.id,
      tenantName: tenant.companyName || tenant.name || tenant.id,
    }));
    toast.success(`Impersonating ${tenant.companyName || tenant.name}`);
    navigate(`/admin/${tenant.id}`);
  };

  const handleDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setShowDeleteModal(true);
  };

  /**
   * Confirms and executes the deletion of a tenant using the `deleteTenant` service function.
   */
  const confirmDelete = async () => {
    if (!tenantToDelete) return;
    
    try {
      // Replaced placeholder logic with the actual delete service function.
      await deleteTenant(tenantToDelete.id);
      toast.success(`Tenant "${tenantToDelete.companyName}" was permanently deleted.`);
      fetchTenants(); // Refresh the list.
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(error.message || 'Failed to delete tenant');
    } finally {
      setShowDeleteModal(false);
      setTenantToDelete(null);
    }
  };
  
  // The rest of the component (stat calculations and JSX) remains largely the same,
  // as it primarily consumes the state that is now populated by our service functions.
  const totalTenants = tenants.length;
  // Count tenants as active unless explicitly set to inactive
  const activeTenants = tenants.filter(t => t.subscription?.active !== false).length;
  // Modified to treat undefined/null as active (success)
  const getStatusColor = (status) => (status !== false ? 'success' : 'failure');
  const getPlanColor = (plan) => ({ premium: 'purple', standard: 'blue', basic: 'green' }[plan] || 'gray');
  const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${(name || 'U').split(' ').map(n=>n[0]).join('')}&background=random&color=fff&size=40`;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Card className="w-96 text-center shadow-xl"><div className="flex flex-col items-center p-6"><Spinner size="xl" /><h3>Loading Tenants...</h3></div></Card></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats and Filter UI (unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><div className="flex items-center justify-between"><div><p>Total Tenants</p><p className="text-2xl font-bold text-text-heading dark:text-white">{totalTenants}</p></div><BuildingOfficeIcon className="w-6 h-6 text-white p-3 rounded-lg bg-blue-500" /></div></Card>
        <Card><div className="flex items-center justify-between"><div><p>Active Tenants</p><p className="text-2xl font-bold text-text-heading dark:text-white">{activeTenants}</p></div><ChartBarIcon className="w-6 h-6 text-white p-3 rounded-lg bg-green-500" /></div></Card>
      </div>
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
          <div className="flex flex-col md:flex-row gap-4 flex-grow">
            <TextInput 
              icon={MagnifyingGlassIcon} 
              placeholder="Search tenants..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="flex-grow"
            />
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </Select>
              <Select 
                value={planFilter} 
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Plans</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-2">
              <Button color="light" size="sm" onClick={() => setSortBy('companyName')}>
                Name {sortBy === 'companyName' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3 inline" /> : <ArrowDownIcon className="w-3 h-3 inline" />)}
              </Button>
              <Button color="light" size="sm" onClick={() => setSortBy('createdAt')}>
                Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3 inline" /> : <ArrowDownIcon className="w-3 h-3 inline" />)}
              </Button>
              <Button color="light" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={() => navigate('/super-admin/tenants/new')}><PlusIcon className="w-4 h-4 mr-2" />Add Tenant</Button>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card>
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-text-heading dark:text-white">No tenants found</h3>
            <p className="mb-6 text-text-main dark:text-white">Create the first tenant or add test data.</p>
            <Button onClick={createTestData} disabled={creatingTestData}>{creatingTestData ? <Spinner/> : 'Add Test Data'}</Button>
          </div>
        ) : (
          
            <table className="min-w-full text-sm text-left divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr><th className="px-4 py-3 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>
                        <div className="flex items-center space-x-3">
                          <Avatar img={getAvatarUrl(tenant.companyName || tenant.name)} rounded />
                          <div>
                            <div className="font-semibold text-text-heading dark:text-white">{tenant.companyName || tenant.name}</div>
                            <div className="text-sm text-text-subtle dark:text-white">/{tenant.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><Badge color={getPlanColor(tenant.subscription?.plan)}>{tenant.subscription?.plan || 'NO PLAN'}</Badge></td>
                      <td onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><Badge color={getStatusColor(tenant.subscription?.active !== false)}>{tenant.subscription?.active !== false ? 'Active' : 'Suspended'}</Badge></td>
                      <td onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>{tenant.createdAt?.seconds ? new Date(tenant.createdAt.seconds * 1000).toLocaleDateString() : '—'}</td>
                      <td>
                        {/* Debug message removed */}
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="xs" onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><EyeIcon className="w-4 h-4" /></Button>
                          {/* Always show impersonate button */}
                          <Button size="xs" onClick={() => handleImpersonate(tenant)}><UserIcon className="w-4 h-4" /></Button>
                          <Dropdown inline label={<Button size="xs">•••</Button>}>
                            <Dropdown.Item icon={tenant.subscription?.active ? PauseIcon : PlayIcon} onClick={() => toggleTenantStatus(tenant.id, tenant.subscription?.active)}>
                              {tenant.subscription?.active ? 'Suspend' : 'Activate'}
                            </Dropdown.Item>
                            <Dropdown.Item icon={TrashIcon} onClick={() => handleDeleteTenant(tenant)} className="text-red-600">Delete</Dropdown.Item>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                
              </tbody>
            </table>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md">
        <Modal.Header>Delete Tenant</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete <strong>{tenantToDelete?.companyName}</strong>? This action is permanent.
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={confirmDelete}>Yes, I'm sure</Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
