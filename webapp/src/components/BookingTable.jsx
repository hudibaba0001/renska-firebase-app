import React, { useState, useMemo } from 'react';
import { Badge, Button, Spinner } from 'flowbite-react';
import { 
  EyeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ChevronUpIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

// Simple StatusBadge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'väntande':
        return { color: 'warning', text: 'Väntande' };
      case 'confirmed':
      case 'bekräftad':
        return { color: 'info', text: 'Bekräftad' };
      case 'completed':
      case 'slutförd':
        return { color: 'success', text: 'Slutförd' };
      case 'cancelled':
      case 'avbokad':
        return { color: 'failure', text: 'Avbokad' };
      default:
        return { color: 'gray', text: status || 'Okänd' };
    }
  };

  const config = getStatusConfig(status);
  return <Badge color={config.color}>{config.text}</Badge>;
};

// Utility functions
const formatDate = (dateValue) => {
  try {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('sv-SE');
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('sv-SE');
    }
    return new Date(dateValue).toLocaleDateString('sv-SE');
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'N/A';
  }
};

const formatTime = (dateValue) => {
  try {
    if (!dateValue) return 'N/A';
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(dateValue).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.warn('Time formatting error:', error);
    return 'N/A';
  }
};

const formatCurrency = (amount) => {
  try {
    if (amount === null || amount === undefined) return '0 kr';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0 kr';
    return `${numAmount.toLocaleString('sv-SE')} kr`;
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return '0 kr';
  }
};

const BookingTable = ({ 
  bookings = [], 
  loading = false,
  onBookingUpdate,
  onContactCustomer,
  companyId,
  className
}) => {
  console.log('🔧 BookingTable component is rendering!');
  console.log('🔧 BookingTable props:', {
    bookingsCount: bookings?.length || 0,
    bookings: bookings,
    loading,
    companyId
  });
  
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewBooking, setViewBooking] = useState(null);
  
  // Mock data for testing if no bookings are provided
  const mockBookings = useMemo(() => {
    if (bookings && bookings.length > 0) {
      return bookings;
    }
    
    return [
      {
        id: 'mock-1',
        customerName: 'Anna Andersson',
        customerEmail: 'anna@example.com',
        customerPhone: '+46701234567',
        bookingDate: new Date(),
        serviceType: 'Hemstädning',
        status: 'pending',
        totalAmount: 1500,
        createdAt: new Date()
      }
    ];
  }, [bookings]);

  // Sort bookings
  const sortedBookings = useMemo(() => {
    if (!mockBookings || mockBookings.length === 0) {
      return [];
    }

    return [...mockBookings].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'bookingDate' || sortBy === 'createdAt') {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [mockBookings, sortBy, sortDirection]);

  console.log('🔧 About to render BookingTable JSX');
  console.log('🔧 Sorted bookings:', sortedBookings);

  // Loading state
  if (loading) {
    console.log('🔧 Rendering loading state');
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
        <span className="ml-2">Laddar bokningar...</span>
      </div>
    );
  }

  // Empty state
  if (!sortedBookings || sortedBookings.length === 0) {
    console.log('🔧 Rendering empty state');
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Inga bokningar hittades</p>
      </div>
    );
  }

  console.log('🔧 Rendering main table');

  // Main table render
  return (
    <div className={`overflow-x-auto ${className || ''}`}>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">🔧 BookingTable Debug Info</h3>
        <p>Bookings count: {mockBookings.length}</p>
        <p>Sorted bookings count: {sortedBookings.length}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Company ID: {companyId}</p>
        <p>Component rendered at: {new Date().toLocaleTimeString()}</p>
      </div>
      
      {/* Simple table for debugging */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tjänst
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Belopp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.customerName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.customerEmail || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(booking.bookingDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(booking.bookingDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.serviceType || 'Standard'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
