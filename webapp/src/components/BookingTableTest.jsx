import React from 'react';

// Minimal test component to verify basic rendering
const BookingTableTest = ({ bookings = [] }) => {
  console.log('🧪 BookingTableTest rendering with', bookings.length, 'bookings');
  
  if (bookings.length > 0) {
    console.log('📊 First booking in test:', bookings[0]);
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Booking Table Test</h2>
      <div className="text-sm text-gray-600 mb-4">
        Found {bookings.length} bookings
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No bookings found
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking, index) => (
            <div key={booking.id || index} className="border p-3 rounded">
              <div className="font-medium">{booking.customerName || 'Unknown Customer'}</div>
              <div className="text-sm text-gray-600">
                Status: {booking.status || 'unknown'} | 
                Amount: {booking.totalAmount || 0} | 
                Date: {booking.bookingDate ? booking.bookingDate.toString() : 'No date'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingTableTest;
