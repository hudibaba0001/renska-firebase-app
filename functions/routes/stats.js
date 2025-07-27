// functions/routes/stats.js
// Cloud Function for real-time company statistics computation

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled function to update company statistics every 5 minutes
 * Computes customer metrics, revenue data, and business analytics
 * TEMPORARILY DISABLED - pubsub.schedule not available in current version
 */
/*
exports.updateCompanyStats = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('Europe/Stockholm')
  .onRun(async (context) => {
    console.log('Starting company statistics update...');
    
    try {
      // Get all active companies
      const companiesSnapshot = await db.collection('companies')
        .where('deleted', '==', false)
        .get();

      console.log(`Processing statistics for ${companiesSnapshot.size} companies`);

      const batch = db.batch();
      let processedCount = 0;

      for (const companyDoc of companiesSnapshot.docs) {
        const companyId = companyDoc.id;
        
        try {
          // Get customers for this company
          const customersSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .where('deleted', '==', false)
            .get();

          // Get bookings for revenue calculation
          const bookingsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('bookings')
            .where('deleted', '==', false)
            .get();

          // Initialize statistics object
          const stats = {
            total: customersSnapshot.size,
            byStatus: { lead: 0, active: 0, inactive: 0, prospect: 0 },
            byType: { private: 0, business: 0 },
            bySource: {},
            totalRevenue: 0,
            averageOrderValue: 0,
            totalBookings: bookingsSnapshot.size,
            rutEligibleBookings: 0,
            rutEligibleRevenue: 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            computedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          // Process customers
          customersSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Count by status
            const status = data.status || 'lead';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            
            // Count by type
            const customerType = data.customerType || 'private';
            stats.byType[customerType] = (stats.byType[customerType] || 0) + 1;
            
            // Count by source
            const source = data.source || 'unknown';
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;
            
            // Add to total revenue from customer totalSpent
            stats.totalRevenue += (data.totalSpent || 0);
          });

          // Process bookings for additional revenue and RUT data
          let bookingRevenue = 0;
          bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            const price = data.price || 0;
            
            bookingRevenue += price;
            
            // Count RUT eligible bookings
            if (data.RUTEligible && data.personnummer) {
              stats.rutEligibleBookings++;
              stats.rutEligibleRevenue += price;
            }
          });

          // Use booking revenue if higher than customer totalSpent
          stats.totalRevenue = Math.max(stats.totalRevenue, bookingRevenue);
          
          // Calculate average order value
          stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

          // Add monthly and yearly trends (last 30 days and 365 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentCustomersSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('customers')
            .where('deleted', '==', false)
            .where('createdAt', '>=', thirtyDaysAgo)
            .get();

          const recentBookingsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('bookings')
            .where('deleted', '==', false)
            .where('createdAt', '>=', thirtyDaysAgo)
            .get();

          stats.monthlyTrends = {
            newCustomers: recentCustomersSnapshot.size,
            newBookings: recentBookingsSnapshot.size,
            monthlyRevenue: recentBookingsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().price || 0), 0)
          };

          // Update company stats document
          const statsRef = db.doc(`companyStats/${companyId}`);
          batch.set(statsRef, stats, { merge: true });
          
          processedCount++;
          
          if (processedCount % 10 === 0) {
            console.log(`Processed ${processedCount}/${companiesSnapshot.size} companies`);
          }

        } catch (companyError) {
          console.error(`Error processing company ${companyId}:`, companyError);
          // Continue processing other companies
        }
      }

      // Commit all statistics updates
      await batch.commit();
      
      console.log(`Company statistics update completed. Processed ${processedCount} companies.`);
      
      return { success: true, processedCompanies: processedCount };
      
    } catch (error) {
      console.error('Error updating company statistics:', error);
      throw error;
    }
  });
*/

/**
 * HTTP callable function to manually trigger statistics update for a specific company
 * Useful for immediate updates after significant data changes
 */
