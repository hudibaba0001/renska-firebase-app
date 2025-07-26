// functions/index.js
// Main Cloud Functions entry point

// Import all function modules
const cascadeDelete = require('./cascadeDelete');
const stats = require('./routes/stats');
const bookings = require('./routes/bookings');
const users = require('./routes/users');

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