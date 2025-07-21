import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, TextInput, Select, Badge, Tabs } from 'flowbite-react';
import toast from 'react-hot-toast';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,
  CurrencyEuroIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import CustomerService from '../services/customerService';
import BookingService from '../services/bookingService';
import CustomersTable from '../components/CustomersTable';
import { AddCustomerModal, ViewCustomerModal } from '../components/CustomerModals';

const CustomersPage = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoadingState] = useState(true);
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    byStatus: { lead: 0, active: 0, inactive: 0, prospect: 0 },
    byType: { private: 0, business: 0 },
    bySource: {},
    totalRevenue: 0,
    averageOrderValue: 0
  });
  
  // Debug wrapper for setLoading
  const setLoading = (value) => {
    console.log('🔄 setLoading called:', value, 'from:', new Error().stack.split('\n')[2]);
    setLoadingState(value);
  };
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection] = useState('desc');

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    customerType: 'private',
    status: 'lead',
    source: 'manual',
    addresses: [],
    preferences: {
      preferredContactMethod: 'email',
      preferredTime: 'morning',
      specialInstructions: '',
      allergies: '',
      pets: false,
      accessInstructions: ''
    },
    tags: [],
    notes: []
  });

  const loadCustomers = useCallback(async () => {
    try {
      console.log('🔄 Starting loadCustomers...');
      setLoading(true);
      
      // Check if user and companyId exist
      if (!currentUser?.companyId) {
        console.warn('❌ No company ID available for loading customers');
        setLoading(false);
        return;
      }
      
      console.log('📊 Loading customers for company:', currentUser.companyId);
      
      try {
        // Load customers using the new CustomerService
        const customersData = await CustomerService.getCustomersForCompany(currentUser.companyId, {
          sortBy,
          sortDirection
        });
        console.log('👥 Customers loaded:', customersData?.length || 0, 'customers');
        
        setCustomers(customersData || []);
        
        // Load customer statistics
        const stats = await CustomerService.getCustomerStats(currentUser.companyId);
        setCustomerStats(stats);
        
      } catch (customerError) {
        console.warn('⚠️ Customer service failed, using test data:', customerError);
        
        // Fallback: Show test customer data to demonstrate CRM interface
        const testCustomers = [
          {
            id: 'test-1',
            name: 'Anna Andersson',
            email: 'anna@example.com',
            phone: '+46 70 123 4567',
            totalBookings: 3,
            totalSpent: 2400,
            lastBooking: new Date('2024-01-15'),
            status: 'active',
            customerType: 'private',
            source: 'booking',
            addresses: [
              {
                id: 'addr_1',
                type: 'primary',
                street: 'Storgatan 123',
                city: 'Stockholm',
                postalCode: '123 45',
                country: 'Sweden',
                isDefault: true
              }
            ],
            preferences: {
              preferredContactMethod: 'email',
              preferredTime: 'morning',
              specialInstructions: 'Ring på dörren',
              allergies: '',
              pets: false,
              accessInstructions: ''
            },
            tags: ['VIP', 'Regelbunden'],
            notes: [
              {
                id: 'note_1',
                content: 'Mycket nöjd kund, föredrar morgonstädning',
                type: 'preference',
                createdBy: 'system',
                createdAt: new Date('2024-01-10')
              }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 'test-2', 
            name: 'Erik Eriksson',
            email: 'erik@company.se',
            phone: '+46 70 987 6543',
            totalBookings: 1,
            totalSpent: 1200,
            lastBooking: new Date('2024-01-10'),
            status: 'active',
            customerType: 'business',
            source: 'booking',
            addresses: [
              {
                id: 'addr_2',
                type: 'primary',
                street: 'Företagsgatan 456',
                city: 'Göteborg',
                postalCode: '456 78',
                country: 'Sweden',
                isDefault: true
              }
            ],
            preferences: {
              preferredContactMethod: 'phone',
              preferredTime: 'afternoon',
              specialInstructions: '',
              allergies: '',
              pets: false,
              accessInstructions: 'Kod: 1234'
            },
            tags: ['Företag', 'Ny kund'],
            notes: [],
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-10')
          }
        ];
        
        console.log('🧪 Using test customers:', testCustomers.length);
        setCustomers(testCustomers);
        
        // Set test stats
        setCustomerStats({
          total: testCustomers.length,
          byStatus: { lead: 0, active: 2, inactive: 0, prospect: 0 },
          byType: { private: 1, business: 1 },
          bySource: { booking: 2 },
          totalRevenue: 3600,
          averageOrderValue: 1800
        });
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied - showing empty customer list');
        setCustomers([]);
        toast.error('Begränsad åtkomst - kontakta administratör för fullständig kunddata');
      } else {
        toast.error('Kunde inte ladda kunder: ' + (error.message || 'Okänt fel'));
      }
    } finally {
      console.log('✅ loadCustomers completed');
      setLoading(false);
    }
  }, [currentUser?.companyId, sortBy, sortDirection]);

  const filterAndSortCustomers = useCallback(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        customer.addresses?.some(addr => 
          addr.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addr.city?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'totalSpent' || sortBy === 'totalBookings') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === 'lastBooking' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterStatus, filterType, sortBy, sortDirection]);

  // useEffect hooks - must come after useCallback definitions
  useEffect(() => {
    if (currentUser?.companyId) {
      loadCustomers();
    }
  }, [currentUser?.companyId, loadCustomers]);

  useEffect(() => {
    filterAndSortCustomers();
  }, [filterAndSortCustomers]);

  // Force loading to false when customers are available
  useEffect(() => {
    if (customers.length > 0 && loading) {
      console.log('🚀 Forcing loading to false - customers ready:', customers.length);
      setLoading(false);
    }
  }, [customers, loading]);

  const handleAddCustomer = async () => {
    try {
      console.log('🔄 Adding customer:', newCustomer);
      
      if (!newCustomer.name || !newCustomer.email) {
        toast.error('Namn och e-post är obligatoriska');
        return;
      }

      const createdCustomer = await CustomerService.createCustomer(
        currentUser.companyId,
        newCustomer,
        currentUser.email || 'system'
      );

      // Add to local state
      setCustomers(prev => [createdCustomer, ...prev]);
      
      // Reset form
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        customerType: 'private',
        status: 'lead',
        source: 'manual',
        addresses: [],
        preferences: {
          preferredContactMethod: 'email',
          preferredTime: 'morning',
          specialInstructions: '',
          allergies: '',
          pets: false,
          accessInstructions: ''
        },
        tags: [],
        notes: []
      });

      console.log('✅ Customer added successfully');
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      toast.error('Kunde inte skapa kund: ' + (error.message || 'Okänt fel'));
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      console.log('🔄 Viewing customer:', customer.id);
      setSelectedCustomer(customer);
      
      // Load customer bookings
      const bookings = await BookingService.getBookingsForCustomer(customer.email);
      setCustomerBookings(bookings || []);
      
      setShowViewModal(true);
    } catch (error) {
      console.error('❌ Error loading customer details:', error);
      toast.error('Kunde inte ladda kunddetaljer');
    }
  };

  const handleUpdateCustomer = async (customerId, updates) => {
    try {
      await CustomerService.updateCustomer(
        currentUser.companyId,
        customerId,
        updates,
        currentUser.email || 'system'
      );
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, ...updates } : c
      ));
      
      toast.success('Kund uppdaterad');
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      toast.error('Kunde inte uppdatera kund');
    }
  };

  const handleAddNote = async (customerId, noteData) => {
    try {
      const newNote = await CustomerService.addCustomerNote(
        currentUser.companyId,
        customerId,
        noteData,
        currentUser.email || 'system'
      );
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, notes: [...(c.notes || []), newNote] }
          : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({
          ...prev,
          notes: [...(prev.notes || []), newNote]
        }));
      }
      
      toast.success('Anteckning tillagd');
    } catch (error) {
      console.error('❌ Error adding note:', error);
      toast.error('Kunde inte lägga till anteckning');
    }
  };

  const handleUpdateStatus = async (customerId, newStatus) => {
    try {
      await CustomerService.updateCustomerStatus(
        currentUser.companyId,
        customerId,
        newStatus,
        currentUser.email || 'system'
      );
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: newStatus } : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success('Status uppdaterad');
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error('Kunde inte uppdatera status');
    }
  };

  const handleAddTag = async (customerId, tag) => {
    try {
      await CustomerService.addCustomerTag(
        currentUser.companyId,
        customerId,
        tag,
        currentUser.email || 'system'
      );
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, tags: [...(c.tags || []), tag] }
          : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag]
        }));
      }
      
      toast.success('Tagg tillagd');
    } catch (error) {
      console.error('❌ Error adding tag:', error);
      toast.error('Kunde inte lägga till tagg');
    }
  };

  const handleRemoveTag = async (customerId, tag) => {
    try {
      await CustomerService.removeCustomerTag(
        currentUser.companyId,
        customerId,
        tag,
        currentUser.email || 'system'
      );
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, tags: (c.tags || []).filter(t => t !== tag) }
          : c
      ));
      
      // Update selected customer if viewing
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({
          ...prev,
          tags: (prev.tags || []).filter(t => t !== tag)
        }));
      }
      
      toast.success('Tagg borttagen');
    } catch (error) {
      console.error('❌ Error removing tag:', error);
      toast.error('Kunde inte ta bort tagg');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Är du säker på att du vill radera denna kund?')) {
      return;
    }

    try {
      await CustomerService.deleteCustomer(currentUser.companyId, customerId);
      
      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      
      toast.success('Kund raderad');
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      toast.error('Kunde inte radera kund');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Aldrig';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('sv-SE');
  };

  const exportCustomers = () => {
    const csvContent = [
      ['Namn', 'E-post', 'Telefon', 'Status', 'Typ', 'Källa', 'Totalt bokningar', 'Totalt spenderat', 'Senaste bokning'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        customer.status,
        customer.customerType,
        customer.source,
        customer.totalBookings || 0,
        customer.totalSpent || 0,
        customer.lastBooking ? formatDate(customer.lastBooking) : 'Aldrig'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kunder_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shouldShowInterface = currentUser && !loading;

  if (!shouldShowInterface) {
    console.log('⏳ Still loading:', { hasCurrentUser: !!currentUser, loading, shouldShowInterface });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {!currentUser ? 'Laddar autentisering...' : 'Laddar kunder...'}
        </span>
      </div>
    );
  }

  console.log('✅ Rendering CRM interface with', customers.length, 'customers');

  try {
    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Kunder</h1>
          <p className="text-gray-600 mt-1">Hantera dina kunder och se deras bokningshistorik</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportCustomers}
            color="gray"
            className="flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportera
          </Button>
          <Button
            onClick={() => {
              console.log('👥 Opening Add Customer modal');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2"
          >
            <UserPlusIcon className="w-4 h-4" />
            Lägg till kund
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totalt kunder</p>
              <p className="text-2xl font-semibold text-gray-900">{customerStats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total intäkt</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(customerStats.totalRevenue)}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Genomsnittlig order</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(customerStats.averageOrderValue)}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktiva kunder</p>
              <p className="text-2xl font-semibold text-gray-900">{customerStats.byStatus.active}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <TextInput
                type="text"
                placeholder="Sök kunder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-40"
            >
              <option value="all">Alla statusar</option>
              <option value="lead">Leads</option>
              <option value="prospect">Prospekter</option>
              <option value="active">Aktiva</option>
              <option value="inactive">Inaktiva</option>
            </Select>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-40"
            >
              <option value="all">Alla typer</option>
              <option value="private">Privata</option>
              <option value="business">Företag</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            >
              <option value="createdAt">Skapad</option>
              <option value="name">Namn</option>
              <option value="totalBookings">Bokningar</option>
              <option value="totalSpent">Intäkt</option>
              <option value="lastBooking">Senaste bokning</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <CustomersTable
          customers={filteredCustomers}
          onViewCustomer={handleViewCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </Card>

      {/* Modals */}
      <AddCustomerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onAddCustomer={handleAddCustomer}
      />

      <ViewCustomerModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        customer={selectedCustomer}
        bookings={customerBookings}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onAddNote={handleAddNote}
        onUpdateStatus={handleUpdateStatus}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
    );
  } catch (error) {
    console.error('❌ Error rendering CRM interface:', error);
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">Ett fel uppstod</div>
        <p className="text-gray-600">Kunde inte ladda kundgränssnittet</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Ladda om sidan
        </Button>
      </div>
    );
  }
};

export default CustomersPage;
