import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter 
} from 'firebase/firestore';
import { db } from '../../firebase/init';
import toast from 'react-hot-toast';

// Rate limiting for Firestore operations
const rateLimit = {
  tokens: 50,
  lastRefill: Date.now(),
  refillRate: 60000, // 1 minute
};

const checkRateLimit = () => {
  const now = Date.now();
  if (now - rateLimit.lastRefill > rateLimit.refillRate) {
    rateLimit.tokens = 50;
    rateLimit.lastRefill = now;
  }
  
  if (rateLimit.tokens <= 0) {
    throw new Error('Rate limit exceeded. Please try again in a moment.');
  }
  
  rateLimit.tokens--;
};

// Lead validation
const validateLead = (leadData) => {
  const errors = [];

  if (!leadData.name?.trim()) {
    errors.push('Lead name is required');
  }

  if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    errors.push('Invalid email format');
  }

  if (leadData.phone && !/^[\+]?[0-9\s\-\(\)]{6,}$/.test(leadData.phone)) {
    errors.push('Invalid phone number format');
  }

  if (leadData.value && (isNaN(leadData.value) || leadData.value < 0)) {
    errors.push('Value must be a positive number');
  }

  return errors;
};

// Get all leads for a company
export const getLeads = async (companyId, options = {}) => {
  try {
    checkRateLimit();
    
    const { 
      status = null, 
      source = null, 
      searchTerm = null,
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    let q = collection(db, `companies/${companyId}/leads`);
    
    // Apply filters
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    if (source) {
      q = query(q, where('source', '==', source));
    }

    // Apply sorting
    q = query(q, orderBy(sortBy, sortOrder));

    const snapshot = await getDocs(q);
    let leads = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    // Apply search filter (client-side for better performance)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      leads = leads.filter(lead => 
        lead.name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.phone?.includes(term)
      );
    }

    // Apply pagination
    const totalCount = leads.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLeads = leads.slice(startIndex, endIndex);

    return {
      leads: paginatedLeads,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    toast.error('Failed to load leads');
    throw error;
  }
};

// Get a single lead by ID
export const getLead = async (companyId, leadId) => {
  try {
    checkRateLimit();
    
    const leadDoc = await getDoc(doc(db, `companies/${companyId}/leads`, leadId));
    
    if (!leadDoc.exists()) {
      throw new Error('Lead not found');
    }
    
    return { id: leadDoc.id, ...leadDoc.data() };
  } catch (error) {
    console.error('Error fetching lead:', error);
    toast.error('Failed to load lead details');
    throw error;
  }
};

