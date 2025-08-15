// functions/index.js
// Main Cloud Functions entry point

// Import all function modules
const cascadeDelete = require('./cascadeDelete');
const stats = require('./routes/stats');
const bookings = require('./routes/bookings');
const users = require('./routes/users');
const deals = require('./routes/deals');

// Export cascade delete functions
exports.cascadeSoftDeleteCompanyData = cascadeDelete.cascadeSoftDeleteCompanyData;
exports.cleanupExpiredSoftDeletes = cascadeDelete.cleanupExpiredSoftDeletes;
exports.manualCascadeDelete = cascadeDelete.manualCascadeDelete;
exports.restoreSoftDeletedCompany = cascadeDelete.restoreSoftDeletedCompany;

// Export statistics functions
exports.updateCompanyStats = stats.updateCompanyStats;
exports.updateSingleCompanyStats = stats.updateSingleCompanyStats;
exports.updateStatsOnCustomerChange = stats.updateStatsOnCustomerChange;
exports.updateStatsOnBookingChange = stats.updateStatsOnBookingChange;

// Export recurring booking functions
exports.generateRecurringBookings = bookings.generateRecurringBookings;
exports.generateSingleRecurringBooking = bookings.generateSingleRecurringBooking;
exports.updateRecurringSeries = bookings.updateRecurringSeries;
exports.cancelRecurringSeries = bookings.cancelRecurringSeries;

// Export user management and GDPR functions
exports.usersApi = users.api; // REST API endpoints
exports.deleteUserData = users.deleteUserData; // Callable function

// Import and export auth functions
const auth = require('./routes/auth');
exports.setUserClaims = auth.setUserClaims;
exports.initializeSuperAdmin = auth.initializeSuperAdmin;
exports.removeUserClaims = auth.removeUserClaims;
exports.getUserClaims = auth.getUserClaims;
exports.createUserDocument = auth.createUserDocument;
exports.cleanupUserDocument = auth.cleanupUserDocument;

// Import and export company functions
const companies = require('./routes/companies');
exports.createCompany = companies.createCompany;
exports.updateCompanyPublicStatus = companies.updateCompanyPublicStatus;

// Export deal-to-job conversion function
exports.onDealStatusChange = deals.onDealStatusChange;

// Import and export secure functions
const secure = require('./secure');
exports.encryptData = secure.encryptData;
exports.decryptData = secure.decryptData;

// Import and export tenant functions
const tenants = require('./tenants');
exports.createTenant = tenants.createTenant;

// Import and export booking functions
const bookings = require('./bookings');
exports.createRecurringBookings = bookings.createRecurringBookings;