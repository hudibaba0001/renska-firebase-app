import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/init';
import toast from 'react-hot-toast';

// Create a new booking
export const createBooking = async (companyId, bookingData) => {
  try {
    const bookingToCreate = {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deleted: false,
      
      // Customer information
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      customerAddress: bookingData.customerAddress,
      
      // Service details
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      
      // Booking specifics
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      area: bookingData.area,
      rooms: bookingData.rooms,
      
      // RUT details if applicable
      useRut: bookingData.useRut || false,
      personnummer: bookingData.personnummer,
      
      // Pricing
      originalPrice: bookingData.originalPrice,
      finalPrice: bookingData.finalPrice,
      rutDiscount: bookingData.rutDiscount || 0,
      
      // Optional fields
      addOns: bookingData.addOns || [],
      specialInstructions: bookingData.specialInstructions,
      frequency: bookingData.frequency || 'one-time',
      
      // Reference to lead if exists
      leadId: bookingData.leadId || null
    };

    const docRef = await addDoc(
      collection(db, `companies/${companyId}/bookings`),
      bookingToCreate
    );

    toast.success('Booking created successfully');
    return { id: docRef.id, ...bookingToCreate };
  } catch (error) {
    console.error('Error creating booking:', error);
    toast.error('Failed to create booking');
    throw error;
  }
};

// Get all bookings with filtering and pagination
export const getBookings = async (companyId, options = {}) => {
  try {
    const {
      status,
      date,
      pageSize = 20,
      lastDoc,
      searchTerm,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options;

    let q = collection(db, `companies/${companyId}/bookings`);

    // Base query - exclude deleted bookings
    q = query(q, where('deleted', '==', false));

    // Apply filters
    if (status) {
      q = query(q, where('status', '==', status));
    }
    if (date) {
      // For date filtering, assume date is a Date object for start of day
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      q = query(q, 
        where('date', '>=', date),
        where('date', '<', endDate)
      );
    }

    // Apply sorting
    q = query(q, orderBy(sortBy, sortOrder));

    // Apply pagination
    q = query(q, limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    let bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply search filter client-side if needed
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      bookings = bookings.filter(booking => 
        booking.customerName?.toLowerCase().includes(term) ||
        booking.customerEmail?.toLowerCase().includes(term) ||
        booking.customerPhone?.includes(term)
      );
    }

    return {
      bookings,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to load bookings');
    throw error;
  }
};

// Update a booking
export const updateBooking = async (companyId, bookingId, updates) => {
  try {
    const bookingRef = doc(db, `companies/${companyId}/bookings`, bookingId);
    
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(bookingRef, updatedData);
    toast.success('Booking updated successfully');
    
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    toast.error('Failed to update booking');
    throw error;
  }
};

// Soft delete a booking
export const deleteBooking = async (companyId, bookingId) => {
  try {
    const bookingRef = doc(db, `companies/${companyId}/bookings`, bookingId);
    
    await updateDoc(bookingRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    toast.success('Booking deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    toast.error('Failed to delete booking');
    throw error;
  }
};

// Get booking statuses for filtering
export const getBookingStatuses = () => {
  return [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];
};

// Get booking statistics
export const getBookingStats = async (companyId) => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, `companies/${companyId}/bookings`),
        where('deleted', '==', false)
      )
    );

    const bookings = snapshot.docs.map(doc => doc.data());
    
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0),
      rutTotal: bookings.reduce((sum, b) => sum + (b.rutDiscount || 0), 0)
    };
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    toast.error('Failed to load booking statistics');
    throw error;
  }
};

/**
 * Get all bookings for a specific customer by email
 * @param {string} customerEmail - Customer's email address
 * @returns {Promise<Array>} Array of bookings
 */
export const getBookingsForCustomer = async (customerEmail) => {
  try {
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    const q = query(
      collection(db, 'bookings'),
      where('customerEmail', '==', customerEmail.toLowerCase()),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    return bookings;
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    toast.error('Failed to load customer bookings');
    throw error;
  }
};

/**
 * Export bookings to CSV format
 * @param {string} companyId - Company ID
 * @param {Object} options - Filter options (status, date range, etc.)
 * @returns {Promise<string>} CSV content
 */
export const exportBookingsToCSV = async (companyId, options = {}) => {
  try {
    // Get all bookings without pagination
    const allBookings = [];
    let lastDoc = null;
    
    do {
      const { bookings, lastDoc: newLastDoc } = await getBookings(companyId, {
        ...options,
        pageSize: 100,
        lastDoc
      });
      
      allBookings.push(...bookings);
      lastDoc = newLastDoc;
    } while (lastDoc);

    // Define CSV headers
    const headers = [
      'Booking ID',
      'Status',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Customer Address',
      'Service',
      'Date',
      'Time',
      'Area (m²)',
      'Rooms',
      'Original Price (SEK)',
      'Final Price (SEK)',
      'RUT Discount (SEK)',
      'Uses RUT',
      'Personnummer',
      'Special Instructions',
      'Created At'
    ];

    // Convert bookings to CSV rows
    const rows = allBookings.map(booking => [
      booking.id,
      booking.status,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone,
      booking.customerAddress,
      booking.serviceName,
      booking.date,
      booking.time,
      booking.area,
      booking.rooms,
      booking.originalPrice,
      booking.finalPrice,
      booking.rutDiscount,
      booking.useRut ? 'Yes' : 'No',
      booking.personnummer,
      booking.specialInstructions,
      new Date(booking.createdAt?.seconds * 1000).toLocaleString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Handle cells that might contain commas or quotes
          if (cell === null || cell === undefined) return '';
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting bookings to CSV:', error);
    toast.error('Failed to export bookings');
    throw error;
  }
};