// webapp/src/pages/BookingManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Select, 
  TextInput, 
  Badge,
  Spinner,
  Alert
} from 'flowbite-react';
import { 
  HiSearch, 
  HiDownload, 
  HiRefresh,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';

import BookingTable from '../components/BookingTable';
import BookingService from '../services/bookingService';

const BookingManagementPage = () => {
  const { companyId } = useParams();
  
  // State
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all'
  });

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await BookingService.getBookingsForCompany(companyId);
      setBookings(result.bookings);
      setFilteredBookings(result.bookings);
      
      // Load stats
      const statsData = await BookingService.getBookingStats(companyId);
      setStats(statsData);
      
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Fel vid laddning av bokningar. Försök igen senare.');
      toast.error('Kunde inte ladda bokningar');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    // Text search
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customerName?.toLowerCase().includes(searchTerm) ||
        booking.customerEmail?.toLowerCase().includes(searchTerm) ||
        booking.customerPhone?.includes(searchTerm) ||
        booking.serviceName?.toLowerCase().includes(searchTerm) ||
        booking.id.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(booking => {
        if (!booking.bookingDate) return false;
        const bookingDate = new Date(booking.bookingDate);
        
        switch (filters.dateRange) {
          case 'today':
            return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle booking update
  const handleBookingUpdate = useCallback((bookingId, newStatus) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus, updatedAt: new Date() }
        : booking
    ));
    
    // Reload stats
    BookingService.getBookingStats(companyId).then(setStats);
  }, [companyId]);

  // Handle export
  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast.error('Inga bokningar att exportera');
      return;
    }
    
    BookingService.exportBookingsToCSV(filteredBookings);
  };

  // Effects
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Stats cards data
  const statsCards = [
    {
      title: 'Väntande',
      value: stats.pending || 0,
      icon: HiClock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Bekräftade',
      value: stats.confirmed || 0,
      icon: HiExclamationCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Slutförda',
      value: stats.completed || 0,
      icon: HiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Avbokade',
      value: stats.cancelled || 0,
      icon: HiXCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <Alert color="failure" className="mb-4">
          <span className="font-medium">Fel!</span> {error}
        </Alert>
        <Button onClick={loadBookings}>
          <HiRefresh className="w-4 h-4 mr-2" />
          Försök igen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bokningshantering</h1>
          <p className="text-gray-600">Hantera och övervaka alla bokningar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="gray"
            onClick={loadBookings}
            disabled={loading}
          >
            <HiRefresh className="w-4 h-4 mr-2" />
            Uppdatera
          </Button>
          <Button
            onClick={handleExport}
            disabled={filteredBookings.length === 0}
          >
            <HiDownload className="w-4 h-4 mr-2" />
            Exportera CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total omsättning</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
                minimumFractionDigits: 0
              }).format(stats.totalRevenue || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Genomsnittligt bokningsvärde</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: 'SEK',
                minimumFractionDigits: 0
              }).format(stats.averageBookingValue || 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sök
            </label>
            <TextInput
              icon={HiSearch}
              placeholder="Sök kund, e-post, telefon..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Alla statusar</option>
              <option value="pending">Väntande</option>
              <option value="confirmed">Bekräftad</option>
              <option value="completed">Slutförd</option>
              <option value="cancelled">Avbokad</option>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tidsperiod
            </label>
            <Select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">Alla datum</option>
              <option value="today">Idag</option>
              <option value="week">Senaste veckan</option>
              <option value="month">Senaste månaden</option>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{filteredBookings.length} av {bookings.length} bokningar</p>
              <p>visas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <BookingTable
        bookings={filteredBookings}
        loading={loading}
        onBookingUpdate={handleBookingUpdate}
        onContactCustomer={(booking, method) => {
          console.log('Contact customer:', booking.customerName, 'via', method);
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Spinner size="md" />
            <span>Laddar bokningar...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage;
