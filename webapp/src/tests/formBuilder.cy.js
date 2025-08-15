describe('Booking Form Builder Flow', () => {
  it('should allow user to create calculator, select services, and build custom form', () => {
    // Visit form builder page
    cy.visit('/admin/company1/forms/new');
    // Step 1: Create Calculator
    cy.get('input').first().type('Test Calculator');
    cy.contains('Continue').click();
    // Step 2: Define Services
    cy.get('input[type=checkbox]').first().check();
    cy.contains('Continue').click();
    // Step 3: Custom Form
    cy.contains('Custom Booking Form').should('be.visible');
    // ...add more assertions as needed
  });
}); 