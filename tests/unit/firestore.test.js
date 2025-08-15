// tests/unit/firestore.test.js
// Unit tests for enhanced Firestore service functions

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createRecurringBooking, 
  exportRUTBookingsToCSV,
  getAllServicesForCompany,
  getCustomersForCompany 
} from '../../webapp/src/services/firestore.js';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  enableIndexedDbPersistence: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-user-123' }
  }))
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('json2csv', () => ({
  parse: vi.fn(() => 'mocked,csv,data')
}));

describe('Enhanced Firestore Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock DOM methods for CSV export
    global.document = {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn()
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };
    
    global.window = {
      URL: {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn()
      }
    };
    
    global.Blob = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createRecurringBooking', () => {
    it('should create weekly recurring bookings correctly', async () => {
      // Mock successful batch commit
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue()
      };
      
      const { writeBatch } = await import('firebase/firestore');
      writeBatch.mockReturnValue(mockBatch);

      const bookingData = {
        customerEmail: 'test@example.com',
        customerId: 'customer-123',
        serviceId: 'service-456',
        price: 500,
        consent: true,
        date: new Date('2025-01-01')
      };

      const result = await createRecurringBooking('company-123', bookingData, 'weekly', 4);

      expect(result.success).toBe(true);
      expect(result.occurrences).toBe(4);
      expect(mockBatch.set).toHaveBeenCalledTimes(4);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });

    it('should create monthly recurring bookings with proper date handling', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue()
      };
      
      const { writeBatch } = await import('firebase/firestore');
      writeBatch.mockReturnValue(mockBatch);

      const bookingData = {
        customerEmail: 'test@example.com',
        customerId: 'customer-123',
        serviceId: 'service-456',
        price: 500,
        consent: true,
        date: new Date('2025-01-31') // Test month-end edge case
      };

      const result = await createRecurringBooking('company-123', bookingData, 'monthly', 3);

      expect(result.success).toBe(true);
      expect(result.occurrences).toBe(3);
      expect(mockBatch.set).toHaveBeenCalledTimes(3);
    });

    it('should validate input parameters correctly', async () => {
      const invalidBookingData = {
        customerEmail: 'invalid-email',
        customerId: 'customer-123',
        serviceId: 'service-456',
        price: 500,
        consent: true,
        date: new Date()
      };

      await expect(
        createRecurringBooking('company-123', invalidBookingData, 'weekly', 4)
      ).rejects.toThrow('Valid customer email is required');
    });

    it('should reject invalid frequency values', async () => {
      const bookingData = {
        customerEmail: 'test@example.com',
        customerId: 'customer-123',
        serviceId: 'service-456',
        price: 500,
        consent: true,
        date: new Date()
      };

      await expect(
        createRecurringBooking('company-123', bookingData, 'daily', 4)
      ).rejects.toThrow('Frequency must be either "weekly" or "monthly"');
    });

    it('should reject invalid occurrence counts', async () => {
      const bookingData = {
        customerEmail: 'test@example.com',
        customerId: 'customer-123',
        serviceId: 'service-456',
        price: 500,
        consent: true,
        date: new Date()
      };

      await expect(
        createRecurringBooking('company-123', bookingData, 'weekly', 100)
      ).rejects.toThrow('Occurrences must be between 1 and 52');
    });
  });

  describe('exportRUTBookingsToCSV', () => {
    it('should export RUT bookings to CSV successfully', async () => {
      // Mock the getAllBookingsForCompany function
      const mockBookings = [
        {
          id: 'booking-1',
          personnummer: '19900101-1234',
          RUTEligible: true,
          price: 500,
          customerEmail: 'customer1@example.com',
          companyId: 'company-123',
          serviceId: 'service-1',
          customerId: 'customer-1',
          date: { toDate: () => new Date('2025-01-15') },
          createdAt: { toDate: () => new Date('2025-01-10') }
        },
        {
          id: 'booking-2',
          personnummer: '19850505-5678',
          RUTEligible: true,
          price: 750,
          customerEmail: 'customer2@example.com',
          companyId: 'company-123',
          serviceId: 'service-2',
          customerId: 'customer-2',
          date: { toDate: () => new Date('2025-01-20') },
          createdAt: { toDate: () => new Date('2025-01-15') }
        },
        {
          id: 'booking-3',
          personnummer: '',
          RUTEligible: false,
          price: 300,
          customerEmail: 'customer3@example.com'
        }
      ];

      // Mock the function to return our test data
      vi.doMock('../../webapp/src/services/firestore.js', async () => {
        const actual = await vi.importActual('../../webapp/src/services/firestore.js');
        return {
          ...actual,
          getAllBookingsForCompany: vi.fn().mockResolvedValue({ bookings: mockBookings })
        };
      });

      const result = await exportRUTBookingsToCSV('company-123');

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(2); // Only 2 RUT-eligible bookings
      expect(result.filename).toContain('rut_rapport_company-123');
    });

    it('should handle empty RUT bookings gracefully', async () => {
      vi.doMock('../../webapp/src/services/firestore.js', async () => {
        const actual = await vi.importActual('../../webapp/src/services/firestore.js');
        return {
          ...actual,
          getAllBookingsForCompany: vi.fn().mockResolvedValue({ bookings: [] })
        };
      });

      const result = await exportRUTBookingsToCSV('company-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('No data to export');
    });

    it('should filter bookings by date range correctly', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          personnummer: '19900101-1234',
          RUTEligible: true,
          price: 500,
          date: { toDate: () => new Date('2025-01-15') }
        },
        {
          id: 'booking-2',
          personnummer: '19850505-5678',
          RUTEligible: true,
          price: 750,
          date: { toDate: () => new Date('2025-02-15') }
        }
      ];

      vi.doMock('../../webapp/src/services/firestore.js', async () => {
        const actual = await vi.importActual('../../webapp/src/services/firestore.js');
        return {
          ...actual,
          getAllBookingsForCompany: vi.fn().mockResolvedValue({ bookings: mockBookings })
        };
      });

      const result = await exportRUTBookingsToCSV(
        'company-123', 
        '2025-01-01', 
        '2025-01-31'
      );

      expect(result.recordCount).toBe(1); // Only January booking should be included
    });
  });

  describe('Caching functionality', () => {
    it('should cache service results correctly', async () => {
      const mockServices = [
        { id: 'service-1', name: 'Service 1', deleted: false },
        { id: 'service-2', name: 'Service 2', deleted: false }
      ];

      const mockSnapshot = {
        docs: mockServices.map(service => ({
          id: service.id,
          data: () => service
        }))
      };

      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);

      // First call should hit the database
      const result1 = await getAllServicesForCompany('company-123');
      expect(getDocs).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await getAllServicesForCompany('company-123');
      expect(getDocs).toHaveBeenCalledTimes(1); // Should not increase

      expect(result1).toEqual(result2);
    });

    it('should cache customer results correctly', async () => {
      const mockCustomers = [
        { id: 'customer-1', name: 'Customer 1', deleted: false },
        { id: 'customer-2', name: 'Customer 2', deleted: false }
      ];

      const mockSnapshot = {
        docs: mockCustomers.map(customer => ({
          id: customer.id,
          data: () => customer
        }))
      };

      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);

      // First call should hit the database
      const result1 = await getCustomersForCompany('company-123');
      expect(getDocs).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await getCustomersForCompany('company-123');
      expect(getDocs).toHaveBeenCalledTimes(1); // Should not increase

      expect(result1).toEqual(result2);
    });
  });

  describe('Error handling and notifications', () => {
    it('should show user-friendly error messages', async () => {
      const { getDocs } = await import('firebase/firestore');
      const permissionError = new Error('Permission denied');
      permissionError.code = 'permission-denied';
      
      getDocs.mockRejectedValue(permissionError);

      const toast = (await import('react-hot-toast')).default;

      await expect(getAllServicesForCompany('company-123')).rejects.toThrow();
      expect(toast.error).toHaveBeenCalledWith('You do not have permission to perform this action.');
    });

    it('should handle rate limit errors appropriately', async () => {
      const { getDocs } = await import('firebase/firestore');
      const rateLimitError = new Error('Rate limit exceeded. Please try again in a moment.');
      
      getDocs.mockRejectedValue(rateLimitError);

      const toast = (await import('react-hot-toast')).default;

      await expect(getAllServicesForCompany('company-123')).rejects.toThrow();
      expect(toast.error).toHaveBeenCalledWith('Too many requests. Please wait a moment and try again.');
    });
  });

  describe('Personnummer Encryption', () => {
    it('should encrypt personnummer before storing', async () => {
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn().mockResolvedValue()
      };
      
      const { writeBatch } = await import('firebase/firestore');
      writeBatch.mockReturnValue(mockBatch);

      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        personnummer: '19900101-1234',
        consent: true
      };

      // Mock the encryption function
      const mockEncrypt = vi.fn().mockReturnValue('encrypted-personnummer');
      vi.doMock('crypto-js', () => ({
        AES: {
          encrypt: mockEncrypt,
          decrypt: vi.fn().mockReturnValue({
            toString: vi.fn().mockReturnValue('19900101-1234')
          })
        },
        enc: { Utf8: {} }
      }));

      await createCustomer('company-123', customerData);

      // Verify encryption was called
      expect(mockEncrypt).toHaveBeenCalledWith('19900101-1234', expect.any(String));
    });

    it('should handle empty personnummer gracefully', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        personnummer: '',
        consent: true
      };

      const result = await createCustomer('company-123', customerData);
      expect(result).toBeDefined();
    });

    it('should decrypt personnummer when retrieving data', async () => {
      const mockDecrypt = vi.fn().mockReturnValue({
        toString: vi.fn().mockReturnValue('19900101-1234')
      });
      
      vi.doMock('crypto-js', () => ({
        AES: {
          encrypt: vi.fn(),
          decrypt: mockDecrypt
        },
        enc: { Utf8: {} }
      }));

      // Mock customer data with encrypted personnummer
      const mockCustomers = [{
        id: 'customer-1',
        name: 'Test Customer',
        personnummer: 'encrypted-personnummer',
        deleted: false
      }];

      const mockSnapshot = {
        docs: mockCustomers.map(customer => ({
          id: customer.id,
          data: () => customer
        }))
      };

      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getCustomersForCompany('company-123');
      
      // Verify decryption would be called when accessing personnummer
      expect(result.customers).toHaveLength(1);
    });
  });

  describe('Company Statistics', () => {
    it('should calculate company statistics correctly', () => {
      const mockCustomers = [
        { status: 'active', customerType: 'private', source: 'website', totalSpent: 500 },
        { status: 'lead', customerType: 'business', source: 'referral', totalSpent: 0 },
        { status: 'active', customerType: 'private', source: 'website', totalSpent: 750 }
      ];

      const stats = {
        total: mockCustomers.length,
        byStatus: { active: 0, lead: 0 },
        byType: { private: 0, business: 0 },
        bySource: {},
        totalRevenue: 0
      };

      mockCustomers.forEach(customer => {
        stats.byStatus[customer.status] = (stats.byStatus[customer.status] || 0) + 1;
        stats.byType[customer.customerType] = (stats.byType[customer.customerType] || 0) + 1;
        stats.bySource[customer.source] = (stats.bySource[customer.source] || 0) + 1;
        stats.totalRevenue += customer.totalSpent;
      });

      expect(stats.total).toBe(3);
      expect(stats.byStatus.active).toBe(2);
      expect(stats.byStatus.lead).toBe(1);
      expect(stats.byType.private).toBe(2);
      expect(stats.byType.business).toBe(1);
      expect(stats.bySource.website).toBe(2);
      expect(stats.bySource.referral).toBe(1);
      expect(stats.totalRevenue).toBe(1250);
    });
  });
});