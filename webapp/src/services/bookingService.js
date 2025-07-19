// webapp/src/services/bookingService.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

/**
 * Booking Service - Handles all booking-related operations
 */
export class BookingService {
  
  /**
   * Get all bookings for a company with optional filtering
   */
  static async getBookingsForCompany(companyId, filters = {}) {
    try {
      const bookingsRef = collection(db, 'bookings');
      let q = query(
        bookingsRef, 
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      // Apply date range filter
      if (filters.startDate && filters.endDate) {
        q = query(q, 
          where('bookingDate', '>=', filters.startDate),
          where('bookingDate', '<=', filters.endDate)
        );
      }

      // Apply pagination
      if (filters.lastDoc) {
        q = query(q, startAfter(filters.lastDoc));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const bookings = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to JavaScript dates
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          bookingDate: data.bookingDate?.toDate(),
        });
      });

      return {
        bookings,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === (filters.limit || 50)
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Fel vid hämtning av bokningar');
      return { bookings: [], lastDoc: null, hasMore: false };
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(bookingId, newStatus, adminNote = '') {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      // Add status history entry
      const statusHistoryEntry = {
        status: newStatus,
        timestamp: serverTimestamp(),
        note: adminNote,
        updatedBy: 'admin' // TODO: Replace with actual admin user ID
      };

      // If status history doesn't exist, create it
      updateData.statusHistory = [statusHistoryEntry];

      await updateDoc(bookingRef, updateData);
      
      toast.success(`Bokningsstatus uppdaterad till ${this.getStatusLabel(newStatus)}`);
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Fel vid uppdatering av bokningsstatus');
      return false;
    }
  }

  /**
   * Search bookings by text (customer name, email, phone, service)
   */
  static async searchBookings(companyId, searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified implementation - in production, consider using Algolia or similar
      const bookings = await this.getBookingsForCompany(companyId);
      
      const filteredBookings = bookings.bookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.customerName?.toLowerCase().includes(searchLower) ||
          booking.customerEmail?.toLowerCase().includes(searchLower) ||
          booking.customerPhone?.includes(searchTerm) ||
          booking.serviceName?.toLowerCase().includes(searchLower) ||
          booking.id.toLowerCase().includes(searchLower)
        );
      });

      return { bookings: filteredBookings, lastDoc: null, hasMore: false };
    } catch (error) {
      console.error('Error searching bookings:', error);
      toast.error('Fel vid sökning av bokningar');
      return { bookings: [], lastDoc: null, hasMore: false };
    }
  }

  /**
   * Get booking statistics for dashboard
   */
  static async getBookingStats(companyId, dateRange = 'month') {
    try {
      const bookings = await this.getBookingsForCompany(companyId);
      const allBookings = bookings.bookings;

      const stats = {
        total: allBookings.length,
        pending: allBookings.filter(b => b.status === 'pending').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        completed: allBookings.filter(b => b.status === 'completed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: allBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        averageBookingValue: 0
      };

      if (stats.completed > 0) {
        stats.averageBookingValue = stats.totalRevenue / stats.completed;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageBookingValue: 0
      };
    }
  }

  /**
   * Export bookings to CSV format
   */
  static exportBookingsToCSV(bookings) {
    try {
      const headers = [
        'Boknings-ID',
        'Kundnamn',
        'E-post',
        'Telefon',
        'Tjänst',
        'Bokningsdatum',
        'Tid',
        'Status',
        'Belopp (kr)',
        'Skapad',
        'Uppdaterad'
      ];

      const csvData = bookings.map(booking => [
        booking.id,
        booking.customerName || '',
        booking.customerEmail || '',
        booking.customerPhone || '',
        booking.serviceName || '',
        booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('sv-SE') : '',
        booking.bookingTime || '',
        this.getStatusLabel(booking.status),
        booking.totalAmount || 0,
        booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('sv-SE') : '',
        booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString('sv-SE') : ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bokningar_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Bokningar exporterade till CSV');
      return true;
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Fel vid export av bokningar');
      return false;
    }
  }

  /**
   * Get human-readable status label
   */
  static getStatusLabel(status) {
    const statusLabels = {
      'pending': 'Väntande',
      'confirmed': 'Bekräftad',
      'completed': 'Slutförd',
      'cancelled': 'Avbokad'
    };
    return statusLabels[status] || status;
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status) {
    const statusColors = {
      'pending': 'yellow',
      'confirmed': 'blue',
      'completed': 'green',
      'cancelled': 'red'
    };
    return statusColors[status] || 'gray';
  }

  /**
   * Send notification to customer (placeholder for future implementation)
   */
  static async sendCustomerNotification(bookingId, type, message) {
    try {
      // TODO: Implement email/SMS notification service
      console.log('Sending notification:', { bookingId, type, message });
      
      // For now, just log the notification
      const notificationRef = collection(db, 'notifications');
      await addDoc(notificationRef, {
        bookingId,
        type,
        message,
        status: 'sent',
        createdAt: serverTimestamp()
      });

      toast.success('Meddelande skickat till kund');
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Fel vid skickande av meddelande');
      return false;
    }
  }
}

export default BookingService;
