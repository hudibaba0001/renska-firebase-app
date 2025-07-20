import React from 'react';

// Minimal BookingTable with no external dependencies
const BookingTable = ({ 
  bookings = [], 
  loading = false,
  companyId,
  className
}) => {
  console.log('🔧 MINIMAL BookingTable rendering!');
  console.log('🔧 Props:', { bookingsCount: bookings?.length, loading, companyId });

  // Use real bookings or create simple mock data
  const displayBookings = bookings && bookings.length > 0 ? bookings : [
    {
      id: 'test-1',
      customerName: 'Test Kund',
      customerEmail: 'test@example.com',
      serviceType: 'Hemstädning',
      status: 'pending',
      totalAmount: 1500,
      bookingDate: new Date()
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Laddar bokningar...</p>
      </div>
    );
  }

  return (
    <div className={`${className || ''}`} style={{ backgroundColor: 'red', padding: '20px', margin: '20px', border: '5px solid black' }}>
      {/* SUPER VISIBLE Debug section */}
      <div style={{ backgroundColor: 'yellow', border: '3px solid red', padding: '20px', margin: '10px' }}>
        <h3 style={{ fontSize: '24px', color: 'red', fontWeight: 'bold' }}>🚨 MINIMAL BookingTable Debug - SHOULD BE VISIBLE! 🚨</h3>
        <p style={{ fontSize: '18px', color: 'black' }}>Bookings count: {displayBookings.length}</p>
        <p style={{ fontSize: '18px', color: 'black' }}>Loading: {loading ? 'Yes' : 'No'}</p>
        <p style={{ fontSize: '18px', color: 'black' }}>Company ID: {companyId}</p>
        <p style={{ fontSize: '18px', color: 'black' }}>Rendered at: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* SUPER VISIBLE Simple table */}
      <div style={{ backgroundColor: 'lime', border: '3px solid blue', padding: '10px' }}>
        <h2 style={{ fontSize: '20px', color: 'blue', fontWeight: 'bold' }}>📊 TABLE SHOULD BE HERE! 📊</h2>
        <table style={{ width: '100%', border: '2px solid black', backgroundColor: 'white' }}>
          <thead style={{ backgroundColor: 'orange' }}>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Kund</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tjänst</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Belopp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayBookings.map((booking, index) => (
              <tr key={booking.id || index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">
                  {booking.customerName || 'Okänd kund'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {booking.serviceType || 'Standard'}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {booking.status || 'Väntande'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {booking.totalAmount ? `${booking.totalAmount} kr` : '0 kr'}
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
