describe('CRM Workflow', () => {
  const companyId = 'test-company-id';
  const baseUrl = 'http://localhost:5177';

  beforeEach(() => {
    // Mock authentication and set up test data
    cy.intercept('GET', '**/companies/**', { fixture: 'companies.json' }).as('getCompanies');
    cy.intercept('GET', '**/customers**', { fixture: 'customers.json' }).as('getCustomers');
    cy.intercept('GET', '**/leads**', { fixture: 'leads.json' }).as('getLeads');
    cy.intercept('GET', '**/deals**', { fixture: 'deals.json' }).as('getDeals');
    cy.intercept('GET', '**/tasks**', { fixture: 'tasks.json' }).as('getTasks');
    
    // Mock successful POST requests
    cy.intercept('POST', '**/customers**', { statusCode: 200, body: { id: 'new-customer-id' } }).as('createCustomer');
    cy.intercept('POST', '**/leads**', { statusCode: 200, body: { id: 'new-lead-id' } }).as('createLead');
    cy.intercept('POST', '**/deals**', { statusCode: 200, body: { id: 'new-deal-id' } }).as('createDeal');
    cy.intercept('POST', '**/tasks**', { statusCode: 200, body: { id: 'new-task-id' } }).as('createTask');
  });

  it('should navigate through all CRM modules', () => {
    // Navigate to CRM
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data`);
    
    // Verify CRM dashboard loads
    cy.get('h1').should('contain', 'CRM System');
    cy.get('[data-testid="crm-dashboard"]').should('be.visible');
    
    // Test navigation to Customers
    cy.contains('Customers').click();
    cy.url().should('include', '/customers');
    cy.get('[data-testid="customer-list"]').should('be.visible');
    
    // Test navigation to Leads
    cy.contains('Leads').click();
    cy.url().should('include', '/leads');
    cy.get('[data-testid="lead-list"]').should('be.visible');
    
    // Test navigation to Tasks
    cy.contains('Tasks').click();
    cy.url().should('include', '/tasks');
    cy.get('[data-testid="task-list"]').should('be.visible');
    
    // Test navigation to Deals
    cy.contains('Deals').click();
    cy.url().should('include', '/deals');
    cy.get('[data-testid="deal-list"]').should('be.visible');
    
    // Return to Dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/crm-data');
    cy.url().should('not.include', '/customers');
  });

  it('should create a new customer', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers`);
    
    // Click Add Customer button
    cy.contains('Add Customer').click();
    cy.url().should('include', '/customers/create');
    
    // Fill out customer form
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="phone"]').type('+46701234567');
    cy.get('input[name="personnummer"]').type('198001011234');
    cy.get('input[name="primaryAddress"]').type('Test Street 123');
    cy.get('input[name="city"]').type('Stockholm');
    cy.get('input[name="postalCode"]').type('12345');
    cy.get('input[name="customerTags"]').type('VIP, Regular');
    cy.get('select[name="bookingFrequency"]').select('weekly');
    cy.get('input[name="consent"]').check();
    
    // Submit form
    cy.contains('Create Customer').click();
    
    // Verify customer was created
    cy.wait('@createCustomer');
    cy.url().should('include', '/customers');
    cy.contains('Customer created successfully').should('be.visible');
  });

  it('should create a new lead', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/leads`);
    
    // Click Add Lead button
    cy.contains('Add Lead').click();
    cy.url().should('include', '/leads/create');
    
    // Fill out lead form
    cy.get('input[name="firstName"]').type('Jane');
    cy.get('input[name="lastName"]').type('Smith');
    cy.get('input[name="email"]').type('jane.smith@example.com');
    cy.get('input[name="phone"]').type('+46701234568');
    cy.get('input[name="company"]').type('Test Company');
    cy.get('select[name="status"]').select('new');
    cy.get('select[name="source"]').select('website');
    cy.get('textarea[name="notes"]').type('Interested in cleaning services');
    
    // Submit form
    cy.contains('Create Lead').click();
    
    // Verify lead was created
    cy.wait('@createLead');
    cy.url().should('include', '/leads');
    cy.contains('Lead created successfully').should('be.visible');
  });

  it('should create a new deal', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/deals`);
    
    // Click Add Deal button
    cy.contains('Add Deal').click();
    cy.url().should('include', '/deals/create');
    
    // Fill out deal form
    cy.get('input[name="name"]').type('Cleaning Contract');
    cy.get('input[name="customer"]').type('Test Customer');
    cy.get('input[name="value"]').type('5000');
    cy.get('select[name="status"]').select('proposal');
    cy.get('select[name="priority"]').select('high');
    cy.get('input[name="expectedCloseDate"]').type('2024-12-31');
    cy.get('textarea[name="description"]').type('Monthly cleaning contract');
    
    // Submit form
    cy.contains('Create Deal').click();
    
    // Verify deal was created
    cy.wait('@createDeal');
    cy.url().should('include', '/deals');
    cy.contains('Deal created successfully').should('be.visible');
  });

  it('should create a new task', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/tasks`);
    
    // Click Add Task button
    cy.contains('Add Task').click();
    cy.url().should('include', '/tasks/create');
    
    // Fill out task form
    cy.get('input[name="title"]').type('Follow up with customer');
    cy.get('textarea[name="description"]').type('Call customer about cleaning quote');
    cy.get('input[name="customer"]').type('Test Customer');
    cy.get('input[name="assignedTo"]').type('John Manager');
    cy.get('select[name="status"]').select('pending');
    cy.get('select[name="priority"]').select('medium');
    cy.get('select[name="type"]').select('call');
    cy.get('input[name="dueDate"]').type('2024-12-15');
    cy.get('input[name="dueTime"]').type('14:00');
    
    // Submit form
    cy.contains('Create Task').click();
    
    // Verify task was created
    cy.wait('@createTask');
    cy.url().should('include', '/tasks');
    cy.contains('Task created successfully').should('be.visible');
  });

  it('should search and filter customers', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers`);
    
    // Test search functionality
    cy.get('input[placeholder*="Search"]').type('John');
    cy.get('[data-testid="customer-list"]').should('contain', 'John');
    
    // Test filters
    cy.contains('Filters').click();
    cy.get('select[name="status"]').select('active');
    cy.get('[data-testid="customer-list"]').should('be.visible');
  });

  it('should export data', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers`);
    
    // Mock file download
    cy.intercept('GET', '**/export**', { fixture: 'customers-export.csv' }).as('exportCustomers');
    
    // Click export button
    cy.contains('Export').click();
    
    // Verify export was triggered
    cy.wait('@exportCustomers');
  });

  it('should handle form validation errors', () => {
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers/create`);
    
    // Try to submit empty form
    cy.contains('Create Customer').click();
    
    // Verify validation errors appear
    cy.contains('First name is required').should('be.visible');
    cy.contains('Last name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    
    // Test invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.contains('Create Customer').click();
    cy.contains('Invalid email format').should('be.visible');
  });

  it('should handle loading states', () => {
    // Mock slow response
    cy.intercept('GET', '**/customers**', { delay: 1000, fixture: 'customers.json' }).as('getCustomersSlow');
    
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers`);
    
    // Verify loading state
    cy.contains('Loading customers...').should('be.visible');
    
    // Wait for data to load
    cy.wait('@getCustomersSlow');
    cy.contains('Loading customers...').should('not.exist');
  });

  it('should handle error states', () => {
    // Mock error response
    cy.intercept('GET', '**/customers**', { statusCode: 500, body: { error: 'Server error' } }).as('getCustomersError');
    
    cy.visit(`${baseUrl}/admin/${companyId}/crm-data/customers`);
    
    // Wait for error
    cy.wait('@getCustomersError');
    cy.contains('Failed to load customers').should('be.visible');
  });
}); 