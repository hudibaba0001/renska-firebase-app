const { onDealStatusChange } = require('../routes/deals');

describe('Deal Status Change Function', () => {
  let wrapped;
  const companyId = 'test-company';
  const dealId = 'test-deal';

  beforeAll(() => {
    // Wrap the Cloud Function
    wrapped = functionsTest.wrap(onDealStatusChange);
  });

  beforeEach(async () => {
    // Clean up any existing test data
    const dealRef = admin.firestore()
      .collection('companies').doc(companyId)
      .collection('deals').doc(dealId);
    
    await dealRef.delete();

    // Also clean up any jobs that might have been created
    const jobsSnapshot = await admin.firestore()
      .collection('companies').doc(companyId)
      .collection('jobs')
      .where('sourceDealId', '==', dealId)
      .get();

    const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
  });

  it('should create a job when deal status changes to Won', async () => {
    // Setup: Create a deal document
    const dealRef = admin.firestore()
      .collection('companies').doc(companyId)
      .collection('deals').doc(dealId);

    const initialDealData = {
      status: 'Negotiating',
      customerName: 'Test Customer',
      serviceName: 'Test Service',
      address: '123 Test St',
      price: 1000,
      currency: 'SEK',
      title: 'Test Deal'
    };

    await dealRef.set(initialDealData);

    // Create the change object
    const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(
      initialDealData,
      `companies/${companyId}/deals/${dealId}`
    );

    const afterData = {
      ...initialDealData,
      status: 'Won'
    };

    const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot(
      afterData,
      `companies/${companyId}/deals/${dealId}`
    );

    const change = functionsTest.makeChange(beforeSnapshot, afterSnapshot);
    const context = {
      params: { companyId, dealId }
    };

    // Execute the function
    await wrapped(change, context);

    // Verify: Check if a job was created with correct data
    const jobsSnapshot = await admin.firestore()
      .collection('companies').doc(companyId)
      .collection('jobs')
      .where('sourceDealId', '==', dealId)
      .get();

    expect(jobsSnapshot.empty).toBe(false);
    expect(jobsSnapshot.size).toBe(1);

    const jobData = jobsSnapshot.docs[0].data();
    expect(jobData).toMatchObject({
      customerName: 'Test Customer',
      serviceName: 'Test Service',
      status: 'Pending Schedule',
      address: '123 Test St',
      price: 1000,
      currency: 'SEK',
      sourceType: 'deal',
      sourceDealId: dealId
    });

    // Verify: Check if deal was updated with job reference
    const updatedDeal = await dealRef.get();
    const dealData = updatedDeal.data();
    expect(dealData.metadata).toBeDefined();
    expect(dealData.metadata.convertedToJob).toBe(true);
    expect(dealData.metadata.jobId).toBe(jobsSnapshot.docs[0].id);
  });

  it('should not create a job when deal status changes between non-Won statuses', async () => {
    // Setup: Create a deal with 'Negotiating' status
    const dealRef = admin.firestore()
      .collection('companies').doc(companyId)
      .collection('deals').doc(dealId);

    const initialDealData = {
      status: 'Negotiating',
      customerName: 'Test Customer'
    };

    await dealRef.set(initialDealData);

    // Create change object: Negotiating -> Lost
    const beforeSnapshot = functionsTest.firestore.makeDocumentSnapshot(
      initialDealData,
      `companies/${companyId}/deals/${dealId}`
    );

    const afterData = {
      ...initialDealData,
      status: 'Lost'
    };

    const afterSnapshot = functionsTest.firestore.makeDocumentSnapshot(
      afterData,
      `companies/${companyId}/deals/${dealId}`
    );

    const change = functionsTest.makeChange(beforeSnapshot, afterSnapshot);
    const context = {
      params: { companyId, dealId }
    };

    // Execute the function
    await wrapped(change, context);

    // Verify: No job should be created
    const jobsSnapshot = await admin.firestore()
      .collection('companies').doc(companyId)
      .collection('jobs')
      .where('sourceDealId', '==', dealId)
      .get();

    expect(jobsSnapshot.empty).toBe(true);
  });

  afterAll(async () => {
    // Final cleanup
    const dealRef = admin.firestore()
      .collection('companies').doc(companyId)
      .collection('deals').doc(dealId);
    
    await dealRef.delete();
  });
});