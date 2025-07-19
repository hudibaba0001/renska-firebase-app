// webapp/src/components/BookingTable.jsx
import React, { useState, useMemo } from 'react';
import { 
  Table as FlowbiteTable, 
  Button, 
  Badge, 
  Dropdown,
  Modal,
  Card,
  Spinner
} from 'flowbite-react';

// Fix for potential Table undefined issue by creating a fully defined Table object
const Table = FlowbiteTable;

// Import all icons individually to avoid any undefined issues
import { EyeIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { ClockIcon } from '@heroicons/react/24/outline';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

// Create named constants for each icon to avoid alias confusion
const HiEye = EyeIcon;
const HiMail = EnvelopeIcon;
const HiPhone = PhoneIcon;
const HiDotsVertical = EllipsisVerticalIcon;
const HiCalendar = CalendarIcon;
const HiClock = ClockIcon;
const HiCurrencyDollar = CurrencyDollarIcon;
const HiUser = UserIcon;
const HiOfficeBuilding = BuildingOfficeIcon;

// Import components
import BookingStatusManager, { StatusBadge } from './BookingStatusManager';
import BookingService from '../services/bookingService';

// Debug function to help identify undefined components
const debugComponent = (name, component) => {
  if (!component) {
    console.warn(`Component ${name} is undefined!`);
    return false;
  }
  return true;
};

// Make sure all required components are available
debugComponent('Table', Table);
debugComponent('Table.Head', Table?.Head);
debugComponent('Table.Body', Table?.Body);
debugComponent('Table.Row', Table?.Row);
debugComponent('Table.Cell', Table?.Cell);
debugComponent('Table.HeadCell', Table?.HeadCell);
debugComponent('BookingStatusManager', BookingStatusManager);
debugComponent('StatusBadge', StatusBadge);

const BookingTable = ({ 
  bookings = [], 
  loading = false, 
  companyId,
  onBookingUpdate,
  onContactCustomer,
  className = ''
}) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // The handleSort function is defined below

  // Sort bookings
  const sortedBookings = useMemo(() => {
    if (!sortConfig.key) return bookings;

    return [...bookings].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle dates
      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      // Handle strings
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [bookings, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleContactCustomer = (booking, method) => {
    if (method === 'email' && booking.customerEmail) {
      window.location.href = `mailto:${booking.customerEmail}?subject=Angående din bokning ${booking.id}`;
    } else if (method === 'phone' && booking.customerPhone) {
      window.location.href = `tel:${booking.customerPhone}`;
    }
    onContactCustomer && onContactCustomer(booking, method);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Ej angivet';
    return new Date(date).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'Ej angivet';
    return time;
  };
  
  // Helper function to safely render icons with enhanced error handling
  // This is a completely rewritten implementation with defensive checks
  const SafeIcon = ({ icon, fallback, className }) => {
    // Default to a clock icon if nothing is provided
    const FallbackIcon = fallback || HiClock;
    
    try {
      // First, check if the icon is defined
      if (!icon) {
        console.warn('No icon provided to SafeIcon');
        return <FallbackIcon className={className} />;
      }
      
      // Then check if it's a valid React component (function)
      if (typeof icon !== 'function') {
        console.warn('Invalid icon type provided to SafeIcon:', typeof icon);
        return <FallbackIcon className={className} />;
      }
      
      // If everything is fine, render the icon
      const Icon = icon;
      return <Icon className={className} />;
    } catch (error) {
      console.error('Error rendering icon:', error);
      return <FallbackIcon className={className} />;
    }
  };

  const SortableHeader = ({ children, sortKey, className = '' }) => (
    <Table.HeadCell 
      className={`cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </Table.HeadCell>
  );

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-lg shadow">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`}>
        <SafeIcon icon={HiCalendar} fallback={HiClock} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inga bokningar hittades</h3>
        <p className="text-gray-500">Det finns inga bokningar som matchar dina filterkriterier.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table hoverable>
          <Table.Head>
            <SortableHeader sortKey="customerName">Kund</SortableHeader>
            <SortableHeader sortKey="serviceName">Tjänst</SortableHeader>
            <SortableHeader sortKey="bookingDate">Datum & Tid</SortableHeader>
            <SortableHeader sortKey="status">Status</SortableHeader>
            <SortableHeader sortKey="totalAmount">Belopp</SortableHeader>
            <SortableHeader sortKey="createdAt">Skapad</SortableHeader>
            <Table.HeadCell>Åtgärder</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {sortedBookings.map((booking) => (
              <Table.Row key={booking.id} className="bg-white hover:bg-gray-50">
                {/* Customer */}
                <Table.Cell className="font-medium text-gray-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <SafeIcon icon={HiUser} className="w-4 h-4 text-gray-400" />
                      <span>{booking.customerName || 'Okänd kund'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {booking.customerEmail}
                    </div>
                    {booking.customerPhone && (
                      <div className="text-sm text-gray-500">
                        {booking.customerPhone}
                      </div>
                    )}
                  </div>
                </Table.Cell>

                {/* Service */}
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={HiOfficeBuilding} className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{booking.serviceName || 'Okänd tjänst'}</span>
                  </div>
                  {booking.serviceDescription && (
                    <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                      {booking.serviceDescription}
                    </div>
                  )}
                </Table.Cell>

                {/* Date & Time */}
                <Table.Cell>
                  <div className="flex items-center gap-2 mb-1">
                    <SafeIcon icon={HiCalendar} className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={HiClock} className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatTime(booking.bookingTime)}</span>
                  </div>
                </Table.Cell>

                {/* Status */}
                <Table.Cell>
                  <BookingStatusManager 
                    booking={booking}
                    companyId={companyId}
                    onStatusUpdate={onBookingUpdate}
                  />
                </Table.Cell>

                {/* Amount */}
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <SafeIcon icon={HiCurrencyDollar} className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </Table.Cell>

                {/* Created */}
                <Table.Cell className="text-sm text-gray-500">
                  {formatDate(booking.createdAt)}
                </Table.Cell>

                {/* Actions */}
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <SafeIcon icon={HiEye} className="w-3 h-3 mr-1" />
                      Visa
                    </Button>
                    
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <Button size="xs" color="gray">
                          <SafeIcon icon={HiDotsVertical} className="w-3 h-3" />
                        </Button>
                      )}
                    >
                      <Dropdown.Item
                        onClick={() => handleContactCustomer(booking, 'email')}
                        disabled={!booking.customerEmail}
                      >
                        <SafeIcon icon={HiMail} className="w-4 h-4 mr-2" />
                        Skicka e-post
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleContactCustomer(booking, 'phone')}
                        disabled={!booking.customerPhone}
                      >
                        <SafeIcon icon={HiPhone} className="w-4 h-4 mr-2" />
                        Ring kund
                      </Dropdown.Item>
                    </Dropdown>
                  </div>
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
