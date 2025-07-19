import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/init';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

export default function AdminCompaniesPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      setError('');
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Not logged in.');
          setLoading(false);
          return;
        }
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userSnap.exists()) {
          setError('User profile not found.');
          setLoading(false);
          return;
        }
        const { companyId } = userSnap.data();
        if (!companyId) {
          setError('No company assigned to this admin.');
          setLoading(false);
          return;
        }
        const companySnap = await getDoc(doc(db, 'companies', companyId));
        if (!companySnap.exists()) {
          setError('Company not found.');
          setLoading(false);
          return;
        }
        setCompany({ id: companyId, ...companySnap.data() });
      } catch (e) {
        setError('Failed to load company.');
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your company? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'companies', company.id));
      setDeleted(true);
    } catch (e) {
      setError('Failed to delete company.');
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="border rounded p-4 bg-gray-50">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  if (deleted) return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Company successfully deleted</h3>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  if (!company) return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No company information available</h3>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Your Company</h1>
        <div className="border rounded p-4 bg-gray-50 flex justify-between items-center">
          <span className="font-semibold">{company.name || company.id}</span>
          <div className="flex gap-2">
            <Link to={`/admin/${company.id}/config`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">Manage</Link>
            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 