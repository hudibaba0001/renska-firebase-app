const admin = require('firebase-admin');
const functionsTest = require('firebase-functions-test')();

// Initialize admin SDK for testing
admin.initializeApp({
  projectId: 'demo-test-project'
});

// Make test utilities available globally
global.admin = admin;
global.functionsTest = functionsTest;
global.assert = require('assert');

// Cleanup after tests
afterAll(async () => {
  await functionsTest.cleanup();
  // Clean up any remaining admin app instances
  await Promise.all(admin.apps.map(app => app.delete()));
});