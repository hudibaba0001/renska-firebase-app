// Quick CRM Validation - Run this in browser console
console.log('🔍 Quick CRM Validation Starting...');

// Check if we're on a CRM page
const isOnCRMPage = window.location.pathname.includes('/crm-data');
console.log('📍 On CRM page:', isOnCRMPage);

if (isOnCRMPage) {
  // Check for CRM elements
  const crmElements = {
    'CRM Title': document.querySelector('h1')?.textContent?.includes('CRM'),
    'Navigation Menu': document.querySelector('nav') || document.querySelector('[role="navigation"]'),
    'Customer Link': document.querySelector('a[href*="customers"]'),
    'Lead Link': document.querySelector('a[href*="leads"]'),
    'Task Link': document.querySelector('a[href*="tasks"]'),
    'Deal Link': document.querySelector('a[href*="deals"]'),
    'Add Buttons': document.querySelectorAll('button').length > 0,
    'Data Tables': document.querySelectorAll('table').length > 0
  };

  console.log('🔍 CRM Elements Check:');
  Object.entries(crmElements).forEach(([element, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${element}: ${found ? 'Found' : 'Missing'}`);
  });

  // Check current route
  const currentRoute = window.location.pathname;
  console.log('📍 Current Route:', currentRoute);

  // Check for React components
  const reactRoot = document.querySelector('#root');
  console.log('⚛️ React Root:', reactRoot ? 'Found' : 'Missing');

  // Check for any errors in console
  console.log('🚨 Check browser console for any errors above');

} else {
  console.log('⚠️ Not on CRM page. Navigate to /admin/{companyId}/crm-data');
  console.log('💡 Current URL:', window.location.href);
}

// Test navigation
const testNavigation = () => {
  console.log('🧪 Testing Navigation...');
  
  const links = document.querySelectorAll('a[href*="crm-data"]');
  console.log(`Found ${links.length} CRM navigation links`);
  
  links.forEach((link, index) => {
    console.log(`  ${index + 1}. ${link.textContent} -> ${link.href}`);
  });
};

// Test forms
const testForms = () => {
  console.log('🧪 Testing Forms...');
  
  const forms = document.querySelectorAll('form');
  console.log(`Found ${forms.length} forms`);
  
  forms.forEach((form, index) => {
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log(`  Form ${index + 1}: ${inputs.length} form fields`);
  });
};

// Run tests if on CRM page
if (isOnCRMPage) {
  testNavigation();
  testForms();
}

console.log('✅ Quick validation complete!');
console.log('💡 Run testNavigation() or testForms() for detailed checks'); 