exports.updateSingleCompanyStats = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { companyId } = data;
  
  if (!companyId) {
    throw new functions.https.HttpsError('invalid-argument', 'Company ID is required');
  }

  // Verify user has access to this company
  const token = context.auth.token;
  if (!token.superAdmin && (!token.adminOf || !token.adminOf.includes(companyId))) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    console.log(`Manual statistics update requested for company: ${companyId}`);
    
    // Check if company exists and is not deleted
    const companyDoc = await db.doc(`companies/${companyId}`).get();
    if (!companyDoc.exists || companyDoc.data().deleted) {
      throw new functions.https.HttpsError('not-found', 'Company not found or deleted');
    }

    // Get customers for this company
    const customersSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('customers')
      .where('deleted', '==', false)
      .get();

    // Get bookings for revenue calculation
    const bookingsSnapshot = await db.collection('companies')
      .doc(companyId)
      .collection('bookings')
      .where('deleted', '==', false)
      .get();

    // Calculate statistics (same logic as scheduled function)
    const stats = {
      total: customersSnapshot.size,
      byStatus: { lead: 0, active: 0, inactive: 0, prospect: 0 },
      byType: { private: 0, business: 0 },
      bySource: {},
      totalRevenue: 0,
      averageOrderValue: 0,
      totalBookings: bookingsSnapshot.size,
      rutEligibleBookings: 0,
      rutEligibleRevenue: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      computedAt: admin.firestore.FieldValue.serverTimestamp(),
      manualUpdate: true,
      updatedBy: context.auth.uid
    };

    // Process customers
    customersSnapshot.forEach(doc => {
      const data = doc.data();
      
      const status = data.status || 'lead';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      const customerType = data.customerType || 'private';
      stats.byType[customerType] = (stats.byType[customerType] || 0) + 1;
      
      const source = data.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      
      stats.totalRevenue += (data.totalSpent || 0);
    });

    // Process bookings
    let bookingRevenue = 0;
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      const price = data.price || 0;
      
      bookingRevenue += price;
      
      if (data.RUTEligible && data.personnummer) {
        stats.rutEligibleBookings++;
        stats.rutEligibleRevenue += price;
      }
    });

    stats.totalRevenue = Math.max(stats.totalRevenue, bookingRevenue);
    stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

    // Update company stats
    await db.doc(`companyStats/${companyId}`).set(stats, { merge: true });
    
    console.log(`Manual statistics update completed for company: ${companyId}`);
    
    return { 
      success: true, 
      companyId,
      stats: {
        totalCustomers: stats.total,
        totalRevenue: stats.totalRevenue,
        totalBookings: stats.totalBookings,
        rutEligibleBookings: stats.rutEligibleBookings
      }
    };
    
  } catch (error) {
    console.error(`Error updating statistics for company ${companyId}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to update statistics', error.message);
  }
});

/**
 * Firestore trigger to update company stats when customer data changes
 * Provides near real-time statistics updates
 */
exports.updateStatsOnCustomerChange = functions.firestore
  .document('companies/{companyId}/customers/{customerId}')
  .onWrite(async (change, context) => {
    const companyId = context.params.companyId;
    
    try {
      // Trigger statistics update for this company
      console.log(`Customer data changed in company ${companyId}, triggering stats update`);
      
      // Call the manual update function internally
      await exports.updateSingleCompanyStats.run({ companyId }, { 
        auth: { uid: 'system', token: { superAdmin: true } } 
      });
      
    } catch (error) {
      console.error(`Error updating stats after customer change in company ${companyId}:`, error);
      // Don't throw error to avoid blocking the original operation
    }
  });

/**
 * Firestore trigger to update company stats when booking data changes
 * Provides near real-time revenue and booking statistics updates
 */
exports.updateStatsOnBookingChange = functions.firestore
  .document('companies/{companyId}/bookings/{bookingId}')
  .onWrite(async (change, context) => {
    const companyId = context.params.companyId;
    
    try {
      // Trigger statistics update for this company
      console.log(`Booking data changed in company ${companyId}, triggering stats update`);
      
      // Call the manual update function internally
      await exports.updateSingleCompanyStats.run({ companyId }, { 
        auth: { uid: 'system', token: { superAdmin: true } } 
      });
      
    } catch (error) {
      console.error(`Error updating stats after booking change in company ${companyId}:`, error);
      // Don't throw error to avoid blocking the original operation
    }
  });