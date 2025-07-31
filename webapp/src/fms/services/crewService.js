import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/init';

const crewCollection = (companyId) => collection(db, 'companies', companyId, 'crews');
const crewDoc = (companyId, crewId) => doc(db, 'companies', companyId, 'crews', crewId);

export const crewService = {
  async fetchCrews(companyId) {
    const snapshot = await getDocs(crewCollection(companyId));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createCrew(companyId, name) {
    const docRef = await addDoc(crewCollection(companyId), { 
      name,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, name };
  },

  async updateCrew(companyId, crewId, name) {
    await updateDoc(crewDoc(companyId, crewId), { 
      name,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteCrew(companyId, crewId) {
    await deleteDoc(crewDoc(companyId, crewId));
  }
};