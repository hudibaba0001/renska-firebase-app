// webapp/src/services/firestore.js

import { collection, query, getDocs, orderBy, addDoc, deleteDoc, doc, where } from "firebase/firestore";
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

// Create a new service in the 'services' collection
export const createService = async (serviceData) => {
  try {
    const servicesRef = collection(db, 'services');
    const docRef = await addDoc(servicesRef, serviceData);
    return { id: docRef.id, ...serviceData };
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Delete a service from the 'services' collection by ID
export const deleteService = async (serviceId) => {
  try {
    const serviceDocRef = doc(db, 'services', serviceId);
    await deleteDoc(serviceDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Get all services for a specific company (tenant) by companyId
export const getAllServicesForCompany = async (companyId) => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return services;
  } catch (error) {
    console.error('Error fetching services for company:', error);
    return [];
  }
};
