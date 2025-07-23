// webapp/src/services/customerService.js

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/init';
import toast from 'react-hot-toast';

/**
 * Customer Service - Handles all CRM operations
 * 
 * Customer Data Model:
 * {
 *   id: string,
 *   companyId: string,
 *   name: string,
 *   email: string,
 *   phone: string,
 *   customerType: 'private' | 'business',
 *   status: 'lead' | 'active' | 'inactive' | 'prospect',
 *   source: 'manual' | 'booking' | 'website' | 'referral' | 'social' | 'advertisement',
 *   addresses: [
 *     {
 *       id: string,
 *       type: 'primary' | 'billing' | 'service',
 *       street: string,
 *       city: string,
 *       postalCode: string,
 *       country: string,
 *       isDefault: boolean
 *     }
 *   ],
 *   preferences: {
 *     preferredContactMethod: 'email' | 'phone' | 'sms',
 *     preferredTime: 'morning' | 'afternoon' | 'evening',
 *     specialInstructions: string,
 *     allergies: string,
 *     pets: boolean,
 *     accessInstructions: string
 *   },
 *   tags: string[],
 *   notes: [
 *     {
 *       id: string,
 *       content: string,
 *       type: 'general' | 'communication' | 'issue' | 'preference',
 *       createdBy: string,
 *       createdAt: timestamp
 *     }
 *   ],
 *   customFields: Record<string, any>,
 *   totalBookings: number,
 *   totalSpent: number,
 *   lastBooking: timestamp,
 *   firstBooking: timestamp,
 *   averageOrderValue: number,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   createdBy: string
 * }
 */

export class CustomerService {
  /**
   * Get all customers for a company
   */
  static async getCustomersForCompany(companyId, options = {}) {
    try {
      console.log('🔄 Loading customers for company:', companyId);
      
      const customersRef = collection(db, 'companies', companyId, 'customers');
      let q = query(customersRef);
      
      // Apply filters
      if (options.status && options.status !== 'all') {
        q = query(q, where('status', '==', options.status));
      }
      
      if (options.customerType && options.customerType !== 'all') {
        q = query(q, where('customerType', '==', options.customerType));
      }
      
      // Apply sorting
      const sortField = options.sortBy || 'createdAt';
      const sortDirection = options.sortDirection || 'desc';
      q = query(q, orderBy(sortField, sortDirection));
      
      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Loaded customers:', customers.length);
      return customers;
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      throw error;
    }
  }

