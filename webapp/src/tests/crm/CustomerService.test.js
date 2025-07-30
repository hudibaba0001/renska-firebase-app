import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  exportCustomers
} from '../../crm/services/customerService';

// Mock Firebase
vi.mock('../../firebase/init', () => ({
  db: {}
}));

// Mock Firestore functions
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockServerTimestamp = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  serverTimestamp: mockServerTimestamp
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('CustomerService', () => {
  const mockCompanyId = 'test-company-id';
  const mockCustomerId = 'test-customer-id';

  beforeEach(() => {
    vi.clearAllMocks();
    mockServerTimestamp.mockReturnValue('mock-timestamp');
  });

  describe('getCustomers', () => {
    it('fetches customers successfully', async () => {
      const mockCustomers = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' }
      ];

      const mockQuerySnapshot = {
        docs: mockCustomers.map(customer => ({
          id: customer.id,
          data: () => customer
        }))
      };

      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await getCustomers(mockCompanyId);

      expect(mockCollection).toHaveBeenCalledWith(`companies/${mockCompanyId}/customers`);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockGetDocs).toHaveBeenCalledWith('mock-query');
      expect(result.customers).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles errors gracefully', async () => {
      const error = new Error('Firestore error');
      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockRejectedValue(error);

      await expect(getCustomers(mockCompanyId)).rejects.toThrow('Firestore error');
    });

    it('applies filters correctly', async () => {
      const mockQuerySnapshot = { docs: [] };
      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      await getCustomers(mockCompanyId, { search: 'John', status: 'active' });

      expect(mockWhere).toHaveBeenCalledWith('deleted', '!=', true);
    });
  });

  describe('getCustomer', () => {
    it('fetches a single customer successfully', async () => {
      const mockCustomer = { id: mockCustomerId, firstName: 'John', lastName: 'Doe' };
      const mockDocSnapshot = {
        exists: () => true,
        id: mockCustomerId,
        data: () => mockCustomer
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue(mockDocSnapshot);

      const result = await getCustomer(mockCompanyId, mockCustomerId);

      expect(mockDoc).toHaveBeenCalledWith(`companies/${mockCompanyId}/customers`, mockCustomerId);
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(result).toEqual({ id: mockCustomerId, ...mockCustomer });
    });

    it('throws error when customer not found', async () => {
      const mockDocSnapshot = {
        exists: () => false
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockGetDoc.mockResolvedValue(mockDocSnapshot);

      await expect(getCustomer(mockCompanyId, mockCustomerId)).rejects.toThrow('Customer not found');
    });
  });

  describe('createCustomer', () => {
    it('creates a customer successfully', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const mockDocRef = { id: mockCustomerId };
      mockCollection.mockReturnValue('mock-collection');
      mockAddDoc.mockResolvedValue(mockDocRef);

      const result = await createCustomer(mockCompanyId, customerData);

      expect(mockCollection).toHaveBeenCalledWith(`companies/${mockCompanyId}/customers`);
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', {
        ...customerData,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
      expect(result.id).toBe(mockCustomerId);
    });

    it('validates required fields', async () => {
      const invalidData = { firstName: '' };

      await expect(createCustomer(mockCompanyId, invalidData)).rejects.toThrow('First name is required');
    });

    it('validates email format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      await expect(createCustomer(mockCompanyId, invalidData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('updateCustomer', () => {
    it('updates a customer successfully', async () => {
      const updateData = {
        firstName: 'John Updated',
        lastName: 'Doe'
      };

      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      const result = await updateCustomer(mockCompanyId, mockCustomerId, updateData);

      expect(mockDoc).toHaveBeenCalledWith(`companies/${mockCompanyId}/customers`, mockCustomerId);
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        ...updateData,
        updatedAt: 'mock-timestamp'
      });
      expect(result.id).toBe(mockCustomerId);
    });

    it('validates required fields', async () => {
      const invalidData = { firstName: '' };

      await expect(updateCustomer(mockCompanyId, mockCustomerId, invalidData)).rejects.toThrow('First name is required');
    });
  });

  describe('deleteCustomer', () => {
    it('soft deletes a customer successfully', async () => {
      mockDoc.mockReturnValue('mock-doc-ref');
      mockUpdateDoc.mockResolvedValue();

      await deleteCustomer(mockCompanyId, mockCustomerId);

      expect(mockDoc).toHaveBeenCalledWith(`companies/${mockCompanyId}/customers`, mockCustomerId);
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        deleted: true,
        deletedAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      });
    });
  });

  describe('getCustomerStats', () => {
    it('calculates customer statistics correctly', async () => {
      const mockCustomers = [
        { id: '1', firstName: 'John', lastName: 'Doe', status: 'active' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'inactive' },
        { id: '3', firstName: 'Bob', lastName: 'Johnson', status: 'active' }
      ];

      const mockQuerySnapshot = {
        docs: mockCustomers.map(customer => ({
          id: customer.id,
          data: () => customer
        }))
      };

      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const stats = await getCustomerStats(mockCompanyId);

      expect(stats.total).toBe(3);
      expect(stats.byStatus.active).toBe(2);
      expect(stats.byStatus.inactive).toBe(1);
    });

    it('handles empty customer list', async () => {
      const mockQuerySnapshot = { docs: [] };
      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const stats = await getCustomerStats(mockCompanyId);

      expect(stats.total).toBe(0);
      expect(stats.byStatus.active).toBe(0);
    });
  });

  describe('exportCustomers', () => {
    it('exports customers to CSV format', async () => {
      const mockCustomers = [
        { 
          id: '1', 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john.doe@example.com',
          createdAt: { toDate: () => new Date('2023-01-01') }
        }
      ];

      const mockQuerySnapshot = {
        docs: mockCustomers.map(customer => ({
          id: customer.id,
          data: () => customer
        }))
      };

      mockCollection.mockReturnValue('mock-collection');
      mockQuery.mockReturnValue('mock-query');
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const csvData = await exportCustomers(mockCompanyId);

      expect(csvData).toHaveLength(1);
      expect(csvData[0]).toHaveProperty('First Name', 'John');
      expect(csvData[0]).toHaveProperty('Last Name', 'Doe');
      expect(csvData[0]).toHaveProperty('Email', 'john.doe@example.com');
    });
  });
}); 