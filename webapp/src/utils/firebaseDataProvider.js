import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/init';

export const createFirebaseDataProvider = (companyId) => {
  if (!companyId) {
    throw new Error('Company ID is required for Firebase data provider');
  }
  
  return {
    getList: async (resource, params) => {
      try {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const { filter } = params;

        let q = collection(db, resource);
        
        // Add company filter
        const constraints = [where('companyId', '==', companyId)];
        
        // Add other filters
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== '') {
            constraints.push(where(key, '==', filter[key]));
          }
        });
        
        // Add sorting
        if (field) {
          constraints.push(orderBy(field, order.toLowerCase()));
        }
        
        // Add pagination
        if (perPage) {
          constraints.push(limit(perPage));
        }
        
        q = query(q, ...constraints);
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return {
          data,
          total: data.length // Note: This is approximate for pagination
        };
      } catch (error) {
        console.error('Error in getList:', error);
        throw error;
      }
    },

    getOne: async (resource, params) => {
      try {
        const docRef = doc(db, resource, params.id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error(`Document ${params.id} not found`);
        }
        
        return {
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } catch (error) {
        console.error('Error in getOne:', error);
        throw error;
      }
    },

    getMany: async (resource, params) => {
      try {
        const promises = params.ids.map(id => getDoc(doc(db, resource, id)));
        const docs = await Promise.all(promises);
        
        const data = docs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        return { data };
      } catch (error) {
        console.error('Error in getMany:', error);
        throw error;
      }
    },

    getManyReference: async (resource, params) => {
      try {
        const { target, id } = params;
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const { filter } = params;

        const constraints = [
          where('companyId', '==', companyId),
          where(target, '==', id)
        ];
        
        // Add other filters
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== '') {
            constraints.push(where(key, '==', filter[key]));
          }
        });
        
        // Add sorting
        if (field) {
          constraints.push(orderBy(field, order.toLowerCase()));
        }
        
        // Add pagination
        if (perPage) {
          constraints.push(limit(perPage));
        }
        
        const q = query(collection(db, resource), ...constraints);
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return {
          data,
          total: data.length
        };
      } catch (error) {
        console.error('Error in getManyReference:', error);
        throw error;
      }
    },

    create: async (resource, params) => {
      try {
        const data = {
          ...params.data,
          companyId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, resource), data);
        
        return {
          data: {
            id: docRef.id,
            ...data
          }
        };
      } catch (error) {
        console.error('Error in create:', error);
        throw error;
      }
    },

    update: async (resource, params) => {
      try {
        const data = {
          ...params.data,
          updatedAt: serverTimestamp()
        };
        
        const docRef = doc(db, resource, params.id);
        await updateDoc(docRef, data);
        
        return {
          data: {
            id: params.id,
            ...data
          }
        };
      } catch (error) {
        console.error('Error in update:', error);
        throw error;
      }
    },

    updateMany: async (resource, params) => {
      try {
        const promises = params.ids.map(id => {
          const docRef = doc(db, resource, id);
          return updateDoc(docRef, {
            ...params.data,
            updatedAt: serverTimestamp()
          });
        });
        
        await Promise.all(promises);
        
        return { data: params.ids };
      } catch (error) {
        console.error('Error in updateMany:', error);
        throw error;
      }
    },

    delete: async (resource, params) => {
      try {
        const docRef = doc(db, resource, params.id);
        await deleteDoc(docRef);
        
        return {
          data: { id: params.id }
        };
      } catch (error) {
        console.error('Error in delete:', error);
        throw error;
      }
    },

    deleteMany: async (resource, params) => {
      try {
        const promises = params.ids.map(id => {
          const docRef = doc(db, resource, id);
          return deleteDoc(docRef);
        });
        
        await Promise.all(promises);
        
        return { data: params.ids };
      } catch (error) {
        console.error('Error in deleteMany:', error);
        throw error;
      }
    }
  };
};