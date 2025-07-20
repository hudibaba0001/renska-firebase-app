import React, { useState, useMemo } from 'react';
import { Badge, Button, Modal, Spinner } from 'flowbite-react';
import { 
  EyeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      // English statuses (from database)
      'pending': { color: 'warning', text: 'Väntande' },
      'confirmed': { color: 'info', text: 'Bekräftad' },
      'completed': { color: 'success', text: 'Slutförd' },
      'cancelled': { color: 'failure', text: 'Avbokad' },
      // Swedish statuses (legacy)
      'väntande': { color: 'warning', text: 'Väntande' },
      'bekräftad': { color: 'info', text: 'Bekräftad' },
      'slutförd': { color: 'success', text: 'Slutförd' },
      'avbokad': { color: 'failure', text: 'Avbokad' }
    };
    
    const normalizedStatus = status?.toLowerCase();
    return statusMap[normalizedStatus] || { color: 'gray', text: status || 'Okänd' };
  };

  const config = getStatusConfig(status);
  return <Badge color={config.color}>{config.text}</Badge>;
};

// Simplified Utility Functions
const formatDate = (dateValue) => {
  try {
    // Handle null, undefined, or empty values
    if (!dateValue || dateValue === '' || dateValue === 'No date') {
      return 'Inget datum';
    }
    
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('sv-SE');
    }
    
    // Handle JavaScript Date
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue.toLocaleDateString('sv-SE');
    }
    
    // Handle string dates
    if (typeof dateValue === 'string' && dateValue.trim() !== '') {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('sv-SE');
      }
    }
    
    // Handle timestamp numbers
    if (typeof dateValue === 'number' && dateValue > 0) {
      const jsDate = new Date(dateValue);
      if (!isNaN(jsDate.getTime())) {
        return jsDate.toLocaleDateString('sv-SE');
      }
    }
    
    return 'Inget datum';
  } catch {
    return 'Inget datum';
  }
};

const formatTime = (dateValue) => {
  try {
    if (!dateValue || dateValue === '' || dateValue === 'No date') {
      return 'Ingen tid';
    }
    
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Handle JavaScript Date
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Handle string dates
    if (typeof dateValue === 'string' && dateValue.trim() !== '') {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      }
    }
    
    // Handle timestamp numbers
    if (typeof dateValue === 'number' && dateValue > 0) {
      const jsDate = new Date(dateValue);
      if (!isNaN(jsDate.getTime())) {
        return jsDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      }
    }
    
    return 'Ingen tid';
  } catch {
    return 'Ingen tid';
  }
};

const formatCurrency = (amount) => {
  try {
    if (amount === null || amount === undefined) {
      return '0 kr';
    }
    
    // Handle string numbers
    if (typeof amount === 'string') {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        return `${numAmount.toLocaleString('sv-SE')} kr`;
      }
    }
    
    // Handle numbers
    if (typeof amount === 'number' && !isNaN(amount)) {
      return `${amount.toLocaleString('sv-SE')} kr`;
    }
    
    return '0 kr';
  } catch {
    return '0 kr';
  }
};

