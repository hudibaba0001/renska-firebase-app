import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  getFirestore,
  Timestamp 
} from 'firebase/firestore';

/**
 * Analytics service for SwedPrime platform
 * Handles data aggregation for both superadmin and company dashboards
 */

const db = getFirestore();

/**
 * SUPERADMIN ANALYTICS
 * Functions for platform-wide metrics
 */

export async function getSuperadminMetrics() {
  try {
    // Get all companies
    const companiesRef = collection(db, 'companies');
    const companiesSnapshot = await getDocs(companiesRef);
    const companies = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate active companies
    const activeCompanies = companies.filter(
      company => company.subscriptionStatus === 'active'
    );

    // Calculate suspended companies
    const suspendedCompanies = companies.filter(
      company => company.subscriptionStatus === 'suspended'
    );

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeCompanies.reduce((total, company) => {
      return total + (company.subscriptionAmount || 0);
    }, 0);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calculate churn rate (simplified - in real implementation, track over time)
    const totalCompanies = companies.length;
    const churnedCompanies = companies.filter(
      company => company.subscriptionStatus === 'cancelled'
    );
    const churnRate = totalCompanies > 0 ? (churnedCompanies.length / totalCompanies) * 100 : 0;

    // Get total active users across all companies
    let totalActiveUsers = 0;
    for (const company of activeCompanies) {
      const usersRef = collection(db, 'companies', company.id, 'users');
      const usersSnapshot = await getDocs(usersRef);
      totalActiveUsers += usersSnapshot.size;
    }

    return {
      activeCompanies: activeCompanies.length,
      suspendedCompanies: suspendedCompanies.length,
      mrr,
      arr,
      churnRate,
      totalActiveUsers,
      totalCompanies: companies.length,
      companies: companies.slice(0, 10) // Return first 10 for recent companies table
    };
  } catch (error) {
    console.error('Error fetching superadmin metrics:', error);
    throw error;
  }
}

export async function getMRRHistory(months = 12) {
  try {
    // In a real implementation, you would have historical MRR data
    // For now, we'll generate mock data based on current MRR
    const currentMetrics = await getSuperadminMetrics();
    const currentMRR = currentMetrics.mrr;
    
    const history = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('sv-SE', { month: 'short' });
      
      // Simulate growth over time
      const growthFactor = 1 - (i * 0.1); // 10% growth per month
      const mrr = Math.max(currentMRR * growthFactor, 0);
      
      history.push({
        month: monthName,
        mrr: Math.round(mrr),
        date
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error fetching MRR history:', error);
    throw error;
  }
}

/**
 * COMPANY ANALYTICS
 * Functions for individual company metrics
 */

export async function getCompanyMetrics(companyId) {
  try {
    // Get form interactions (form events)
    const formEventsRef = collection(db, 'companies', companyId, 'formEvents');
    const formEventsSnapshot = await getDocs(formEventsRef);
    const formEvents = formEventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get bookings
    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get customers
    const customersRef = collection(db, 'companies', companyId, 'customers');
    const customersSnapshot = await getDocs(customersRef);
    const customers = customersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate form metrics
    const formInteractions = formEvents.length;
    const completedForms = bookings.filter(booking => booking.status === 'completed').length;
    const abandonedForms = formInteractions - completedForms;
    const abandonmentRate = formInteractions > 0 ? (abandonedForms / formInteractions) * 100 : 0;

    // Calculate revenue metrics
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.totalPrice || 0);
    }, 0);

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings
      .filter(booking => {
        const bookingDate = booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Calculate average order price
    const averageOrderPrice = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    // Calculate customer activity
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const activeCustomers = customers.filter(customer => {
      const lastBooking = customer.lastBooking?.toDate ? customer.lastBooking.toDate() : new Date(customer.lastBooking);
      return lastBooking && lastBooking > ninetyDaysAgo;
    }).length;

    const inactiveCustomers = customers.length - activeCustomers;

    return {
      formInteractions,
      completedForms,
      abandonedForms,
      abandonmentRate,
      totalRevenue,
      monthlyRevenue,
      averageOrderPrice,
      activeCustomers,
      inactiveCustomers,
      totalCustomers: customers.length,
      totalBookings: bookings.length
    };
  } catch (error) {
    console.error('Error fetching company metrics:', error);
    throw error;
  }
}

export async function getTopSellingServices(companyId, limit = 5) {
  try {
    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Aggregate by service
    const serviceStats = {};
    
    bookings.forEach(booking => {
      const serviceName = booking.serviceName || 'Unknown Service';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = {
          name: serviceName,
          revenue: 0,
          bookings: 0
        };
      }
      
      serviceStats[serviceName].revenue += booking.totalPrice || 0;
      serviceStats[serviceName].bookings += 1;
    });

    // Convert to array and sort by revenue
    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return topServices;
  } catch (error) {
    console.error('Error fetching top selling services:', error);
    throw error;
  }
}

export async function getSalesTrends(companyId, months = 12) {
  try {
    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const trends = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = targetMonth.toLocaleDateString('sv-SE', { month: 'short' });
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt?.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt);
        return bookingDate.getMonth() === targetMonth.getMonth() && 
               bookingDate.getFullYear() === targetMonth.getFullYear();
      });
      
      const monthRevenue = monthBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      
      trends.push({
        month: monthName,
        revenue: monthRevenue,
        bookings: monthBookings.length,
        date: targetMonth
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    throw error;
  }
}

/**
 * REAL-TIME ANALYTICS
 * Functions for real-time data updates
 */

export async function getRealtimeStats(companyId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    const todayBookingsQuery = query(
      bookingsRef,
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
    
    const todayBookingsSnapshot = await getDocs(todayBookingsQuery);
    const todayBookings = todayBookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const todayRevenue = todayBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    return {
      todayBookings: todayBookings.length,
      todayRevenue,
      recentBookings: todayBookings.slice(-5) // Last 5 bookings
    };
  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    throw error;
  }
}

/**
 * GDPR COMPLIANCE HELPERS
 * Functions to ensure data privacy compliance
 */

export function anonymizeCustomerData(data) {
  // Remove or hash sensitive customer information
  return {
    ...data,
    customerName: data.customerName ? '***' : undefined,
    customerEmail: data.customerEmail ? '***@***.***' : undefined,
    customerPhone: data.customerPhone ? '***-***-****' : undefined,
    // Keep non-sensitive data for analytics
    totalPrice: data.totalPrice,
    serviceName: data.serviceName,
    createdAt: data.createdAt,
    status: data.status
  };
}

export function filterSensitiveData(bookings) {
  return bookings.map(anonymizeCustomerData);
}

/**
 * EXPORT FUNCTIONS
 * Functions for data export (for Skatteverket compliance)
 */

export async function exportRevenueData(companyId, startDate, endDate) {
  try {
    const bookingsRef = collection(db, 'companies', companyId, 'bookings');
    const bookingsQuery = query(
      bookingsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Format for Swedish tax reporting
    const revenueData = bookings.map(booking => ({
      date: booking.createdAt?.toDate ? booking.createdAt.toDate().toISOString().split('T')[0] : '',
      service: booking.serviceName || 'Unknown',
      amount: booking.totalPrice || 0,
      vatAmount: (booking.totalPrice || 0) * 0.25, // 25% VAT in Sweden
      netAmount: (booking.totalPrice || 0) * 0.75,
      bookingId: booking.id,
      rutDeduction: booking.rutDeduction || 0 // RUT deduction if applicable
    }));
    
    return revenueData;
  } catch (error) {
    console.error('Error exporting revenue data:', error);
    throw error;
  }
}
