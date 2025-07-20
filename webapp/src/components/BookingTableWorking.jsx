import React from 'react';
import { Badge, Button } from 'flowbite-react';
import { EyeIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Simple utility functions
const formatDate = (dateValue) => {
  if (!dateValue) return 'Inget datum';
  try {
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString('sv-SE');
    }
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('sv-SE');
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('sv-SE');
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

const BookingTableWorking = ({ bookings = [], loading = false }) => {
  console.log('📋 BookingTableWorking rendering with', bookings.length, 'bookings');
  
  // Debug: Show actual booking data structure
  if (bookings.length > 0) {
    console.log('🔍 First booking structure:', bookings[0]);
    console.log('🔍 Service field options:', {
      serviceType: bookings[0].serviceType,
      service: bookings[0].service,
      serviceName: bookings[0].serviceName,
      type: bookings[0].type
    });
  }
  
  const handleViewBooking = (booking) => {
    console.log('👀 View booking:', booking);
    alert(`Bokningsdetaljer för ${booking.customerName}\n\nStatus: ${booking.status}\nTjänst: ${getServiceName(booking)}\nBelopp: ${formatCurrency(booking.totalAmount)}\nDatum: ${formatDate(booking.bookingDate)}`);
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
    return booking.serviceType || booking.service || booking.serviceName || booking.type || 'Standard';
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Laddar bokningar...</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <p>Inga bokningar hittades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Bokningar ({bookings.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kund
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum & Tid
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <tr key={booking.id || index} className="hover:bg-gray-50">
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
                  {getServiceName(booking)}
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
  );
};

export default BookingTableWorking;
