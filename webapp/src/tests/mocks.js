// webapp/src/tests/mocks.js

import { vi } from 'vitest';

/**
 * Mocks the core Firestore functions needed by our service layer.
 * This allows us to test our services in isolation without a live database connection.
 */
export const mockFirestore = {
  // Mock the collection and doc functions to return a simple path string.
  collection: vi.fn((db, path) => `collection(${path})`),
  doc: vi.fn((db, path, id) => `doc(${path}/${id})`),

  // Mock the data manipulation functions to simulate their behavior.
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()), // Return a consistent timestamp.
};

/**
* Resets all mock functions to their initial state before each test.
* This ensures that tests are independent and do not interfere with each other.
*/
export const resetMocks = () => {
    mockFirestore.getDoc.mockClear();
    mockFirestore.addDoc.mockClear();
    mockFirestore.updateDoc.mockClear();
    mockFirestore.deleteDoc.mockClear();
    mockFirestore.getDocs.mockClear();
};