  /**
   * Get a single customer by ID
   */
  static async getCustomer(companyId, customerId) {
    try {
      const customerRef = doc(db, 'companies', companyId, 'customers', customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (!customerSnap.exists()) {
        throw new Error('Customer not found');
      }
      
      return {
        id: customerSnap.id,
        ...customerSnap.data()
      };
    } catch (error) {
      console.error('❌ Error loading customer:', error);
      throw error;
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer(companyId, customerData, createdBy) {
    try {
      console.log('🔄 Creating customer:', customerData.name);
      
      const customersRef = collection(db, 'companies', companyId, 'customers');
      
      // Prepare customer data with defaults
      const newCustomer = {
        companyId,
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone || '',
        customerType: customerData.customerType || 'private',
        status: customerData.status || 'lead',
        source: customerData.source || 'manual',
        addresses: customerData.addresses || [],
        preferences: customerData.preferences || {
          preferredContactMethod: 'email',
          preferredTime: 'morning',
          specialInstructions: '',
          allergies: '',
          pets: false,
          accessInstructions: ''
        },
        tags: customerData.tags || [],
        notes: customerData.notes || [],
        customFields: customerData.customFields || {},
        totalBookings: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy
      };
      
      // Add primary address if provided
      if (customerData.address || customerData.city || customerData.postalCode) {
        newCustomer.addresses.push({
          id: `addr_${Date.now()}`,
          type: 'primary',
          street: customerData.address || '',
          city: customerData.city || '',
          postalCode: customerData.postalCode || '',
          country: 'Sweden',
          isDefault: true
        });
      }
      
      const docRef = await addDoc(customersRef, newCustomer);
      
      // Log activity
      await this.logActivity(companyId, docRef.id, 'customer_created', {
        customerName: newCustomer.name,
        createdBy
      });
      
      console.log('✅ Customer created:', docRef.id);
      toast.success(`Kund "${newCustomer.name}" skapad`);
      
      return {
        id: docRef.id,
        ...newCustomer
      };
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      toast.error('Kunde inte skapa kund: ' + error.message);
      throw error;
    }
  }

  /**
   * Update an existing customer
   */
  static async updateCustomer(companyId, customerId, updates, updatedBy) {
    try {
      console.log('🔄 Updating customer:', customerId);
      
      const customerRef = doc(db, 'companies', companyId, 'customers', customerId);
      
      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Clean up undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      await updateDoc(customerRef, updateData);
      
      // Log activity
      await this.logActivity(companyId, customerId, 'customer_updated', {
        updatedBy,
        changes: Object.keys(updates)
      });
      
      console.log('✅ Customer updated:', customerId);
      toast.success('Kund uppdaterad');
      
      return true;
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      toast.error('Kunde inte uppdatera kund: ' + error.message);
      throw error;
    }
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(companyId, customerId) {
    try {
      console.log('🔄 Deleting customer:', customerId);
      
      const customerRef = doc(db, 'companies', companyId, 'customers', customerId);
      await deleteDoc(customerRef);
      
      // Log activity
      await this.logActivity(companyId, customerId, 'customer_deleted', {
        customerId
      });
      
      console.log('✅ Customer deleted:', customerId);
      toast.success('Kund raderad');
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      toast.error('Kunde inte radera kund: ' + error.message);
      throw error;
    }
  }

  /**
   * Add a note to a customer
   */
  static async addCustomerNote(companyId, customerId, noteData, createdBy) {
    try {
      const customer = await this.getCustomer(companyId, customerId);
      
      const newNote = {
        id: `note_${Date.now()}`,
        content: noteData.content.trim(),
        type: noteData.type || 'general',
        createdBy,
        createdAt: serverTimestamp()
      };
      
      const updatedNotes = [...(customer.notes || []), newNote];
      
      await this.updateCustomer(companyId, customerId, { notes: updatedNotes }, createdBy);
      
      // Log activity
      await this.logActivity(companyId, customerId, 'note_added', {
        noteType: newNote.type,
        createdBy
      });
      
      console.log('✅ Note added to customer:', customerId);
      return newNote;
    } catch (error) {
      console.error('❌ Error adding note:', error);
      throw error;
    }
  }

  /**
   * Update customer status
   */
  static async updateCustomerStatus(companyId, customerId, newStatus, updatedBy) {
    try {
      await this.updateCustomer(companyId, customerId, { status: newStatus }, updatedBy);
      
      // Log activity
      await this.logActivity(companyId, customerId, 'status_changed', {
        newStatus,
        updatedBy
      });
      
      console.log('✅ Customer status updated:', customerId, '->', newStatus);
      return true;
    } catch (error) {
      console.error('❌ Error updating customer status:', error);
      throw error;
    }
  }

  /**
   * Add tag to customer
   */
  static async addCustomerTag(companyId, customerId, tag, updatedBy) {
    try {
      const customer = await this.getCustomer(companyId, customerId);
      const currentTags = customer.tags || [];
      
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        await this.updateCustomer(companyId, customerId, { tags: updatedTags }, updatedBy);
        
        // Log activity
        await this.logActivity(companyId, customerId, 'tag_added', {
          tag,
          updatedBy
        });
        
        console.log('✅ Tag added to customer:', customerId, '->', tag);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error adding tag:', error);
      throw error;
    }
  }

  /**
   * Remove tag from customer
   */
  static async removeCustomerTag(companyId, customerId, tag, updatedBy) {
    try {
      const customer = await this.getCustomer(companyId, customerId);
      const currentTags = customer.tags || [];
      
      const updatedTags = currentTags.filter(t => t !== tag);
      await this.updateCustomer(companyId, customerId, { tags: updatedTags }, updatedBy);
      
      // Log activity
      await this.logActivity(companyId, customerId, 'tag_removed', {
        tag,
        updatedBy
      });
      
      console.log('✅ Tag removed from customer:', customerId, '->', tag);
      return true;
    } catch (error) {
      console.error('❌ Error removing tag:', error);
      throw error;
    }
  }

  /**
   * Search customers
   */
  static async searchCustomers(companyId, searchTerm, options = {}) {
    try {
      const customers = await this.getCustomersForCompany(companyId, options);
      
      if (!searchTerm) return customers;
      
      const searchLower = searchTerm.toLowerCase();
      
      return customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        customer.addresses?.some(addr => 
          addr.street?.toLowerCase().includes(searchLower) ||
          addr.city?.toLowerCase().includes(searchLower)
        )
      );
    } catch (error) {
      console.error('❌ Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(companyId) {
    try {
      const customers = await this.getCustomersForCompany(companyId);
      
      const stats = {
        total: customers.length,
        byStatus: {
          lead: customers.filter(c => c.status === 'lead').length,
          active: customers.filter(c => c.status === 'active').length,
          inactive: customers.filter(c => c.status === 'inactive').length,
          prospect: customers.filter(c => c.status === 'prospect').length
        },
        byType: {
          private: customers.filter(c => c.customerType === 'private').length,
          business: customers.filter(c => c.customerType === 'business').length
        },
        bySource: {},
        totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        averageOrderValue: customers.length > 0 
          ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length 
          : 0
      };
      
      // Calculate source distribution
      customers.forEach(customer => {
        const source = customer.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting customer stats:', error);
      throw error;
    }
  }

  /**
   * Log activity for a customer
   */
  static async logActivity(companyId, customerId, action, data = {}) {
    try {
      const activityRef = collection(db, 'companies', companyId, 'activityLogs');
      
      const activity = {
        customerId,
        action,
        data,
        timestamp: serverTimestamp(),
        type: 'customer'
      };
      
      await addDoc(activityRef, activity);
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // Don't throw - activity logging shouldn't break main operations
    }
  }

  /**
   * Sync customer data from booking (when a booking is created)
   *
   * Matching order:
   *   1. By email (primary)
   *   2. By phone number (secondary)
   *   3. Create new customer if no match
   */
  static async syncFromBooking(companyId, bookingData) {
    try {
      const { customerName, customerEmail, customerPhone } = bookingData;
      if (!customerEmail && !customerPhone) {
        console.warn('No customer email or phone in booking data');
        return null;
      }
      // Check if customer already exists by email
      let customers = await this.searchCustomers(companyId, customerEmail);
      let existingCustomer = customers.find(c => c.email === customerEmail);
      // If not found by email, check by phone
      if (!existingCustomer && customerPhone) {
        customers = await this.searchCustomers(companyId, customerPhone);
        existingCustomer = customers.find(c => c.phone === customerPhone);
      }
      if (existingCustomer) {
        // Update existing customer with booking data
        const updates = {
          totalBookings: (existingCustomer.totalBookings || 0) + 1,
          totalSpent: (existingCustomer.totalSpent || 0) + (bookingData.totalAmount || 0),
          lastBooking: serverTimestamp(),
          status: 'active'
        };
        if (!existingCustomer.firstBooking) {
          updates.firstBooking = serverTimestamp();
        }
        await this.updateCustomer(companyId, existingCustomer.id, updates, 'system');
        return existingCustomer.id;
      } else {
        // Create new customer from booking data
        const newCustomer = {
          name: customerName || 'Unknown',
          email: customerEmail,
          phone: customerPhone || '',
          customerType: 'private',
          status: 'active',
          source: 'booking',
          totalBookings: 1,
          totalSpent: bookingData.totalAmount || 0,
          firstBooking: serverTimestamp(),
          lastBooking: serverTimestamp()
        };
        const createdCustomer = await this.createCustomer(companyId, newCustomer, 'system');
        return createdCustomer.id;
      }
    } catch (error) {
      console.error('❌ Error syncing customer from booking:', error);
      return null;
    }
  }
}

export default CustomerService; 