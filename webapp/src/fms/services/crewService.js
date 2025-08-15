import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/init';

export const crewService = {
  async fetchCrews(companyId, options = {}) {
    try {
      const crewsRef = collection(db, `companies/${companyId}/crews`);
      let q = query(
        crewsRef,
        where('deleted', '==', false),
        orderBy('name')
      );

      // Apply filters if provided
      if (options.active !== undefined) {
        q = query(q, where('active', '==', options.active));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching crews:', error);
      throw error;
    }
  },

  async fetchCrew(companyId, crewId) {
    try {
      const crewRef = doc(db, `companies/${companyId}/crews/${crewId}`);
      const snapshot = await getDoc(crewRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } catch (error) {
      console.error('Error fetching crew:', error);
      throw error;
    }
  },

  async createCrew(companyId, crewData) {
    try {
      const crewsRef = collection(db, `companies/${companyId}/crews`);
      const docRef = await addDoc(crewsRef, {
        ...crewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: crewData.active ?? true,
        deleted: false
      });

      return {
        id: docRef.id,
        ...crewData
      };
    } catch (error) {
      console.error('Error creating crew:', error);
      throw error;
    }
  },

  async updateCrew(companyId, crewId, updates) {
    try {
      const crewRef = doc(db, `companies/${companyId}/crews/${crewId}`);
      await updateDoc(crewRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return {
        id: crewId,
        ...updates
      };
    } catch (error) {
      console.error('Error updating crew:', error);
      throw error;
    }
  },

  async deleteCrew(companyId, crewId) {
    try {
      const crewRef = doc(db, `companies/${companyId}/crews/${crewId}`);
      await updateDoc(crewRef, {
        deleted: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting crew:', error);
      throw error;
    }
  }
};