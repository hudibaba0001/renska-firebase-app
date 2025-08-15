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
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  MagnifyingGlassIcon as HiSearch, 
  ArrowDownTrayIcon as HiDownload, 
  ArrowPathIcon as HiRefresh,
  CalendarIcon as HiCalendar,
  ClockIcon as HiClock,
  CheckCircleIcon as HiCheckCircle,
  XCircleIcon as HiXCircle,
  ExclamationCircleIcon as HiExclamationCircle
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import BookingTable from '../components/BookingTablePremium';
import { getBookings, getBookingStats, updateBooking, exportBookingsToCSV } from '../services/bookingService';

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
      const result = await getBookings(companyId);
      console.log('Loaded bookings:', result.bookings);
      setBookings(result.bookings);
      setFilteredBookings(result.bookings);
      
      // Load stats
      const statsData = await getBookingStats(companyId);
      console.log('Loaded stats:', statsData);
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
          case 'week': {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    console.log('Applying filters:', { filters, originalCount: bookings.length, filteredCount: filtered.length });
    setFilteredBookings(filtered);
  }, [bookings, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle booking update
  const handleBookingUpdate = useCallback(async (bookingId, updates) => {
    console.log('🔄 BookingManagementPage: Updating booking', bookingId, updates);
    
    try {
      // Update local state immediately for better UX (optimistic update)
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates, updatedAt: new Date() }
          : booking
      ));
      
      // Persist changes to Firestore database
      await updateBooking(companyId, bookingId, updates);
      
      // Reload stats to reflect changes
      const newStats = await getBookingStats(companyId);
      setStats(newStats);
      
      console.log('✅ Booking updated successfully and persisted to database');
      
    } catch (error) {
      console.error('❌ Failed to update booking:', error);
      // Revert the local state change on error by reloading from database
      toast.error('Kunde inte uppdatera bokning. Återställer...');
      await loadBookings();
      throw error;
    }
  }, [companyId, loadBookings]);

  // Handle export
  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast.error('Inga bokningar att exportera');
      return;
    }
    
    exportBookingsToCSV(filteredBookings);
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

  console.log('🚨 BookingManagementPage error state:', error);
  if (error) {
    console.log('🚨 Returning early due to error, BookingTable will not render');
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-light text-gray-900 tracking-wide">Bokningshantering</h1>
                <p className="text-gray-500 font-light mt-1">Hantera och övervaka alla bokningar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadBookings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-light bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                <HiRefresh className="w-4 h-4" />
                Uppdatera
              </button>
              <button
                onClick={handleExport}
                disabled={filteredBookings.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-light bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
              >
                <HiDownload className="w-4 h-4" />
                Exportera CSV
              </button>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            
            // Defensive check to ensure Icon is a valid component
            const IconComponent = Icon && typeof Icon === 'function' 
              ? <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              : <HiClock className={`w-5 h-5 ${stat.iconColor}`} />;
              
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-light text-gray-900">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    {IconComponent}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modern Revenue Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-light text-gray-900 tracking-wide">Ekonomisk översikt</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total omsättning</p>
              <p className="text-3xl font-light text-gray-900">
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                  minimumFractionDigits: 0
                }).format(stats.totalRevenue || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Genomsnittligt bokningsvärde</p>
              <p className="text-2xl font-light text-gray-900">
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                  minimumFractionDigits: 0
                }).format(stats.averageBookingValue || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h3 className="text-lg font-light text-gray-900 tracking-wide">Filter och sök</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sök
              </label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök kund, e-post, telefon..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm font-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 text-sm font-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Alla statusar</option>
                <option value="pending">Väntande</option>
                <option value="confirmed">Bekräftad</option>
                <option value="completed">Slutförd</option>
                <option value="cancelled">Avbokad</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tidsperiod
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-4 py-2 text-sm font-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Alla datum</option>
                <option value="today">Idag</option>
                <option value="week">Senaste veckan</option>
                <option value="month">Senaste månaden</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resultat</label>
                <div className="text-sm font-light text-gray-900">
                  <p className="font-medium">{filteredBookings.length} av {bookings.length} bokningar</p>
                  <p>visas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {console.log('🔧 About to render ErrorBoundary with BookingTable')}
          <ErrorBoundary 
            fallbackMessage="Kunde inte visa bokningar. Vi har loggat felet och kommer att åtgärda det så snart som möjligt."
          >
            <BookingTable 
              bookings={filteredBookings} 
              loading={loading}
              companyId={companyId}
              onBookingUpdate={handleBookingUpdate}
              onContactCustomer={(booking, method) => {
                console.log('Contact customer:', booking.customerName, 'via', method);
              }}
            />
          </ErrorBoundary>
        </div>

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
    </div>
  );
};

export default BookingManagementPage;
