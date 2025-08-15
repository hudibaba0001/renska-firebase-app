import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
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
  lastReset: Date.now(),
  resetInterval: 60000 // 1 minute
};

const checkRateLimit = () => {
  const now = Date.now();
  if (now - rateLimit.lastReset > rateLimit.resetInterval) {
    rateLimit.tokens = 50;
    rateLimit.lastReset = now;
  }
  
  if (rateLimit.tokens <= 0) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }
  
  rateLimit.tokens--;
};

// Deal status options
export const DEAL_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'proposal', label: 'Proposal', color: 'blue' },
  { value: 'negotiation', label: 'Negotiation', color: 'yellow' },
  { value: 'won', label: 'Won', color: 'green' },
  { value: 'lost', label: 'Lost', color: 'red' }
];

// Deal priority options
export const DEAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
];

// Get all deals for a company with optional filtering and pagination
export const getDeals = async (companyId, options = {}) => {
  try {
    checkRateLimit();
    
    const {
      status,
      priority,
      customerId,
      search,
      page = 1,
      limit: pageLimit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    let q = collection(db, `companies/${companyId}/deals`);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }
    if (priority) {
      constraints.push(where('priority', '==', priority));
    }
    if (customerId) {
      constraints.push(where('customerId', '==', customerId));
    }

    // Add sorting
    constraints.push(orderBy(sortBy, sortOrder));
    constraints.push(limit(pageLimit));

    // Add pagination
    if (page > 1 && options.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(query(q, ...constraints));
    const deals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search if needed
    let filteredDeals = deals;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDeals = deals.filter(deal => 
        deal.name?.toLowerCase().includes(searchLower) ||
        deal.customer?.toLowerCase().includes(searchLower) ||
        deal.notes?.toLowerCase().includes(searchLower)
      );
    }

    return {
      deals: filteredDeals,
      total: filteredDeals.length,
      hasMore: querySnapshot.docs.length === pageLimit,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching deals:', error);
    toast.error('Failed to load deals');
    throw error;
  }
};

// Get a single deal by ID
export const getDeal = async (companyId, dealId) => {
  try {
    checkRateLimit();
    
    const docRef = doc(db, `companies/${companyId}/deals`, dealId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Deal not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching deal:', error);
    toast.error('Failed to load deal');
    throw error;
  }
};

// Create a new deal
export const createDeal = async (companyId, dealData) => {
  try {
    checkRateLimit();
    
    // Validate required fields
    if (!dealData.name?.trim()) {
      throw new Error('Deal name is required');
    }
    if (!dealData.customer?.trim()) {
      throw new Error('Customer is required');
    }
    if (!dealData.value || parseFloat(dealData.value) <= 0) {
      throw new Error('Deal value must be a positive number');
    }

    const deal = {
      ...dealData,
      value: parseFloat(dealData.value),
      status: dealData.status || 'draft',
      priority: dealData.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, `companies/${companyId}/deals`), deal);
    
    toast.success('Deal created successfully');
    return { id: docRef.id, ...deal };
  } catch (error) {
    console.error('Error creating deal:', error);
    toast.error(error.message || 'Failed to create deal');
    throw error;
  }
};

// Update an existing deal
export const updateDeal = async (companyId, dealId, dealData) => {
  try {
    checkRateLimit();
    
    // Validate required fields
    if (!dealData.name?.trim()) {
      throw new Error('Deal name is required');
    }
    if (!dealData.customer?.trim()) {
      throw new Error('Customer is required');
    }
    if (!dealData.value || parseFloat(dealData.value) <= 0) {
      throw new Error('Deal value must be a positive number');
    }

    const updateData = {
      ...dealData,
      value: parseFloat(dealData.value),
      updatedAt: serverTimestamp()
    };

    const docRef = doc(db, `companies/${companyId}/deals`, dealId);
    await updateDoc(docRef, updateData);
    
    toast.success('Deal updated successfully');
    return { id: dealId, ...updateData };
  } catch (error) {
    console.error('Error updating deal:', error);
    toast.error(error.message || 'Failed to update deal');
    throw error;
  }
};

// Delete a deal (soft delete)
export const deleteDeal = async (companyId, dealId) => {
  try {
    checkRateLimit();
    
    const docRef = doc(db, `companies/${companyId}/deals`, dealId);
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    toast.success('Deal deleted successfully');
  } catch (error) {
    console.error('Error deleting deal:', error);
    toast.error('Failed to delete deal');
    throw error;
  }
};

// Get deal statistics for dashboard
export const getDealStats = async (companyId) => {
  try {
    checkRateLimit();
    
    const deals = await getDeals(companyId, { limit: 1000 });
    
    const stats = {
      total: deals.deals.length,
      totalValue: deals.deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
      byStatus: {},
      byPriority: {},
      recentDeals: deals.deals
        .filter(deal => !deal.deleted)
        .sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.())
        .slice(0, 5)
    };

    // Count by status
    DEAL_STATUSES.forEach(status => {
      stats.byStatus[status.value] = deals.deals.filter(deal => 
        deal.status === status.value && !deal.deleted
      ).length;
    });

    // Count by priority
    DEAL_PRIORITIES.forEach(priority => {
      stats.byPriority[priority.value] = deals.deals.filter(deal => 
        deal.priority === priority.value && !deal.deleted
      ).length;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching deal stats:', error);
    return {
      total: 0,
      totalValue: 0,
      byStatus: {},
      byPriority: {},
      recentDeals: []
    };
  }
};

// Get deals by customer
export const getDealsByCustomer = async (companyId, customerId) => {
  try {
    checkRateLimit();
    
    return await getDeals(companyId, { customerId });
  } catch (error) {
    console.error('Error fetching customer deals:', error);
    toast.error('Failed to load customer deals');
    throw error;
  }
};

// Update deal status
export const updateDealStatus = async (companyId, dealId, status) => {
  try {
    checkRateLimit();
    
    if (!DEAL_STATUSES.find(s => s.value === status)) {
      throw new Error('Invalid deal status');
    }

    const docRef = doc(db, `companies/${companyId}/deals`, dealId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    toast.success('Deal status updated');
  } catch (error) {
    console.error('Error updating deal status:', error);
    toast.error('Failed to update deal status');
    throw error;
  }
};

// Export deals to CSV
export const exportDeals = async (companyId, options = {}) => {
  try {
    checkRateLimit();
    
    const deals = await getDeals(companyId, { ...options, limit: 1000 });
    
    const csvData = deals.deals.map(deal => ({
      'Deal Name': deal.name || '',
      'Customer': deal.customer || '',
      'Value (SEK)': deal.value || 0,
      'Status': deal.status || '',
      'Priority': deal.priority || '',
      'Expected Close Date': deal.expectedCloseDate || '',
      'Notes': deal.notes || '',
      'Created': deal.createdAt?.toDate?.()?.toLocaleDateString() || '',
      'Updated': deal.updatedAt?.toDate?.()?.toLocaleDateString() || ''
    }));

    return csvData;
  } catch (error) {
    console.error('Error exporting deals:', error);
    toast.error('Failed to export deals');
    throw error;
  }
}; 