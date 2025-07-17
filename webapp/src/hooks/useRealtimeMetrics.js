import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  getFirestore,
  Timestamp 
} from 'firebase/firestore';
import { getCompanyMetrics, getSuperadminMetrics } from '../services/analytics';

/**
 * Custom hook for real-time metrics updates
 * Provides live data updates for both superadmin and company dashboards
 */

export function useRealtimeCompanyMetrics(companyId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Keep track of listeners to clean them up
  const listenersRef = useRef([]);
  
  useEffect(() => {
    if (!companyId) return;
    
    const db = getFirestore();
    setLoading(true);
    setError(null);
    
    // Function to fetch initial metrics
    const fetchInitialMetrics = async () => {
      try {
        const initialMetrics = await getCompanyMetrics(companyId);
        setMetrics(initialMetrics);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching initial metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up real-time listeners
    const setupRealtimeListeners = () => {
      // Listen to bookings changes
      const bookingsRef = collection(db, 'companies', companyId, 'bookings');
      const bookingsQuery = query(bookingsRef, orderBy('createdAt', 'desc'), limit(100));
      
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        console.log('Bookings updated, refreshing metrics...');
        fetchInitialMetrics(); // Refresh all metrics when bookings change
      }, (error) => {
        console.error('Error listening to bookings:', error);
        setError('Failed to listen to booking updates');
      });
      
      // Listen to form events changes
      const formEventsRef = collection(db, 'companies', companyId, 'formEvents');
      const formEventsQuery = query(formEventsRef, orderBy('timestamp', 'desc'), limit(50));
      
      const unsubscribeFormEvents = onSnapshot(formEventsQuery, (snapshot) => {
        console.log('Form events updated, refreshing metrics...');
        fetchInitialMetrics(); // Refresh all metrics when form events change
      }, (error) => {
        console.error('Error listening to form events:', error);
        // Don't set error for form events as they might not exist yet
      });
      
      // Listen to customers changes
      const customersRef = collection(db, 'companies', companyId, 'customers');
      const customersQuery = query(customersRef, orderBy('lastBooking', 'desc'), limit(100));
      
      const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
        console.log('Customers updated, refreshing metrics...');
        fetchInitialMetrics(); // Refresh all metrics when customers change
      }, (error) => {
        console.error('Error listening to customers:', error);
        // Don't set error for customers as they might not exist yet
      });
      
      // Store listeners for cleanup
      listenersRef.current = [
        unsubscribeBookings,
        unsubscribeFormEvents,
        unsubscribeCustomers
      ];
    };
    
    // Initialize
    fetchInitialMetrics().then(() => {
      setupRealtimeListeners();
    });
    
    // Cleanup function
    return () => {
      listenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      listenersRef.current = [];
    };
  }, [companyId]);
  
  // Manual refresh function
  const refresh = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const freshMetrics = await getCompanyMetrics(companyId);
      setMetrics(freshMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export function useRealtimeSuperadminMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const listenersRef = useRef([]);
  
  useEffect(() => {
    const db = getFirestore();
    setLoading(true);
    setError(null);
    
    // Function to fetch initial metrics
    const fetchInitialMetrics = async () => {
      try {
        const initialMetrics = await getSuperadminMetrics();
        setMetrics(initialMetrics);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching initial superadmin metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up real-time listeners
    const setupRealtimeListeners = () => {
      // Listen to companies changes
      const companiesRef = collection(db, 'companies');
      const companiesQuery = query(companiesRef, orderBy('created', 'desc'), limit(100));
      
      const unsubscribeCompanies = onSnapshot(companiesQuery, (snapshot) => {
        console.log('Companies updated, refreshing superadmin metrics...');
        fetchInitialMetrics(); // Refresh all metrics when companies change
      }, (error) => {
        console.error('Error listening to companies:', error);
        setError('Failed to listen to company updates');
      });
      
      // Store listeners for cleanup
      listenersRef.current = [unsubscribeCompanies];
    };
    
    // Initialize
    fetchInitialMetrics().then(() => {
      setupRealtimeListeners();
    });
    
    // Cleanup function
    return () => {
      listenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      listenersRef.current = [];
    };
  }, []);
  
  // Manual refresh function
  const refresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const freshMetrics = await getSuperadminMetrics();
      setMetrics(freshMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing superadmin metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export function useRealtimeNotifications(companyId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const listenerRef = useRef(null);
  
  useEffect(() => {
    if (!companyId) return;
    
    const db = getFirestore();
    
    // Listen to notifications for this company
    const notificationsRef = collection(db, 'companies', companyId, 'notifications');
    const notificationsQuery = query(
      notificationsRef, 
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
    
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setLoading(false);
    });
    
    listenerRef.current = unsubscribe;
    
    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [companyId]);
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!companyId) return;
    
    try {
      const db = getFirestore();
      const notificationRef = doc(db, 'companies', companyId, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!companyId) return;
    
    try {
      const db = getFirestore();
      const batch = writeBatch(db);
      
      notifications.filter(n => !n.read).forEach(notification => {
        const notificationRef = doc(db, 'companies', companyId, 'notifications', notification.id);
        batch.update(notificationRef, {
          read: true,
          readAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}

// Hook for real-time dashboard alerts
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const db = getFirestore();
    
    // Listen to system-wide alerts
    const alertsRef = collection(db, 'systemAlerts');
    const alertsQuery = query(
      alertsRef, 
      where('active', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAlerts(alertsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to alerts:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  return {
    alerts,
    loading
  };
}
