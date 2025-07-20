import React, { useState } from 'react';
import { Badge, Button } from 'flowbite-react';
import { 
  EyeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyEuroIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Enhanced utility functions
const formatDate = (dateValue) => {
  if (!dateValue) return 'Inget datum';
  try {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('sv-SE', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('sv-SE', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('sv-SE', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
  } catch (error) {
    console.warn('Date formatting error:', error);
  }
  return 'Inget datum';
};

const formatTime = (dateValue) => {
  if (!dateValue) return 'Ingen tid';
  try {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch (error) {
    console.warn('Time formatting error:', error);
  }
  return 'Ingen tid';
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 kr';
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!isNaN(num)) {
      return `${num.toLocaleString('sv-SE')} kr`;
    }
  } catch (error) {
    console.warn('Currency formatting error:', error);
  }
  return '0 kr';
};

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
      case 'väntande':
        return { 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          text: 'Väntande',
          icon: '⏳'
        };
      case 'confirmed':
      case 'bekräftad':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          text: 'Bekräftad',
          icon: '✅'
        };
      case 'completed':
      case 'slutförd':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          text: 'Slutförd',
          icon: '🎉'
        };
      case 'cancelled':
      case 'avbokad':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          text: 'Avbokad',
          icon: '❌'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          text: status || 'Okänd',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

const BookingTablePremium = ({ bookings = [], loading = false }) => {
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  console.log('📋 BookingTablePremium rendering with', bookings.length, 'bookings');
  
  // Debug: Show actual booking data structure
  if (bookings.length > 0) {
    console.log('🔍 First booking structure:', bookings[0]);
  }
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'bookingDate') {
      aValue = aValue ? new Date(aValue) : new Date(0);
      bValue = bValue ? new Date(bValue) : new Date(0);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };
  
  const handleContactCustomer = (booking, method) => {
    if (method === 'phone' && booking.customerPhone) {
      window.open(`tel:${booking.customerPhone}`);
    } else if (method === 'email' && booking.customerEmail) {
      const subject = encodeURIComponent(`Angående din bokning - ${booking.id}`);
      const body = encodeURIComponent(`Hej ${booking.customerName || 'kund'},\n\nAngående din bokning.\n\nMed vänliga hälsningar,\nDitt städteam`);
      window.open(`mailto:${booking.customerEmail}?subject=${subject}&body=${body}`);
    } else {
      alert(`Ingen ${method === 'phone' ? 'telefonnummer' : 'e-postadress'} tillgänglig för denna kund.`);
    }
  };
  
  // Get the correct service name from booking data
  const getServiceName = (booking) => {
    const serviceName = booking.serviceType || booking.service || booking.serviceName || booking.type;
    // If it's an encoded ID, show a friendly name
    if (serviceName && serviceName.includes('eSAd41JyQKSkmzSJTy')) {
      return 'Premium Städning';
    }
    return serviceName || 'Standard Städning';
  };

  const SortableHeader = ({ column, children, icon: Icon }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <span>{children}</span>
        {sortBy === column && (
          sortDirection === 'asc' ? 
            <ChevronUpIcon className="w-4 h-4 text-blue-600" /> : 
            <ChevronDownIcon className="w-4 h-4 text-blue-600" />
        )}
      </div>
    </th>
  );
  
  if (loading) {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 animate-ping"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Laddar bokningar...</p>
          <p className="text-sm text-gray-500">Hämtar senaste data från systemet</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga bokningar hittades</h3>
          <p className="text-gray-500">Det finns inga bokningar att visa för tillfället.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bokningshantering</h3>
              <p className="text-blue-100 text-sm">{bookings.length} aktiva bokningar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-white font-medium">{sortedBookings.length}</span>
              <span className="text-blue-100 text-sm ml-1">totalt</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader column="customerName" icon={UserIcon}>
                Kund
              </SortableHeader>
              <SortableHeader column="bookingDate" icon={CalendarDaysIcon}>
                Datum & Tid
              </SortableHeader>
              <SortableHeader column="serviceType" icon={BuildingOfficeIcon}>
                Tjänst
              </SortableHeader>
              <SortableHeader column="status">
                Status
              </SortableHeader>
              <SortableHeader column="totalAmount" icon={CurrencyEuroIcon}>
                Belopp
              </SortableHeader>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedBookings.map((booking, index) => (
              <tr key={booking.id || index} className="hover:bg-blue-50/50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(booking.customerName || 'OK').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.customerName || 'Okänd kund'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        {booking.customerEmail || 'Ingen e-post'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                      {formatDate(booking.bookingDate)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      {formatTime(booking.bookingDate)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {getServiceName(booking)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <CurrencyEuroIcon className="w-4 h-4 text-green-500" />
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Visa
                    </button>
                    <button
                      onClick={() => handleContactCustomer(booking, 'phone')}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      title="Ring kund"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContactCustomer(booking, 'email')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                      title="Skicka e-post"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBooking && showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedBooking.customerName}
                    </h3>
                    <p className="text-blue-100">Bokningsdetaljer</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Kundinformation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Namn</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">E-post</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Telefon</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Adress</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  Bokningsinformation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Datum</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tid</p>
                    <p className="font-semibold text-gray-900">{formatTime(selectedBooking.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tjänst</p>
                    <p className="font-semibold text-gray-900">{getServiceName(selectedBooking)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Belopp</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedBooking.totalAmount)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">Anteckningar</h4>
                  <p className="text-gray-700">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => handleContactCustomer(selectedBooking, 'phone')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Ring
                </button>
                <button
                  onClick={() => handleContactCustomer(selectedBooking, 'email')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  E-post
                </button>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTablePremium;
