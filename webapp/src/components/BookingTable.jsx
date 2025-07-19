// webapp/src/components/BookingTable.jsx
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Badge, 
  Dropdown,
  Modal,
  Card
} from 'flowbite-react';
import { 
  HiEye, 
  HiMail, 
  HiPhone, 
  HiDotsVertical,
  HiCalendar,
  HiClock,
  HiCurrencyDollar,
  HiUser,
  HiOfficeBuilding
} from 'react-icons/hi';
import BookingStatusManager from './BookingStatusManager';
import BookingService from '../services/bookingService';

const BookingTable = ({ 
  bookings = [], 
  loading = false, 
  onBookingUpdate,
  onContactCustomer,
  className = ''
}) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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
        <HiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                      <HiUser className="w-4 h-4 text-gray-400" />
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
                    <HiOfficeBuilding className="w-4 h-4 text-gray-400" />
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
                    <HiCalendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatTime(booking.bookingTime)}</span>
                  </div>
                </Table.Cell>

                {/* Status */}
                <Table.Cell>
                  <BookingStatusManager 
                    booking={booking}
                    onStatusUpdate={onBookingUpdate}
                  />
                </Table.Cell>

                {/* Amount */}
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <HiCurrencyDollar className="w-4 h-4 text-gray-400" />
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
                      <HiEye className="w-3 h-3 mr-1" />
                      Visa
                    </Button>
                    
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <Button size="xs" color="gray">
                          <HiDotsVertical className="w-3 h-3" />
                        </Button>
                      )}
                    >
                      <Dropdown.Item
                        onClick={() => handleContactCustomer(booking, 'email')}
                        disabled={!booking.customerEmail}
                      >
                        <HiMail className="w-4 h-4 mr-2" />
                        Skicka e-post
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleContactCustomer(booking, 'phone')}
                        disabled={!booking.customerPhone}
                      >
                        <HiPhone className="w-4 h-4 mr-2" />
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
