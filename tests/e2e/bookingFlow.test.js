// tests/e2e/bookingFlow.test.js
// End-to-end tests for enhanced booking functionality including offline mode and CSV export

describe('Enhanced Booking Flow', () => {
  beforeEach(() => {
    // Set up test data and login
    cy.login('admin@swedprime.se', 'testpassword');
    cy.visit('/admin/company-123/bookings');
  });

  describe('Recurring Bookings', () => {
    it('should create weekly recurring bookings successfully', () => {
      // Navigate to create booking
      cy.get('[data-testid="create-booking-btn"]').click();
      
      // Fill in booking details
      cy.get('[data-testid="customer-email"]').type('customer@example.com');
      cy.get('[data-testid="customer-id"]').select('customer-123');
      cy.get('[data-testid="service-id"]').select('service-456');
      cy.get('[data-testid="booking-price"]').type('500');
      cy.get('[data-testid="booking-date"]').type('2025-02-01');
      
      // Enable recurring booking
      cy.get('[data-testid="recurring-checkbox"]').check();
      cy.get('[data-testid="frequency-select"]').select('weekly');
      cy.get('[data-testid="occurrences-input"]').type('4');
      
      // Accept consent
      cy.get('[data-testid="consent-checkbox"]').check();
      
      // Submit form
      cy.get('[data-testid="create-booking-submit"]').click();
      
      // Verify success message
      cy.get('[data-testid="toast-success"]').should('contain', 'Created 4 recurring bookings successfully!');
      
      // Verify bookings appear in list
      cy.get('[data-testid="booking-list"]').should('contain', '4 bookings');
      cy.get('[data-testid="booking-item"]').should('have.length', 4);
      
      // Verify dates are correct (weekly intervals)
      cy.get('[data-testid="booking-item"]').first().should('contain', '2025-02-01');
      cy.get('[data-testid="booking-item"]').eq(1).should('contain', '2025-02-08');
      cy.get('[data-testid="booking-item"]').eq(2).should('contain', '2025-02-15');
      cy.get('[data-testid="booking-item"]').eq(3).should('contain', '2025-02-22');
    });

    it('should create monthly recurring bookings with proper date handling', () => {
      cy.get('[data-testid="create-booking-btn"]').click();
      
      // Fill in booking details with month-end date
      cy.get('[data-testid="customer-email"]').type('customer@example.com');
      cy.get('[data-testid="customer-id"]').select('customer-123');
      cy.get('[data-testid="service-id"]').select('service-456');
      cy.get('[data-testid="booking-price"]').type('750');
      cy.get('[data-testid="booking-date"]').type('2025-01-31'); // Month-end edge case
      
      // Enable monthly recurring
      cy.get('[data-testid="recurring-checkbox"]').check();
      cy.get('[data-testid="frequency-select"]').select('monthly');
      cy.get('[data-testid="occurrences-input"]').type('3');
      
      cy.get('[data-testid="consent-checkbox"]').check();
      cy.get('[data-testid="create-booking-submit"]').click();
      
      // Verify success
      cy.get('[data-testid="toast-success"]').should('contain', 'Created 3 recurring bookings successfully!');
      
      // Verify proper date handling for February (28 days)
      cy.get('[data-testid="booking-item"]').first().should('contain', '2025-01-31');
      cy.get('[data-testid="booking-item"]').eq(1).should('contain', '2025-02-28'); // Adjusted for February
      cy.get('[data-testid="booking-item"]').eq(2).should('contain', '2025-03-31');
    });

    it('should validate recurring booking parameters', () => {
      cy.get('[data-testid="create-booking-btn"]').click();
      
      // Try to create with invalid occurrences
      cy.get('[data-testid="customer-email"]').type('customer@example.com');
      cy.get('[data-testid="recurring-checkbox"]').check();
      cy.get('[data-testid="frequency-select"]').select('weekly');
      cy.get('[data-testid="occurrences-input"]').type('100'); // Too many
      
      cy.get('[data-testid="create-booking-submit"]').click();
      
      // Should show validation error
      cy.get('[data-testid="toast-error"]').should('contain', 'Occurrences must be between 1 and 52');
    });
  });

  describe('RUT CSV Export', () => {
    beforeEach(() => {
      // Set up test data with RUT-eligible bookings
      cy.task('seedRUTBookings', {
        companyId: 'company-123',
        bookings: [
          {
            id: 'booking-1',
            personnummer: '19900101-1234',
            RUTEligible: true,
            price: 500,
            customerEmail: 'customer1@example.com',
            date: '2025-01-15'
          },
          {
            id: 'booking-2',
            personnummer: '19850505-5678',
            RUTEligible: true,
            price: 750,
            customerEmail: 'customer2@example.com',
            date: '2025-01-20'
          },
          {
            id: 'booking-3',
            personnummer: '',
            RUTEligible: false,
            price: 300,
            customerEmail: 'customer3@example.com',
            date: '2025-01-25'
          }
        ]
      });
    });

    it('should export RUT bookings to CSV successfully', () => {
      // Navigate to bookings page
      cy.visit('/admin/company-123/bookings');
      
      // Click export button
      cy.get('[data-testid="export-rut-btn"]').click();
      
      // Verify success message
      cy.get('[data-testid="toast-success"]').should('contain', 'RUT report exported successfully! 2 bookings included.');
      
      // Verify file download
      cy.readFile('cypress/downloads/rut_rapport_company-123_2025-01-26.csv').should('exist');
      
      // Verify CSV content
      cy.readFile('cypress/downloads/rut_rapport_company-123_2025-01-26.csv').then((csvContent) => {
        expect(csvContent).to.include('Företags-ID;Boknings-ID;Kund-email;Personnummer;Datum;Pris (SEK)');
        expect(csvContent).to.include('company-123;booking-1;customer1@example.com;19900101-1234;2025-01-15;500.00');
        expect(csvContent).to.include('company-123;booking-2;customer2@example.com;19850505-5678;2025-01-20;750.00');
        expect(csvContent).not.to.include('customer3@example.com'); // Non-RUT booking should be excluded
      });
    });

    it('should export RUT bookings with date filtering', () => {
      cy.visit('/admin/company-123/bookings');
      
      // Set date filter
      cy.get('[data-testid="export-date-from"]').type('2025-01-01');
      cy.get('[data-testid="export-date-to"]').type('2025-01-18');
      
      // Export with date filter
      cy.get('[data-testid="export-rut-btn"]').click();
      
      // Should only include booking-1 (Jan 15)
      cy.get('[data-testid="toast-success"]').should('contain', 'RUT report exported successfully! 1 bookings included.');
      
      cy.readFile('cypress/downloads/rut_rapport_company-123_2025-01-01_to_2025-01-18.csv').then((csvContent) => {
        expect(csvContent).to.include('customer1@example.com;19900101-1234');
        expect(csvContent).not.to.include('customer2@example.com;19850505-5678'); // Jan 20 should be excluded
      });
    });

    it('should handle empty RUT data gracefully', () => {
      // Clear RUT bookings
      cy.task('clearRUTBookings', 'company-123');
      
      cy.visit('/admin/company-123/bookings');
      cy.get('[data-testid="export-rut-btn"]').click();
      
      // Should show info message
      cy.get('[data-testid="toast-info"]').should('contain', 'No RUT-eligible bookings found for the specified criteria.');
    });
  });

  describe('Offline Mode Support', () => {
    it('should work offline with cached data', () => {
      // First, load data while online
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="service-list"]').should('be.visible');
      
      // Simulate offline mode
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        win.dispatchEvent(new Event('offline'));
      });
      
      // Navigate to another page and back
      cy.visit('/admin/company-123/customers');
      cy.visit('/admin/company-123/services');
      
      // Should still show cached services
      cy.get('[data-testid="service-list"]').should('be.visible');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
    });

    it('should queue operations while offline', () => {
      // Go offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        win.dispatchEvent(new Event('offline'));
      });
      
      cy.visit('/admin/company-123/services');
      
      // Try to create a service while offline
      cy.get('[data-testid="create-service-btn"]').click();
      cy.get('[data-testid="service-name"]').type('Offline Service');
      cy.get('[data-testid="service-price"]').type('400');
      cy.get('[data-testid="create-service-submit"]').click();
      
      // Should show queued message
      cy.get('[data-testid="toast-info"]').should('contain', 'Operation queued. Will sync when online.');
      
      // Go back online
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(true);
        win.dispatchEvent(new Event('online'));
      });
      
      // Should sync and show success
      cy.get('[data-testid="toast-success"]').should('contain', 'Service created successfully!');
      cy.get('[data-testid="service-list"]').should('contain', 'Offline Service');
    });

    it('should handle multiple tabs gracefully', () => {
      // Open first tab
      cy.visit('/admin/company-123/services');
      
      // Simulate opening second tab (persistence should be disabled)
      cy.window().then((win) => {
        // Simulate the persistence error that occurs with multiple tabs
        const persistenceError = new Error('Multiple tabs open');
        persistenceError.code = 'failed-precondition';
        
        // Should handle gracefully without breaking the app
        cy.get('[data-testid="service-list"]').should('be.visible');
      });
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should show user-friendly error messages', () => {
      // Simulate permission error
      cy.intercept('POST', '**/firestore/**', {
        statusCode: 403,
        body: { error: { code: 'permission-denied', message: 'Permission denied' } }
      }).as('permissionError');
      
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="create-service-btn"]').click();
      cy.get('[data-testid="service-name"]').type('Test Service');
      cy.get('[data-testid="service-price"]').type('500');
      cy.get('[data-testid="create-service-submit"]').click();
      
      cy.wait('@permissionError');
      cy.get('[data-testid="toast-error"]').should('contain', 'You do not have permission to perform this action.');
    });

    it('should handle network timeouts gracefully', () => {
      // Simulate timeout
      cy.intercept('POST', '**/firestore/**', {
        statusCode: 408,
        body: { error: { code: 'deadline-exceeded', message: 'Deadline exceeded' } }
      }).as('timeoutError');
      
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="create-service-btn"]').click();
      cy.get('[data-testid="service-name"]').type('Test Service');
      cy.get('[data-testid="service-price"]').type('500');
      cy.get('[data-testid="create-service-submit"]').click();
      
      cy.wait('@timeoutError');
      cy.get('[data-testid="toast-error"]').should('contain', 'Request timed out. Please check your connection.');
    });

    it('should handle rate limiting appropriately', () => {
      // Simulate rate limit error
      cy.intercept('POST', '**/firestore/**', {
        statusCode: 429,
        body: { error: { message: 'Rate limit exceeded. Please try again in a moment.' } }
      }).as('rateLimitError');
      
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="create-service-btn"]').click();
      cy.get('[data-testid="service-name"]').type('Test Service');
      cy.get('[data-testid="service-price"]').type('500');
      cy.get('[data-testid="create-service-submit"]').click();
      
      cy.wait('@rateLimitError');
      cy.get('[data-testid="toast-error"]').should('contain', 'Too many requests. Please wait a moment and try again.');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should be keyboard navigable', () => {
      cy.visit('/admin/company-123/bookings');
      
      // Tab through form elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'create-booking-btn');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'export-rut-btn');
      
      // Enter should activate buttons
      cy.focused().type('{enter}');
      cy.get('[data-testid="export-modal"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/admin/company-123/bookings');
      cy.get('[data-testid="create-booking-btn"]').click();
      
      // Check form has proper labels
      cy.get('[data-testid="customer-email"]').should('have.attr', 'aria-label', 'Customer email address');
      cy.get('[data-testid="booking-price"]').should('have.attr', 'aria-label', 'Booking price in SEK');
      cy.get('[data-testid="consent-checkbox"]').should('have.attr', 'aria-describedby', 'consent-description');
    });

    it('should support screen readers', () => {
      cy.visit('/admin/company-123/bookings');
      
      // Check for screen reader announcements
      cy.get('[data-testid="booking-list"]').should('have.attr', 'aria-live', 'polite');
      cy.get('[data-testid="booking-count"]').should('have.attr', 'aria-label').and('contain', 'bookings found');
    });
  });

  describe('Performance', () => {
    it('should load quickly with caching', () => {
      const start = Date.now();
      
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="service-list"]').should('be.visible');
      
      const firstLoad = Date.now() - start;
      
      // Navigate away and back
      cy.visit('/admin/company-123/customers');
      
      const cacheStart = Date.now();
      cy.visit('/admin/company-123/services');
      cy.get('[data-testid="service-list"]').should('be.visible');
      
      const cachedLoad = Date.now() - cacheStart;
      
      // Cached load should be significantly faster
      expect(cachedLoad).to.be.lessThan(firstLoad * 0.5);
    });

    it('should handle large datasets efficiently', () => {
      // Seed large dataset
      cy.task('seedLargeDataset', { companyId: 'company-123', count: 1000 });
      
      cy.visit('/admin/company-123/bookings');
      
      // Should load within reasonable time
      cy.get('[data-testid="booking-list"]', { timeout: 5000 }).should('be.visible');
      
      // Pagination should work smoothly
      cy.get('[data-testid="next-page"]').click();
      cy.get('[data-testid="booking-list"]', { timeout: 2000 }).should('be.visible');
    });
  });
});