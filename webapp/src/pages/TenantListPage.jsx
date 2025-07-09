// webapp/src/pages/TenantListPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // Import the full suite of tenant service functions.
  // This replaces all direct 'firebase/firestore' imports.
  getAllTenants,
  updateTenant,
  deleteTenant,
  createTenant // Used for creating test data.
} from '../services/firestore';
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
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { serverTimestamp } from 'firebase/firestore'; // Keep for test data creation

export default function TenantListPage() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingTestData, setCreatingTestData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    filterAndSortTenants();
  }, [tenants, searchTerm, statusFilter, planFilter, sortBy, sortOrder]);

  /**
   * Fetches all tenant data by calling the centralized `getAllTenants` service function.
   * This simplifies the component's responsibility to just handling the state.
   */
  async function fetchTenants() {
    try {
      setLoading(true);
      // Replaced direct Firestore call with the service function.
      const tenantsData = await getAllTenants();
      setTenants(tenantsData);
      
      if (tenantsData.length > 0) {
        console.log(`✅ Loaded ${tenantsData.length} tenants via service layer`);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error(error.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }

  // The filterAndSortTenants function remains the same as it operates on local state.
  function filterAndSortTenants() {
    let filtered = [...tenants];
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        (tenant.companyName || tenant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tenant.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tenant => (statusFilter === 'active' ? tenant.subscription?.active : !tenant.subscription?.active));
    }
    if (planFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription?.plan === planFilter);
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
  }

  /**
   * Creates test tenant data using the `createTenant` service function.
   * This ensures that even test data is created through our standardized process.
   */
  async function createTestData() {
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
  }

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
  const activeTenants = tenants.filter(t => t.subscription?.active).length;
  const getStatusColor = (status) => (status ? 'success' : 'failure');
  const getPlanColor = (plan) => ({ premium: 'purple', standard: 'blue', basic: 'green' }[plan] || 'gray');
  const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${(name || 'U').split(' ').map(n=>n[0]).join('')}&background=random&color=fff&size=40`;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Card className="w-96 text-center shadow-xl"><div className="flex flex-col items-center p-6"><Spinner size="xl" /><h3>Loading Tenants...</h3></div></Card></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats and Filter UI (unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><div className="flex items-center justify-between"><div><p>Total Tenants</p><p className="text-2xl font-bold">{totalTenants}</p></div><BuildingOfficeIcon className="w-6 h-6 text-white p-3 rounded-lg bg-blue-500" /></div></Card>
        <Card><div className="flex items-center justify-between"><div><p>Active Tenants</p><p className="text-2xl font-bold">{activeTenants}</p></div><ChartBarIcon className="w-6 h-6 text-white p-3 rounded-lg bg-green-500" /></div></Card>
      </div>
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <TextInput icon={MagnifyingGlassIcon} placeholder="Search tenants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={() => navigate('/super-admin/tenants/new')}><PlusIcon className="w-4 h-4 mr-2" />Add Tenant</Button>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card>
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No tenants found</h3>
            <p className="text-gray-500 mb-6">Create the first tenant or add test data.</p>
            <Button onClick={createTestData} disabled={creatingTestData}>{creatingTestData ? <Spinner/> : 'Add Test Data'}</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Company</Table.HeadCell>
                <Table.HeadCell>Plan</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Created</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                <AnimatePresence>
                  {filteredTenants.map((tenant) => (
                    <motion.tr key={tenant.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout>
                      <Table.Cell onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>
                        <div className="flex items-center space-x-3">
                          <Avatar img={getAvatarUrl(tenant.companyName || tenant.name)} rounded />
                          <div>
                            <div className="font-semibold">{tenant.companyName || tenant.name}</div>
                            <div className="text-sm text-gray-500">/{tenant.slug}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><Badge color={getPlanColor(tenant.subscription?.plan)}>{tenant.subscription?.plan || 'NO PLAN'}</Badge></Table.Cell>
                      <Table.Cell onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><Badge color={getStatusColor(tenant.subscription?.active)}>{tenant.subscription?.active ? 'Active' : 'Suspended'}</Badge></Table.Cell>
                      <Table.Cell onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>{tenant.createdAt?.seconds ? new Date(tenant.createdAt.seconds * 1000).toLocaleDateString() : '—'}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="xs" onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}><EyeIcon className="w-4 h-4" /></Button>
                          <Button size="xs" onClick={() => handleImpersonate(tenant)}><UserIcon className="w-4 h-4" /></Button>
                          <Dropdown inline label={<Button size="xs">•••</Button>}>
                            <Dropdown.Item icon={tenant.subscription?.active ? PauseIcon : PlayIcon} onClick={() => toggleTenantStatus(tenant.id, tenant.subscription?.active)}>
                              {tenant.subscription?.active ? 'Suspend' : 'Activate'}
                            </Dropdown.Item>
                            <Dropdown.Item icon={TrashIcon} onClick={() => handleDeleteTenant(tenant)} className="text-red-600">Delete</Dropdown.Item>
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
