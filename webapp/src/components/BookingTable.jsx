// webapp/src/components/BookingTable.jsx
// Completely rewritten with native HTML table and minimal dependencies
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
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewBooking, setViewBooking] = useState(null);
  
  // Helper functions for sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Helper function for date/time formatting
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      // Check if it's a Firebase Timestamp
      if (date.toDate) {
        date = date.toDate();
      }
      // Check if it's a valid Date object
      if (date instanceof Date) {
        return date.toLocaleDateString('sv-SE', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      }
      return String(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      // Check if it's a Firebase Timestamp
      if (time.toDate) {
        time = time.toDate();
      }
      // Check if it's a valid Date object
      if (time instanceof Date) {
        return time.toLocaleTimeString('sv-SE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return String(time);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

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

  // Helper component for sortable headers
  const SortableHeader = ({ field, children }) => {
    const isSorted = sortBy === field;
    return (
      <th 
        className="px-4 py-2 cursor-pointer hover:bg-gray-50" 
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center">
          <span>{children}</span>
          {isSorted && (
            <span className="ml-1">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Sort the bookings
  const sortedBookings = useMemo(() => {
    if (!bookings || !bookings.length) return [];
    
    try {
      return [...bookings].sort((a, b) => {
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
      return [...bookings];
    }
  }, [bookings, sortBy, sortDirection]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  // No bookings state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No bookings available</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className || ''}`}>
      {/* Native HTML table instead of Flowbite Table */}
      <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <SortableHeader field="customerName">Customer</SortableHeader>
            <SortableHeader field="serviceType">Service</SortableHeader>
            <SortableHeader field="bookingDate">Booking Date</SortableHeader>
            <SortableHeader field="bookingTime">Time</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="totalAmount">Amount</SortableHeader>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedBookings.map((booking) => {
            if (!booking) return null; // Safety check
            
            return (
              <tr 
                key={booking.id || Math.random().toString(36).substring(7)} 
                className="bg-white border-b hover:bg-gray-50"
              >
                {/* Customer Name */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={UserIcon} className="w-4 h-4 mr-2" />
                    <span>{booking.customerName || 'Unknown'}</span>
                  </div>
                </td>
                
                {/* Service Type */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={BuildingOfficeIcon} className="w-4 h-4 mr-2" />
                    <span>{booking.serviceType || 'Standard'}</span>
                  </div>
                </td>
                
                {/* Booking Date */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={CalendarIcon} className="w-4 h-4 mr-2" />
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                </td>
                
                {/* Booking Time */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={ClockIcon} className="w-4 h-4 mr-2" />
                    <span>{formatTime(booking.bookingDate)}</span>
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-4 py-2">
                  {booking.status && (
                    <StatusBadge status={booking.status} />
                  )}
                </td>
                
                {/* Total Amount */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={CurrencyDollarIcon} className="w-4 h-4 mr-2" />
                    <span>{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </td>
                
                {/* Actions */}
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <Button 
                      size="xs" 
                      color="light"  
                      onClick={() => setViewBooking(booking)}
                    >
                      <SimpleIcon icon={EyeIcon} className="w-4 h-4" />
                      <span className="ml-1">View</span>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Booking Details Modal */}
      {viewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setViewBooking(null)}>
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">
              Booking Details
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium">Customer Information</h3>
                <p><strong>Name:</strong> {viewBooking.customerName}</p>
                <p><strong>Email:</strong> {viewBooking.customerEmail}</p>
                <p><strong>Phone:</strong> {viewBooking.customerPhone}</p>
              </div>
              <div>
                <h3 className="font-medium">Booking Details</h3>
                <p><strong>Service:</strong> {viewBooking.serviceType}</p>
                <p><strong>Date:</strong> {formatDate(viewBooking.bookingDate)}</p>
                <p><strong>Time:</strong> {formatTime(viewBooking.bookingDate)}</p>
                <p><strong>Status:</strong> {viewBooking.status}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium">Service Address</h3>
              <p>{viewBooking.address || 'No address provided'}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium">Payment Information</h3>
              <p><strong>Total:</strong> {formatCurrency(viewBooking.totalAmount)}</p>
              <p><strong>Payment Method:</strong> {viewBooking.paymentMethod || 'Not specified'}</p>
              <p><strong>Payment Status:</strong> {viewBooking.paymentStatus || 'Not specified'}</p>
            </div>
            
            <div className="mt-4 space-x-2 flex justify-end">
              {onContactCustomer && (
                <div className="flex space-x-2 mr-auto">
                  <Button 
                    size="sm"
                    color="light"
                    onClick={() => onContactCustomer(viewBooking, 'email')}
                  >
                    <SimpleIcon icon={EnvelopeIcon} />
                    <span className="ml-1">Email</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    color="light"
                    onClick={() => onContactCustomer(viewBooking, 'phone')}
                  >
                    <SimpleIcon icon={PhoneIcon} />
                    <span className="ml-1">Call</span>
                  </Button>
                </div>
              )}
              
              <Button color="light" onClick={() => setViewBooking(null)}>
                Close
              </Button>
              
              {onBookingUpdate && (
                <Button 
                  color="blue" 
                  onClick={() => {
                    onBookingUpdate(viewBooking);
                    setViewBooking(null);
                  }}
                >
                  Update Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
// Complete rewrite using HTML native table elements to eliminate component errors
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
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewBooking, setViewBooking] = useState(null);
  
  // Helper functions for sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Helper function for date/time formatting
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      // Check if it's a Firebase Timestamp
      if (date.toDate) {
        date = date.toDate();
      }
      // Check if it's a valid Date object
      if (date instanceof Date) {
        return date.toLocaleDateString('sv-SE', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      }
      return String(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    try {
      // Check if it's a Firebase Timestamp
      if (time.toDate) {
        time = time.toDate();
      }
      // Check if it's a valid Date object
      if (time instanceof Date) {
        return time.toLocaleTimeString('sv-SE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return String(time);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

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

  // Helper component for sortable headers
  const SortableHeader = ({ field, children }) => {
    const isSorted = sortBy === field;
    return (
      <th 
        className="px-4 py-2 cursor-pointer hover:bg-gray-50" 
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center">
          <span>{children}</span>
          {isSorted && (
            <span className="ml-1">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Sort the bookings
  const sortedBookings = useMemo(() => {
    if (!bookings || !bookings.length) return [];
    
    try {
      return [...bookings].sort((a, b) => {
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
      return [...bookings];
    }
  }, [bookings, sortBy, sortDirection]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  // No bookings state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No bookings available</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className || ''}`}>
      {/* Native HTML table instead of Flowbite Table */}
      <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <SortableHeader field="customerName">Customer</SortableHeader>
            <SortableHeader field="serviceType">Service</SortableHeader>
            <SortableHeader field="bookingDate">Booking Date</SortableHeader>
            <SortableHeader field="bookingTime">Time</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="totalAmount">Amount</SortableHeader>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedBookings.map((booking) => {
            if (!booking) return null; // Safety check
            
            return (
              <tr 
                key={booking.id || Math.random().toString(36).substring(7)} 
                className="bg-white border-b hover:bg-gray-50"
              >
                {/* Customer Name */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={UserIcon} className="w-4 h-4 mr-2" />
                    <span>{booking.customerName || 'Unknown'}</span>
                  </div>
                </td>
                
                {/* Service Type */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={BuildingOfficeIcon} className="w-4 h-4 mr-2" />
                    <span>{booking.serviceType || 'Standard'}</span>
                  </div>
                </td>
                
                {/* Booking Date */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={CalendarIcon} className="w-4 h-4 mr-2" />
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                </td>
                
                {/* Booking Time */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={ClockIcon} className="w-4 h-4 mr-2" />
                    <span>{formatTime(booking.bookingDate)}</span>
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-4 py-2">
                  {booking.status && (
                    <StatusBadge status={booking.status} />
                  )}
                </td>
                
                {/* Total Amount */}
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <SimpleIcon icon={CurrencyDollarIcon} className="w-4 h-4 mr-2" />
                    <span>{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </td>
                
                {/* Actions */}
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <Button 
                      size="xs" 
                      color="light"  
                      onClick={() => setViewBooking(booking)}
                    >
                      <SimpleIcon icon={EyeIcon} className="w-4 h-4" />
                      <span className="ml-1">View</span>
                    </Button>
                  </div>
                </td>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Booking Detail Modal */}
      <Modal 
        show={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        size="2xl"
      >
        <Modal.Header>
          Bokningsdetaljer - {selectedBooking?.id}
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kundinformation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Namn</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.customerName || 'Ej angivet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-post</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.customerEmail || 'Ej angivet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.customerPhone || 'Ej angivet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adress</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.customerAddress || 'Ej angivet'}</p>
                  </div>
                </div>
              </Card>

              {/* Service Information */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tjänstinformation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tjänst</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.serviceName || 'Ej angivet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pris</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Datum</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tid</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTime(selectedBooking.bookingTime)}</p>
                  </div>
                </div>
                {selectedBooking.serviceDescription && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.serviceDescription}</p>
                  </div>
                )}
              </Card>

              {/* Booking Status */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <BookingStatusManager 
                  booking={selectedBooking}
                  companyId={companyId}
                  onStatusUpdate={onBookingUpdate}
                />
              </Card>

              {/* Additional Information */}
              {selectedBooking.notes && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Anteckningar</h3>
                  <p className="text-sm text-gray-900">{selectedBooking.notes}</p>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setIsDetailModalOpen(false)}>
            Stäng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingTable;
