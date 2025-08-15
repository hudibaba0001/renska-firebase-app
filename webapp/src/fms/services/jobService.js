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

export const jobService = {
  async fetchJobs(companyId, options = {}) {
    try {
      const jobsRef = collection(db, `companies/${companyId}/jobs`);
      let q = query(
        jobsRef,
        where('deleted', '==', false),
        orderBy('scheduledAt', 'desc')
      );

      // Apply filters if provided
      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }
      if (options.crewId) {
        q = query(q, where('crewId', '==', options.crewId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  async fetchJob(companyId, jobId) {
    try {
      const jobRef = doc(db, `companies/${companyId}/jobs/${jobId}`);
      const snapshot = await getDoc(jobRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  async createJob(companyId, jobData) {
    try {
      const jobsRef = collection(db, `companies/${companyId}/jobs`);
      const docRef = await addDoc(jobsRef, {
        ...jobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: jobData.status || 'pending',
        deleted: false
      });

      return {
        id: docRef.id,
        ...jobData
      };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  async updateJob(companyId, jobId, updates) {
    try {
      const jobRef = doc(db, `companies/${companyId}/jobs/${jobId}`);
      await updateDoc(jobRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return {
        id: jobId,
        ...updates
      };
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  async deleteJob(companyId, jobId) {
    try {
      const jobRef = doc(db, `companies/${companyId}/jobs/${jobId}`);
      await updateDoc(jobRef, {
        deleted: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
};