// Create a new lead
export const createLead = async (companyId, leadData) => {
  try {
    checkRateLimit();
    
    // Validate lead data
    const errors = validateLead(leadData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const leadToCreate = {
      ...leadData,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: leadData.status || 'new',
      source: leadData.source || 'other'
    };

    const docRef = await addDoc(collection(db, `companies/${companyId}/leads`), leadToCreate);
    
    toast.success('Lead created successfully');
    return { id: docRef.id, ...leadToCreate };
  } catch (error) {
    console.error('Error creating lead:', error);
    toast.error(error.message || 'Failed to create lead');
    throw error;
  }
};

// Update an existing lead
export const updateLead = async (companyId, leadId, leadData) => {
  try {
    checkRateLimit();
    
    // Validate lead data
    const errors = validateLead(leadData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const leadToUpdate = {
      ...leadData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, `companies/${companyId}/leads`, leadId), leadToUpdate);
    
    toast.success('Lead updated successfully');
    return { id: leadId, ...leadToUpdate };
  } catch (error) {
    console.error('Error updating lead:', error);
    toast.error(error.message || 'Failed to update lead');
    throw error;
  }
};

// Delete a lead (soft delete)
export const deleteLead = async (companyId, leadId) => {
  try {
    checkRateLimit();
    
    await updateDoc(doc(db, `companies/${companyId}/leads`, leadId), {
      deleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    toast.success('Lead deleted successfully');
  } catch (error) {
    console.error('Error deleting lead:', error);
    toast.error('Failed to delete lead');
    throw error;
  }
};

// Get lead statistics
export const getLeadStats = async (companyId) => {
  try {
    checkRateLimit();
    
    const snapshot = await getDocs(collection(db, `companies/${companyId}/leads`));
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const stats = {
      total: leads.length,
      new: leads.filter(lead => lead.status === 'new').length,
      contacted: leads.filter(lead => lead.status === 'contacted').length,
      qualified: leads.filter(lead => lead.status === 'qualified').length,
      proposal: leads.filter(lead => lead.status === 'proposal').length,
      closed: leads.filter(lead => lead.status === 'closed').length,
      totalValue: leads.reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    toast.error('Failed to load lead statistics');
    throw error;
  }
};

// Get lead sources for filtering
export const getLeadSources = () => {
  return [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'cold-call', label: 'Cold Call' },
    { value: 'trade-show', label: 'Trade Show' },
    { value: 'google', label: 'Google' },
    { value: 'other', label: 'Other' }
  ];
};

// Get lead statuses for filtering
export const getLeadStatuses = () => {
  return [
    { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
    { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' }
  ];
};

// Convert lead to customer
export const convertLeadToCustomer = async (companyId, leadId, customerData) => {
  try {
    checkRateLimit();
    
    // Get the lead data
    const lead = await getLead(companyId, leadId);
    
    // Create customer from lead data
    const customerFromLead = {
      name: customerData.name || lead.name,
      email: customerData.email || lead.email,
      phone: customerData.phone || lead.phone,
      company: customerData.company || lead.company,
      address: customerData.address || '',
      lead_source: lead.source,
      internal_notes: `Converted from lead: ${lead.name} (${lead.id})`,
      is_company: !!customerData.company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Import customer service to create the customer
    const { createCustomer } = await import('./customerService');
    const customer = await createCustomer(companyId, customerFromLead);
    
    // Update lead status to closed
    await updateLead(companyId, leadId, { 
      status: 'closed', 
      convertedToCustomer: customer.id,
      convertedAt: new Date().toISOString()
    });
    
    toast.success('Lead converted to customer successfully');
    return customer;
  } catch (error) {
    console.error('Error converting lead to customer:', error);
    toast.error('Failed to convert lead to customer');
    throw error;
  }
};

// Create lead from booking calculator submission
export const createLeadFromBooking = async (companyId, bookingData) => {
  try {
    checkRateLimit();
    
    // Extract customer information from booking data
    const customerInfo = bookingData.customerInfo || {};
    const serviceInfo = bookingData.serviceInfo || {};
    const pricingInfo = bookingData.pricingInfo || {};
    
    // Validate required fields
    if (!customerInfo.name?.trim()) {
      throw new Error('Customer name is required');
    }
    
    if (!customerInfo.email?.trim()) {
      throw new Error('Customer email is required');
    }
    
    // Create lead data structure
    const leadData = {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim(),
      phone: customerInfo.phone?.trim() || '',
      address: customerInfo.address?.trim() || '',
      personnummer: customerInfo.personnummer?.trim() || '',
      useRut: !!customerInfo.useRut,
      
      // Booking-specific information
      source: 'booking-calculator',
      status: 'new',
      value: pricingInfo.finalPrice || pricingInfo.totalPrice || 0,
      
      // Service details
      serviceId: serviceInfo.serviceId || '',
      serviceName: serviceInfo.serviceName || '',
      serviceType: serviceInfo.serviceType || '',
      
      // Booking configuration
      area: bookingData.area || '',
      rooms: bookingData.rooms || '',
      frequency: bookingData.frequency || 'one-time',
      zipCode: bookingData.zipCode || '',
      
      // Pricing breakdown
      originalPrice: pricingInfo.originalPrice || 0,
      finalPrice: pricingInfo.finalPrice || 0,
      rutDiscount: pricingInfo.rutDiscount || 0,
      customFees: pricingInfo.customFees || [],
      addOns: bookingData.addOns || [],
      
      // Additional metadata
      bookingConfig: {
        area: bookingData.area,
        rooms: bookingData.rooms,
        frequency: bookingData.frequency,
        zipCode: bookingData.zipCode,
        windowTypes: bookingData.windowTypes || {},
        timePreference: bookingData.timePreference || '',
        specialInstructions: bookingData.specialInstructions || ''
      },
      
      // Internal notes for sales team
      internal_notes: `Booking calculator submission. Original price: ${pricingInfo.originalPrice}, Final price: ${pricingInfo.finalPrice}. RUT applied: ${customerInfo.useRut ? 'Yes' : 'No'}`,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    // Create the lead
    const lead = await createLead(companyId, leadData);
    
    console.log('✅ Lead created from booking submission:', lead.id);
    return lead;
    
  } catch (error) {
    console.error('Error creating lead from booking:', error);
    toast.error('Failed to create lead from booking submission');
    throw error;
  }
};

// Get leads by source (useful for filtering booking calculator leads)
export const getLeadsBySource = async (companyId, source) => {
  try {
    checkRateLimit();
    
    const q = query(
      collection(db, `companies/${companyId}/leads`),
      where('source', '==', source),
      where('deleted', '!=', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const leads = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    return leads;
  } catch (error) {
    console.error('Error fetching leads by source:', error);
    toast.error('Failed to load leads');
    throw error;
  }
};

// Get booking calculator leads specifically
export const getBookingLeads = async (companyId, options = {}) => {
  return getLeadsBySource(companyId, 'booking-calculator');
};