import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/init';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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

  if (loading) return <div>Loading company…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (deleted) return <div className="text-green-700">Company deleted.</div>;
  if (!company) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Your Company</h1>
      <div className="border rounded p-4 bg-gray-50 flex justify-between items-center">
        <span className="font-semibold">{company.name || company.id}</span>
        <div className="flex gap-2">
          <Link to={`/admin/${company.id}/config`} className="bg-blue-500 text-white px-4 py-2 rounded">Manage</Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
} 