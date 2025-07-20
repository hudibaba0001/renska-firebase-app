import React from 'react';

// Ultra simple BookingTable - just text
const BookingTable = ({ bookings = [], loading = false, companyId, className }) => {
  console.log('🚨 ULTRA SIMPLE BookingTable rendering!');
  console.log('🚨 Props:', { bookingsCount: bookings?.length, loading, companyId });

  return (
    <div style={{ 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '50px', 
      margin: '20px',
      border: '10px solid black',
      fontSize: '30px',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      🚨 ULTRA SIMPLE BOOKING TABLE IS WORKING! 🚨
      <br />
      Bookings: {bookings?.length || 0}
      <br />
      Loading: {loading ? 'YES' : 'NO'}
      <br />
      Time: {new Date().toLocaleTimeString()}
    </div>
  );
};

export default BookingTable;
