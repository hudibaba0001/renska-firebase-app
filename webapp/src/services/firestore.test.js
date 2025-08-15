// webapp/src/services/firestore.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTenant } from './firestore'; // The function we're testing
import { mockFirestore, resetMocks } from '../tests/mocks';

// Mock the entire 'firebase/firestore' module.
// Whenever this module is imported, Vitest will return our mock implementation instead.
vi.mock('firebase/firestore', () => mockFirestore);

describe('Firestore Service: createTenant', () => {

  // Reset all mocks before each individual test to ensure a clean slate.
  beforeEach(() => {
    resetMocks();
  });

  // Test Case 1: Successful creation with valid data
  it('should create a tenant successfully with valid data', async () => {
    // Arrange: Set up the mock return values for this specific test.
    const validFormData = {
      name: 'Test Company',
      slug: 'test-company',
      plan: 'basic',
      trialDays: 14,
      contactName: 'Test Contact',
      contactEmail: 'test@example.com',
    };
    // Simulate that the slug is available (getDocs returns an empty list).
    mockFirestore.getDocs.mockResolvedValue({ empty: true, docs: [] });
    // Simulate that addDoc returns a document reference with a specific ID.
    mockFirestore.addDoc.mockResolvedValue({ id: 'new-tenant-id' });

    // Act: Call the function we are testing.
    const tenantId = await createTenant(validFormData);

    // Assert: Verify that the function behaved as expected.
    expect(tenantId).toBe('new-tenant-id');
    expect(mockFirestore.addDoc).toHaveBeenCalledTimes(1);
    // You can even assert on the data that was passed to the mock function.
    expect(mockFirestore.addDoc).toHaveBeenCalledWith(
      'collection(companies)',
      expect.objectContaining({ name: 'Test Company' })
    );
  });

  // Test Case 2: Failure due to an invalid email
  it('should throw an error if the contact email is invalid', async () => {
    // Arrange: Provide invalid form data.
    const invalidFormData = {
      name: 'Test Company',
      slug: 'test-company',
      plan: 'basic',
      trialDays: 14,
      contactName: 'Test Contact',
      contactEmail: 'not-an-email', // Invalid email format
    };

    // Act & Assert: Check that the function throws an error.
    // We expect the promise to be rejected with a specific error message.
    await expect(createTenant(invalidFormData)).rejects.toThrow(
      'A valid contact email address is required.'
    );
    // Ensure no database calls were made.
    expect(mockFirestore.addDoc).not.toHaveBeenCalled();
  });

  // Test Case 3: Failure due to a missing name
  it('should throw an error if the company name is missing', async () => {
    // Arrange
    const invalidFormData = {
      name: '', // Missing name
      slug: 'test-company',
      plan: 'basic',
      trialDays: 14,
      contactName: 'Test Contact',
      contactEmail: 'test@example.com',
    };

    // Act & Assert
    await expect(createTenant(invalidFormData)).rejects.toThrow(
      'Company name must be between 2 and 100 characters.'
    );
    expect(mockFirestore.addDoc).not.toHaveBeenCalled();
  });
  
  // Test Case 4: Failure due to a slug that is already taken
  it('should throw an error if the slug is already taken', async () => {
    // Arrange
    const validFormData = {
      name: 'Test Company',
      slug: 'existing-slug',
      plan: 'basic',
      trialDays: 14,
      contactName: 'Test Contact',
      contactEmail: 'test@example.com',
    };
    // Simulate that the slug is NOT available (getDocs returns a non-empty list).
    mockFirestore.getDocs.mockResolvedValue({ empty: false, docs: [{ id: 'other-tenant-id' }] });

    // Act & Assert
    await expect(createTenant(validFormData)).rejects.toThrow(
        'This URL slug is already taken. Please choose another.'
    );
    expect(mockFirestore.addDoc).not.toHaveBeenCalled();
  });
});
