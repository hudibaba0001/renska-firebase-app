import firebase from '../firebase/init';
import { loadCRMDemoData } from './loadCRMDemoData';

export const testCRMDemoData = async () => {
  try {
    console.log('🧪 Testing CRM demo data loading...');
    
    // Load demo data
    await loadCRMDemoData('r7kAsnh-r1');
    
    // Check if data was loaded
    const snapshot = await firebase.firestore()
      .collection('customers')
      .where('companyId', '==', 'r7kAsnh-r1')
      .get();
    
    console.log('📊 Found customers:', snapshot.docs.length);
    snapshot.docs.forEach(doc => {
      console.log('Customer:', doc.data());
    });
    
    return snapshot.docs.length;
  } catch (error) {
    console.error('❌ Error testing CRM demo data:', error);
    throw error;
  }
};

export default testCRMDemoData; 