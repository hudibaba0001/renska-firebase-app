import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  limit,
  startAfter,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/init';
import toast from 'react-hot-toast';

/**
 * Customer Service - Handles all CRM customer operations
 * Provides CRUD operations for customers with Swedish market compliance
 */

// Get all customers for a company
export const getCustomers = async (companyId, options = {}) => {
  try {
    const customersRef = collection(db, `companies/${companyId}/customers`);
    let q = query(customersRef, orderBy('createdAt', 'desc'));

    // Apply filters if provided
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options.rutEligible !== undefined) {
      q = query(q, where('rut_rot_eligible', '==', options.rutEligible));
    }

    if (options.areaTag) {
      q = query(q, where('area_tag', '==', options.areaTag));
    }

    // Apply pagination if provided
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    toast.error('Kunde inte hämta kunder');
    throw error;
  }
};

// Get a single customer by ID
export const getCustomer = async (companyId, customerId) => {
  try {
    const customerRef = doc(db, `companies/${companyId}/customers`, customerId);
    const customerSnap = await getDocs(customerRef);
    
    if (customerSnap.exists()) {
      return {
        id: customerSnap.id,
        ...customerSnap.data()
      };
    } else {
      throw new Error('Customer not found');
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    toast.error('Kunde inte hämta kund');
    throw error;
  }
};

// Create a new customer
export const createCustomer = async (companyId, customerData) => {
  try {
    // Add metadata
    const customerWithMetadata = {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    const customersRef = collection(db, `companies/${companyId}/customers`);
    const docRef = await addDoc(customersRef, customerWithMetadata);
    
    toast.success('Kund skapad framgångsrikt');
    
    return {
      id: docRef.id,
      ...customerWithMetadata
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    toast.error('Kunde inte skapa kund');
    throw error;
  }
};

// Update an existing customer
export const updateCustomer = async (companyId, customerId, customerData) => {
  try {
    const customerRef = doc(db, `companies/${companyId}/customers`, customerId);
    
    const updateData = {
      ...customerData,
      updatedAt: new Date()
    };

    await updateDoc(customerRef, updateData);
    
    toast.success('Kund uppdaterad framgångsrikt');
    
    return {
      id: customerId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    toast.error('Kunde inte uppdatera kund');
    throw error;
  }
};

// Delete a customer (soft delete)
export const deleteCustomer = async (companyId, customerId) => {
  try {
    const customerRef = doc(db, `companies/${companyId}/customers`, customerId);
    
    // Soft delete by updating status
    await updateDoc(customerRef, {
      status: 'deleted',
      deletedAt: new Date(),
      updatedAt: new Date()
    });
    
    toast.success('Kund borttagen framgångsrikt');
  } catch (error) {
    console.error('Error deleting customer:', error);
    toast.error('Kunde inte ta bort kund');
    throw error;
  }
};

// Hard delete a customer (use with caution)
export const hardDeleteCustomer = async (companyId, customerId) => {
  try {
    const customerRef = doc(db, `companies/${companyId}/customers`, customerId);
    await deleteDoc(customerRef);
    
    toast.success('Kund permanent borttagen');
  } catch (error) {
    console.error('Error hard deleting customer:', error);
    toast.error('Kunde inte ta bort kund permanent');
    throw error;
  }
};

// Search customers
export const searchCustomers = async (companyId, searchTerm, options = {}) => {
  try {
    const customers = await getCustomers(companyId, options);
    
    if (!searchTerm) return customers;
    
    const searchLower = searchTerm.toLowerCase();
    
    return customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm) ||
      customer.address?.toLowerCase().includes(searchLower) ||
      customer.contact_person?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    toast.error('Kunde inte söka efter kunder');
    throw error;
  }
};

// Get customer statistics
export const getCustomerStats = async (companyId) => {
  try {
    const customers = await getCustomers(companyId);
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      newThisMonth: customers.filter(c => 
        new Date(c.createdAt) >= thisMonth
      ).length,
      rutEligible: customers.filter(c => c.rut_rot_eligible).length,
      companies: customers.filter(c => c.is_company).length,
      individuals: customers.filter(c => !c.is_company).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting customer stats:', error);
    throw error;
  }
};

// Real-time customer listener
export const subscribeToCustomers = (companyId, callback, options = {}) => {
  try {
    const customersRef = collection(db, `companies/${companyId}/customers`);
    let q = query(customersRef, orderBy('createdAt', 'desc'));

    // Apply filters if provided
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(customers);
    }, (error) => {
      console.error('Error in customer subscription:', error);
      toast.error('Kunde inte lyssna på kunduppdateringar');
    });
  } catch (error) {
    console.error('Error setting up customer subscription:', error);
    throw error;
  }
};

// Export customers to CSV
export const exportCustomers = async (companyId, format = 'csv') => {
  try {
    const customers = await getCustomers(companyId);
    
    if (format === 'csv') {
      const csvData = customers.map(customer => ({
        'Namn': customer.name || '',
        'E-post': customer.email || '',
        'Telefon': customer.phone || '',
        'Adress': customer.address || '',
        'Typ': customer.is_company ? 'Företag' : 'Privatperson',
        'RUT/ROT-berättigad': customer.rut_rot_eligible ? 'Ja' : 'Nej',
        'Leadkälla': customer.lead_source || '',
        'Bokningsfrekvens': customer.booking_frequency || '',
        // 'Kundbetyg': customer.feedback_rating || '', // Removed rating system
        'Skapad': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('sv-SE') : '',
        'Status': customer.status || 'active'
      }));
      
      return csvData;
    }
    
    return customers;
  } catch (error) {
    console.error('Error exporting customers:', error);
    toast.error('Kunde inte exportera kunder');
    throw error;
  }
};

// Validate customer data
export const validateCustomer = (customerData) => {
  const errors = {};

  // Required fields
  if (!customerData.name?.trim()) {
    errors.name = 'Namn är obligatoriskt';
  }

  if (!customerData.email?.trim()) {
    errors.email = 'E-post är obligatoriskt';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
    errors.email = 'Ogiltig e-postadress';
  }

  if (!customerData.phone?.trim()) {
    errors.phone = 'Telefonnummer är obligatoriskt';
  }

  if (!customerData.address?.trim()) {
    errors.address = 'Adress är obligatoriskt';
  }

  // Personnummer validation for individuals
  if (!customerData.is_company && !customerData.personnummer?.trim()) {
    errors.personnummer = 'Personnummer är obligatoriskt för privatpersoner';
  } else if (customerData.personnummer && !/^\d{8}-\d{4}$/.test(customerData.personnummer)) {
    errors.personnummer = 'Personnummer måste vara i formatet YYYYMMDD-XXXX';
  }

  // GDPR consent validation
  if (customerData.consent_given && !customerData.consent_details?.trim()) {
    errors.consent_details = 'Samtyckesdetaljer är obligatoriska när samtycke ges';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};