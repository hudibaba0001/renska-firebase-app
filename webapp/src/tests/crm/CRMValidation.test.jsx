import { describe, it, expect } from 'vitest';

// Test that all CRM modules can be imported
describe('CRM Module Validation', () => {
  it('should have all required CRM modules', async () => {
    // Test Customer module
    const customerModule = await import('../../crm/modules/customers');
    expect(customerModule).toBeDefined();
    expect(customerModule.CustomerList).toBeDefined();
    expect(customerModule.CustomerCreate).toBeDefined();
    expect(customerModule.CustomerEdit).toBeDefined();
    expect(customerModule.CustomerShow).toBeDefined();
  });

  it('should have all required CRM services', async () => {
    // Test Customer service
    const customerService = await import('../../crm/services/customerService');
    expect(customerService).toBeDefined();
    expect(customerService.getCustomers).toBeDefined();
    expect(customerService.createCustomer).toBeDefined();
    expect(customerService.updateCustomer).toBeDefined();
    expect(customerService.deleteCustomer).toBeDefined();

    // Test Lead service
    const leadService = await import('../../crm/services/leadService');
    expect(leadService).toBeDefined();
    expect(leadService.getLeads).toBeDefined();
    expect(leadService.createLead).toBeDefined();

    // Test Deal service
    const dealService = await import('../../crm/services/dealService');
    expect(dealService).toBeDefined();
    expect(dealService.getDeals).toBeDefined();
    expect(dealService.createDeal).toBeDefined();

    // Test Task service
    const taskService = await import('../../crm/services/taskService');
    expect(taskService).toBeDefined();
    expect(taskService.getTasks).toBeDefined();
    expect(taskService.createTask).toBeDefined();
  });

  it('should have all required CRM forms', async () => {
    // Test Customer form
    const customerForm = await import('../../crm/forms/CustomerForm');
    expect(customerForm.default).toBeDefined();

    // Test Lead form
    const leadForm = await import('../../crm/forms/LeadForm');
    expect(leadForm.default).toBeDefined();

    // Test Deal form
    const dealForm = await import('../../crm/forms/DealForm');
    expect(dealForm.default).toBeDefined();

    // Test Task form
    const taskForm = await import('../../crm/forms/TaskForm');
    expect(taskForm.default).toBeDefined();
  });

  it('should have main CRM component', async () => {
    const dataConnectCRM = await import('../../crm/DataConnectCRM');
    expect(dataConnectCRM.default).toBeDefined();
  });

  it('should have proper module structure', () => {
    // This test validates that our modular structure is in place
    const expectedModules = [
      'customers',
      'leads', 
      'deals',
      'tasks'
    ];

    expectedModules.forEach(moduleName => {
      expect(() => {
        require(`../../crm/modules/${moduleName}`);
      }).not.toThrow();
    });
  });

  it('should have proper service structure', () => {
    // This test validates that our service layer is in place
    const expectedServices = [
      'customerService',
      'leadService',
      'dealService', 
      'taskService'
    ];

    expectedServices.forEach(serviceName => {
      expect(() => {
        require(`../../crm/services/${serviceName}`);
      }).not.toThrow();
    });
  });

  it('should have proper form structure', () => {
    // This test validates that our form components are in place
    const expectedForms = [
      'CustomerForm',
      'LeadForm',
      'DealForm',
      'TaskForm'
    ];

    expectedForms.forEach(formName => {
      expect(() => {
        require(`../../crm/forms/${formName}`);
      }).not.toThrow();
    });
  });
}); 