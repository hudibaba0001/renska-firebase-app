import { db } from '../firebase/init.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Set up initial Firestore data structure for Stage 2
 * This creates the companies collection with sample data
 */
export async function setupInitialData() {
  try {
    console.log('🔧 Setting up initial Firestore data...');
    
    // Create sample company document
    const companyRef = doc(db, 'companies', 'swedprime');
    await setDoc(companyRef, {
      name: 'SwedPrime Cleaning',
      slug: 'swedprime',
      services: [],
      featureFlags: {
        canEditServices: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Created companies/swedprime document');
    
    // The bookings subcollection will be created automatically when first document is added
    console.log('📋 Bookings subcollection ready (will be created on first booking)');
    
    // Create another sample company for testing multi-tenancy
    const demoCompanyRef = doc(db, 'companies', 'demo-company');
    await setDoc(demoCompanyRef, {
      name: 'Demo Cleaning Company',
      slug: 'demo-company',
      services: [
        {
          id: 'basic-cleaning',
          name: 'Basic Cleaning',
          pricingModel: 'per-sqm-tiered',
          tiers: [
            { min: 0, max: 50, pricePerSqm: 12 },
            { min: 51, max: 100, pricePerSqm: 10 },
            { min: 101, max: 999, pricePerSqm: 8 }
          ]
        }
      ],
      featureFlags: {
        canEditServices: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Created companies/demo-company document');
    console.log('🎉 Initial Firestore setup complete!');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up Firestore data:', error);
    return false;
  }
}

/**
 * Test multi-tenant security by trying to access different companies
 * This helps verify our security rules are working correctly
 */
export async function testMultiTenantSecurity() {
  try {
    console.log('🧪 Testing multi-tenant security...');
    
    // Test reading company data (should work - public read)
    const companyRef = doc(db, 'companies', 'swedprime');
    const docSnap = await getDoc(companyRef);
    
    if (docSnap.exists()) {
      console.log('✅ Public read access working');
    } else {
      console.log('❌ Company document not found');
    }
    
    // Note: Write access testing requires authentication setup
    // This will be implemented in later stages
    
    return true;
  } catch (error) {
    console.error('❌ Error testing security:', error);
    return false;
  }
} 