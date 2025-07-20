// webapp/src/components/BookingTable.jsx
// Debug version to identify the data flow issue
import React, { useState, useMemo } from 'react';
import { Badge, Button, Spinner } from 'flowbite-react';

// Import icons explicitly
import { EyeIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { ClockIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { PhoneIcon } from '@heroicons/react/24/outline';

// StatusBadge component inline implementation to avoid import issues
const StatusBadge = ({ status }) => {
  let color = 'gray';
  let label = status || 'Unknown';
  
  // Map status to appropriate color
  switch(status?.toLowerCase()) {
    case 'pending':
      color = 'yellow';
      break;
    case 'confirmed':
      color = 'blue';
      break;
    case 'completed':
      color = 'green';
      break;
    case 'cancelled':
      color = 'red';
      break;
    case 'rescheduled':
      color = 'purple';
      break;
    default:
      color = 'gray';
  }
  
  return (
    <Badge color={color}>
      {label}
    </Badge>
  );
};

// Simple icon component with error handling
const SimpleIcon = ({ icon: Icon, className = 'w-4 h-4' }) => {
  if (!Icon) return null;
  
  try {
    return <Icon className={className} />;
  } catch (error) {
    console.error('Error rendering icon:', error);
    return null;
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
  
  try {
    const [sortBy, setSortBy] = useState('bookingDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [viewBooking, setViewBooking] = useState(null);
    
    // Debug logging
    console.log('🔧 BookingTable props:', {
      bookingsCount: bookings?.length || 0,
      bookings: bookings,
      loading,
      companyId
    });
  
  // Mock data for testing if no bookings are provided
  const mockBookings = useMemo(() => {
    return bookings?.length > 0 ? bookings : [
      {
        id: 'mock-1',
        customerName: 'Test Kund',
        customerEmail: 'test@example.com',
        customerPhone: '070-123-4567',
        serviceType: 'Standard Städning',
        bookingDate: new Date(),
        status: 'pending',
        totalAmount: 1500,
        address: 'Testgatan 123, Stockholm'
      }
    ];
  }, [bookings]);
  
  console.log('Using bookings:', mockBookings);
  
  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    try {
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
      }).format(Number(amount));
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'Invalid Amount';
    }
  };

  // Sort the bookings
  const sortedBookings = useMemo(() => {
    if (!mockBookings || !mockBookings.length) return [];
    
    try {
      return [...mockBookings].sort((a, b) => {
        if (!a || !b) return 0;
        
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        // Handle sorting for different data types
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        // For dates
        if (aValue instanceof Date || (aValue && aValue.toDate) || 
            bValue instanceof Date || (bValue && bValue.toDate)) {
          const aDate = aValue && aValue.toDate ? aValue.toDate() : aValue;
          const bDate = bValue && bValue.toDate ? bValue.toDate() : bValue;
          
          return sortDirection === 'asc' 
            ? new Date(aDate) - new Date(bDate) 
            : new Date(bDate) - new Date(aDate);
        }
        
        // For strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // For numbers
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
    } catch (error) {
      console.error('Error sorting bookings:', error);
      return [...mockBookings];
    }
  }, [mockBookings, sortBy, sortDirection]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

    // Debug table as default return
    return (
      <div className={`overflow-x-auto ${className || ''}`}>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Debug Info</h3>
          <p>Bookings count: {mockBookings.length}</p>
          <p>Sorted bookings count: {sortedBookings.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Company ID: {companyId}</p>
        </div>
      
      {/* Simple table for debugging */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.customerName || 'Unknown'}
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
