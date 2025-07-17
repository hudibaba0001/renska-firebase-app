// webapp/src/services/firestore.js

import { collection, query, getDocs, orderBy, addDoc, deleteDoc, doc, where, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/init";
import { serverTimestamp } from "firebase/firestore";

export const getAllTenants = async () => {
  try {
    const tenantsRef = collection(db, 'companies');
    const q = query(tenantsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const tenants = [];
    snapshot.forEach(doc => {
      // Add the document to our array
      const tenantData = { id: doc.id, ...doc.data() };
      tenants.push(tenantData);
      
      // Log each tenant for debugging
      console.log(`Tenant found: ${doc.id}`, tenantData);
      
      // Check if subscription is properly structured
      if (!tenantData.subscription) {
        console.warn(`Tenant ${doc.id} is missing subscription object`);
      } else if (tenantData.subscription.active === undefined) {
        console.warn(`Tenant ${doc.id} has subscription but missing active status`);
      }
    });
    
    console.log(`Total tenants found: ${tenants.length}`);
    return tenants;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return []; // Always return an array, even on error
  }
};

// Create a new service in the 'services' subcollection for a specific company
export const createService = async (companyId, serviceData) => {
  try {
    const servicesRef = collection(db, 'companies', companyId, 'services');
    // Remove vatRate if undefined
    const cleanedServiceData = { ...serviceData };
    if (cleanedServiceData.vatRate === undefined) {
      delete cleanedServiceData.vatRate;
    }
    const docRef = await addDoc(servicesRef, cleanedServiceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Delete a service from the 'services' subcollection for a specific company
export const deleteService = async (companyId, serviceId) => {
  try {
    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    await deleteDoc(serviceDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Update a service in the 'services' subcollection for a specific company
export const updateService = async (companyId, serviceId, serviceData) => {
  try {
    // Remove undefined values (e.g., vatRate)
    const cleanedServiceData = { ...serviceData };
    Object.keys(cleanedServiceData).forEach(key => {
      if (cleanedServiceData[key] === undefined) {
        delete cleanedServiceData[key];
      }
    });
    const serviceDocRef = doc(db, 'companies', companyId, 'services', serviceId);
    await updateDoc(serviceDocRef, cleanedServiceData);
    return true;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Get all services for a specific company (tenant) by companyId
export const getAllServicesForCompany = async (companyId) => {
  try {
    const servicesRef = collection(db, 'companies', companyId, 'services');
    // Remove orderBy to fetch all services regardless of createdAt
    const q = query(servicesRef);
    const snapshot = await getDocs(q);
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    console.log('Fetched services:', services);
    return services;
  } catch (error) {
    console.error('Error fetching services for company:', error);
    return [];
  }
};

// Create a new booking in the 'bookings' collection
export const createBooking = async (bookingData) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, bookingData);
    return { id: docRef.id, ...bookingData };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get all bookings for a specific company (tenant) by companyId
export const getAllBookingsForCompany = async (companyId) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings for company:', error);
    return [];
  }
};

// Get a tenant (company) by ID
export const getTenant = async (tenantId) => {
  try {
    const tenantDocRef = doc(db, 'companies', tenantId);
    const tenantSnap = await getDoc(tenantDocRef);
    if (tenantSnap.exists()) {
      return { id: tenantSnap.id, ...tenantSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching tenant:', error);
    throw error;
  }
};

// Create a new tenant (company) in the 'companies' collection
export const createTenant = async (tenantData) => {
  try {
    const companiesRef = collection(db, 'companies');
    const tenantWithTimestamp = {
      ...tenantData,
      createdAt: serverTimestamp(),
      subscription: {
        ...(tenantData.subscription || {}),
        active: true,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    const docRef = await addDoc(companiesRef, tenantWithTimestamp);
    return { id: docRef.id, ...tenantWithTimestamp };
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
};

// Update a tenant (company) in the 'companies' collection by ID
export const updateTenant = async (tenantId, tenantData) => {
  try {
    const tenantDocRef = doc(db, 'companies', tenantId);
    await updateDoc(tenantDocRef, tenantData);
    return true;
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

// Delete a tenant (company) from the 'companies' collection by ID
export const deleteTenant = async (tenantId) => {
  try {
    const tenantDocRef = doc(db, 'companies', tenantId);
    await deleteDoc(tenantDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
};
