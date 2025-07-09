// webapp/src/services/firestore.js

import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/init";

export const getAllTenants = async () => {
  try {
    const tenantsRef = collection(db, 'companies');
    const q = query(tenantsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const tenants = [];
    snapshot.forEach(doc => {
      tenants.push({ id: doc.id, ...doc.data() });
    });
    return tenants;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return []; // Always return an array, even on error
  }
};