// Booking Details Modal
const BookingDetailsModal = ({ booking, isOpen, onClose, onStatusUpdate, onContactCustomer }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(booking, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        Bokningsdetaljer - {booking.customerName}
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Kundinformation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Namn</p>
                <p className="font-medium">{booking.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-post</p>
                <p className="font-medium">{booking.customerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-medium">{booking.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adress</p>
                <p className="font-medium">{booking.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Bokningsinformation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Datum</p>
                <p className="font-medium">{formatDate(booking.bookingDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tid</p>
                <p className="font-medium">{formatTime(booking.bookingDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tjänst</p>
                <p className="font-medium">{booking.serviceType || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Belopp</p>
                <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
            <div className="flex items-center gap-4">
              <StatusBadge status={booking.status} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="success"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updatingStatus || booking.status === 'confirmed'}
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Bekräfta
                </Button>
                <Button
                  size="sm"
                  color="info"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updatingStatus || booking.status === 'completed'}
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Slutför
                </Button>
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updatingStatus || booking.status === 'cancelled'}
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Avboka
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Anteckningar</h3>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button
              color="gray"
              onClick={() => onContactCustomer(booking, 'phone')}
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              Ring
            </Button>
            <Button
              color="gray"
              onClick={() => onContactCustomer(booking, 'email')}
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              E-post
            </Button>
          </div>
          <Button onClick={onClose}>
            Stäng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

// Main BookingTable Component
const BookingTable = ({ 
  bookings = [], 
  loading = false,
  onBookingUpdate,
  onContactCustomer,
  className
}) => {
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Debug: Log first booking to understand data structure
  if (bookings.length > 0) {
    console.log('📊 First booking data structure:', bookings[0]);
  }
  const [showModal, setShowModal] = useState(false);

  console.log('📋 Professional BookingTable rendering with', bookings?.length || 0, 'bookings');

  // Sort bookings
  const sortedBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [];
    }

    return [...bookings].sort((a, b) => {
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
  }, [bookings, sortBy, sortDirection]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    console.log(`🔄 Updating booking ${booking.id} status to:`, newStatus);
    if (onBookingUpdate) {
      try {
        await onBookingUpdate(booking.id, { status: newStatus });
        console.log(`✅ Successfully updated booking ${booking.id} status`);
      } catch (error) {
        console.error(`❌ Failed to update booking ${booking.id}:`, error);
      }
    } else {
      console.warn('⚠️ onBookingUpdate handler not provided');
    }
  };

  const handleContactCustomer = (booking, method) => {
    console.log(`📞 Contacting customer for booking ${booking.id} via:`, method);
    
    if (method === 'phone' && booking.customerPhone) {
      // Open phone dialer
      window.open(`tel:${booking.customerPhone}`);
      console.log(`📞 Opening phone dialer for: ${booking.customerPhone}`);
    } else if (method === 'email' && booking.customerEmail) {
      // Open email client
      const subject = encodeURIComponent(`Angående din bokning - ${booking.id}`);
      const body = encodeURIComponent(`Hej ${booking.customerName || 'kund'},\n\nAngående din bokning för ${booking.serviceType || 'tjänst'} den ${formatDate(booking.bookingDate, booking.id)}.\n\nMed vänliga hälsningar,\nDitt städteam`);
      window.open(`mailto:${booking.customerEmail}?subject=${subject}&body=${body}`);
      console.log(`📧 Opening email client for: ${booking.customerEmail}`);
    } else {
      console.warn(`⚠️ No contact info available for ${method}:`, {
        phone: booking.customerPhone,
        email: booking.customerEmail
      });
      alert(`Ingen ${method === 'phone' ? 'telefonnummer' : 'e-postadress'} tillgänglig för denna kund.`);
    }
    
    if (onContactCustomer) {
      onContactCustomer(booking, method);
    }
  };

  const SortableHeader = ({ column, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          sortDirection === 'asc' ? 
            <ChevronUpIcon className="w-4 h-4" /> : 
            <ChevronDownIcon className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Laddar bokningar...</span>
      </div>
    );
  }

  // Empty state
  if (!sortedBookings || sortedBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inga bokningar</h3>
        <p className="text-gray-500">Det finns inga bokningar att visa för tillfället.</p>
      </div>
    );
  }

  // Main table render
  return (
    <div className={`${className || ''}`}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader column="customerName">Kund</SortableHeader>
                <SortableHeader column="bookingDate">Datum & Tid</SortableHeader>
                <SortableHeader column="serviceType">Tjänst</SortableHeader>
                <SortableHeader column="status">Status</SortableHeader>
                <SortableHeader column="totalAmount">Belopp</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName || 'Okänd kund'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerEmail || 'Ingen e-post'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(booking.bookingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.serviceType || 'Standard'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Visa
                      </Button>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => handleContactCustomer(booking, 'phone')}
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="xs"
                        color="green"
                        onClick={() => handleContactCustomer(booking, 'email')}
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStatusUpdate={handleStatusUpdate}
        onContactCustomer={handleContactCustomer}
      />
    </div>
  );
};

export default BookingTable;
