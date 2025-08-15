const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Helper function to get or initialize stats document
async function getOrCreateStats(transaction, statsRef) {
  const doc = await transaction.get(statsRef);
  return doc.exists ? doc.data() : {
    totalRevenue: 0,
    totalDeals: 0,
    avgDealValue: 0,
    totalCustomers: 0,
    openTasks: 0,
    activeLeads: 0,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  };
}

// Update company stats when a deal changes
// Update customer count
exports.updateCustomerStats = functions.firestore
  .document('companies/{companyId}/customers/{customerId}')
  .onWrite(async (change, context) => {
    const { companyId } = context.params;
    const statsRef = admin.firestore()
      .collection('companies')
      .doc(companyId)
      .collection('stats')
      .doc('summary');

    return admin.firestore().runTransaction(async (transaction) => {
      const stats = await getOrCreateStats(transaction, statsRef);
      
      // Update total customers count
      const countDiff = change.after.exists 
        ? (change.before.exists ? 0 : 1)  // No change if update, +1 if new
        : -1;                             // -1 if deleted

      transaction.set(statsRef, {
        ...stats,
        totalCustomers: stats.totalCustomers + countDiff,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
});

// Update task counts
exports.updateTaskStats = functions.firestore
  .document('companies/{companyId}/tasks/{taskId}')
  .onWrite(async (change, context) => {
    const { companyId } = context.params;
    const statsRef = admin.firestore()
      .collection('companies')
      .doc(companyId)
      .collection('stats')
      .doc('summary');

    return admin.firestore().runTransaction(async (transaction) => {
      const stats = await getOrCreateStats(transaction, statsRef);
      
      // Calculate the change in open tasks
      const wasOpen = change.before.exists && change.before.data().status !== 'completed';
      const isOpen = change.after.exists && change.after.data().status !== 'completed';
      
      let openTasksDiff = 0;
      if (isOpen && !wasOpen) openTasksDiff = 1;      // New open task
      if (!isOpen && wasOpen) openTasksDiff = -1;     // Task closed or deleted

      transaction.set(statsRef, {
        ...stats,
        openTasks: stats.openTasks + openTasksDiff,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
});

// Update lead counts
exports.updateLeadStats = functions.firestore
  .document('companies/{companyId}/leads/{leadId}')
  .onWrite(async (change, context) => {
    const { companyId } = context.params;
    const statsRef = admin.firestore()
      .collection('companies')
      .doc(companyId)
      .collection('stats')
      .doc('summary');

    return admin.firestore().runTransaction(async (transaction) => {
      const stats = await getOrCreateStats(transaction, statsRef);
      
      // Calculate the change in active leads
      const wasActive = change.before.exists && change.before.data().status !== 'closed';
      const isActive = change.after.exists && change.after.data().status !== 'closed';
      
      let activeLeadsDiff = 0;
      if (isActive && !wasActive) activeLeadsDiff = 1;    // New active lead
      if (!isActive && wasActive) activeLeadsDiff = -1;   // Lead closed or deleted

      transaction.set(statsRef, {
        ...stats,
        activeLeads: stats.activeLeads + activeLeadsDiff,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
});

exports.updateDealStats = functions.firestore
  .document('companies/{companyId}/deals/{dealId}')
  .onWrite(async (change, context) => {
    const { companyId } = context.params;
    const statsRef = admin.firestore()
      .collection('companies')
      .doc(companyId)
      .collection('stats')
      .doc('summary');

    // Get the old and new deal values
    const oldValue = change.before.exists ? change.before.data().value || 0 : 0;
    const newValue = change.after.exists ? change.after.data().value || 0 : 0;
    const valueDiff = newValue - oldValue;

    // Update stats atomically
    return admin.firestore().runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      const currentStats = statsDoc.exists ? statsDoc.data() : {
        totalRevenue: 0,
        totalDeals: 0,
        avgDealValue: 0
      };

      // Calculate new stats
      const newStats = {
        totalRevenue: currentStats.totalRevenue + valueDiff,
        totalDeals: change.after.exists 
          ? (change.before.exists ? currentStats.totalDeals : currentStats.totalDeals + 1)
          : currentStats.totalDeals - 1
      };
      newStats.avgDealValue = newStats.totalDeals > 0 
        ? newStats.totalRevenue / newStats.totalDeals 
        : 0;

      // Update or create stats document
      transaction.set(statsRef, newStats, { merge: true });
    });
});