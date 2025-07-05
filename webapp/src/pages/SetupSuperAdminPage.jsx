import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase/init';
import { getFirestore } from 'firebase/firestore';

export default function SetupSuperAdminPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setupSuperAdmin = async () => {
    setLoading(true);
    setError('');
    setStatus('Setting up super admin...');

    try {
      // Sign in with super admin credentials
      setStatus('Signing in...');
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        'admin@swedprime.com', 
        'superadmin123'
      );
      
      const user = userCredential.user;
      setStatus(`Signed in successfully! UID: ${user.uid}`);

      // Create super admin document in Firestore
      setStatus('Creating super admin document in Firestore...');
      const db = getFirestore();
      
      await setDoc(doc(db, 'superAdminUsers', user.uid), {
        email: 'admin@swedprime.com',
        displayName: 'Super Administrator',
        createdAt: serverTimestamp(),
        isSuperAdmin: true,
        role: 'super-admin'
      });

      setStatus('✅ Super admin setup completed successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/super-admin';
      }, 2000);
      
    } catch (err) {
      console.error('Setup error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Super Admin Setup</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Setup Instructions:</h3>
            <p className="text-blue-700 text-sm mt-1">
              This will configure super admin access for admin@swedprime.com
            </p>
          </div>

          {status && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">{status}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-2 text-xs text-red-600">
                <p>Make sure the user admin@swedprime.com exists in Firebase Authentication</p>
              </div>
            </div>
          )}

          <button
            onClick={setupSuperAdmin}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Setting up...' : 'Setup Super Admin'}
          </button>

          <div className="text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 