import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, TextInput, Select } from 'flowbite-react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ChartBarIcon,
  StarIcon,
  CurrencyEuroIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from "../context/AuthContext";
import { BookingService } from '../services/bookingService';
import CustomersTable from '../components/CustomersTable';
import { AddCustomerModal, ViewCustomerModal } from '../components/CustomerModals';
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    customerType: 'private',
    source: 'manual'
  });

  useEffect(() => {
    if (currentUser?.companyId) {
      loadCustomers();
    }
  }, [currentUser?.companyId, loadCustomers]);

  useEffect(() => {
    filterAndSortCustomers();
  }, [filterAndSortCustomers]);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // Load bookings and extract customers
      const bookingsData = await BookingService.getBookingsForCompany(currentUser.companyId);
      const extractedCustomers = extractCustomersFromBookings(bookingsData);
      setCustomers(extractedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Kunde inte ladda kunder');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.companyId]);

  const extractCustomersFromBookings = (bookings) => {
    const customerMap = new Map();

    // Extract customers from bookings
    bookings.forEach(booking => {
      const email = (booking.customerEmail || booking.email || '').toLowerCase();
      const phone = booking.customerPhone || booking.phone || booking.phoneNumber || '';
      
      if (email && !customerMap.has(email)) {
        const customer = {
          id: `auto_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: booking.customerName || booking.name || 'Okänd kund',
          email: booking.customerEmail || booking.email || '',
          phone: phone,
          address: booking.address || booking.customerAddress || booking.location || booking.serviceAddress || '',
          city: '',
          postalCode: '',
          notes: '',
          customerType: 'private',
          source: 'online',
          createdAt: booking.createdAt || new Date(),
          updatedAt: new Date(),
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: null,
          status: 'active'
        };
        customerMap.set(email, customer);
      }
    });

    // Calculate customer statistics
    const customers = Array.from(customerMap.values());
    customers.forEach(customer => {
      const customerBookings = bookings.filter(booking => 
        (booking.customerEmail || booking.email || '').toLowerCase() === customer.email.toLowerCase()
      );
      
      customer.totalBookings = customerBookings.length;
      customer.totalSpent = customerBookings.reduce((sum, booking) => {
        const amount = booking.totalPrice || booking.totalAmount || booking.amount || booking.price || 0;
        return sum + (typeof amount === 'string' ? parseFloat(amount) : amount);
      }, 0);
      
      if (customerBookings.length > 0) {
        customer.lastBooking = customerBookings.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0].createdAt;
      }
    });

    return customers;
  };

  const filterAndSortCustomers = useCallback(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'totalSpent' || sortBy === 'totalBookings') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === 'lastBooking') {
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
  }, [customers, searchTerm, filterStatus, sortBy, sortDirection]);

  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.email) {
        toast.error('Namn och e-post är obligatoriska');
        return;
      }

      const customerData = {
        ...newCustomer,
        id: `manual_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalBookings: 0,
        totalSpent: 0,
        lastBooking: null,
        status: 'active',
        companyId: currentUser.companyId
      };

      setCustomers(prev => [...prev, customerData]);
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        notes: '',
        customerType: 'private',
        source: 'manual'
      });
      
      toast.success('Kund tillagd framgångsrikt');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Kunde inte lägga till kund');
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setShowViewModal(true);
      
      // Load customer's booking history
      const bookings = await BookingService.getBookingsForCompany(currentUser.companyId);
      const customerBookings = bookings.filter(booking => 
        (booking.customerEmail || booking.email || '').toLowerCase() === customer.email.toLowerCase()
      );
      
      setCustomerBookings(customerBookings);
    } catch (error) {
      console.error('Error loading customer bookings:', error);
      toast.error('Kunde inte ladda kundens bokningar');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 kr';
    return `${amount.toLocaleString('sv-SE')} kr`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('sv-SE');
  };



  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna kund?')) {
      return;
    }

    try {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      toast.success('Kund borttagen');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Kunde inte ta bort kund');
    }
  };

  const exportCustomers = () => {
    const csvContent = [
      ['Namn', 'E-post', 'Telefon', 'Adress', 'Typ', 'Källa', 'Totala bokningar', 'Totalt spenderat', 'Senaste bokning', 'Status'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.customerType === 'private' ? 'Privat' : 'Företag',
        customer.source === 'manual' ? 'Manuell' : customer.source === 'online' ? 'Online' : 'Referral',
        customer.totalBookings,
        customer.totalSpent,
        formatDate(customer.lastBooking),
        customer.status === 'active' ? 'Aktiv' : customer.status === 'inactive' ? 'Inaktiv' : 'Blockerad'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kunder_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Kunder</h1>
          <p className="text-gray-600 mt-1">Hantera dina kunder och se deras bokningshistorik</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlusIcon className="w-4 h-4" />
          Lägg till kund
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totala kunder</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktiva kunder</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Återkommande kunder</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.totalBookings > 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total intäkt</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CurrencyEuroIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <TextInput
              icon={MagnifyingGlassIcon}
              placeholder="Sök kunder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Alla status</option>
              <option value="active">Aktiva</option>
              <option value="inactive">Inaktiva</option>
              <option value="blocked">Blockerade</option>
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sortera efter namn</option>
              <option value="totalBookings">Sortera efter bokningar</option>
              <option value="totalSpent">Sortera efter spenderat</option>
              <option value="lastBooking">Sortera efter senaste bokning</option>
            </Select>
            <Button
              color="light"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </Button>
            <Button
              color="light"
              onClick={exportCustomers}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <CustomersTable
        customers={filteredCustomers}
        onViewCustomer={handleViewCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onAddCustomer={handleAddCustomer}
      />

      {/* View Customer Modal */}
      <ViewCustomerModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        customer={selectedCustomer}
        bookings={customerBookings}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};

export default CustomersPage;
