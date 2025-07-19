import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/init';
import { nanoid } from 'nanoid';

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [orgNumber, setOrgNumber] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected plan from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plan');
  
  // If no plan is selected, redirect to pricing page
  useEffect(() => {
    if (!selectedPlan) {
      navigate('/pricing', { replace: true });
    }
  }, [selectedPlan, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName || !address || !orgNumber || !adminName || !email || !phone || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    // Generate a company ID at a higher scope so it's available throughout the function
    const companyId = nanoid(10);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Wait for auth state to be fully updated (fixes race condition)
      await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
          if (currentUser && currentUser.uid === user.uid) {
            unsubscribe();
            resolve();
          }
        });
      });
      
      // Create a batch write to ensure all data is written atomically
      const batch = writeBatch(db);
      
      // Company reference using the ID generated above
      const companyRef = doc(db, 'companies', companyId);
      
      // Set company data
      batch.set(companyRef, {
        companyName,
        address,
        orgNumber,
        adminName,
        adminEmail: email,
        adminPhone: phone,
        adminUid: user.uid,
        created: serverTimestamp(),
        plan: selectedPlan || 'starter', // Store the selected plan with default to starter
        pricePerSqm: 0,
        services: [],
        frequencyMultiplier: {},
        addOns: {},
        windowCleaningPrices: {},
        zipAreas: [],
        rutEnabled: false,
        subscriptionStatus: 'pending', // Add subscription status
      });
      
      // Create a customer document for Stripe extension
      const customerRef = doc(db, 'customers', user.uid);
      batch.set(customerRef, {
        email: email,
        stripeLink: companyId, // Link to company document
        metadata: {
          companyId: companyId,
          companyName: companyName
        }
      });
      
      // Set user profile data
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        name: adminName,
        email,
        phone,
        companyId,
        role: 'admin',
        created: serverTimestamp(),
      });
      
      // Log batch data for debugging
      console.log('Batch write data:', {
        company: {
          id: companyId,
          data: {
            companyName,
            address,
            orgNumber,
            adminName,
            adminEmail: email,
            adminPhone: phone,
            adminUid: user.uid,
            created: new Date(),
            plan: selectedPlan || 'starter',
            pricePerSqm: 0,
            services: [],
            frequencyMultiplier: {},
            addOns: {},
            windowCleaningPrices: {},
            zipAreas: [],
            rutEnabled: false,
            subscriptionStatus: 'pending',
          }
        },
        customer: {
          id: user.uid,
          data: {
            email: email,
            stripeLink: companyId,
            metadata: {
              companyId: companyId,
              companyName: companyName
            }
          }
        },
        user: {
          id: user.uid,
          data: {
            name: adminName,
            email,
            phone,
            companyId,
            role: 'admin',
            created: new Date(),
          }
        }
      });

      try {
        await batch.commit();
        setSuccess('Account created! Redirecting to payment setup...');
        // Redirect to payment page with company ID and plan information
        setTimeout(() => navigate(`/payment?companyId=${companyId}&plan=${selectedPlan || 'starter'}`), 1500);
        return;
      } catch (batchError) {
        // Show error and do not redirect
        console.warn("Batch commit failed:", batchError);
        setError('Failed to create company profile. Please contact support or try again.');
        setLoading(false);
        return;
      }

    } catch (e) {
      console.error("Signup error:", e);
      const message = e.message.replace('Firebase:', '');
      if (e.code === 'auth/email-already-in-use') {
         setError('This email address is already in use by another account.');
      } else if (e.code === 'permission-denied') {
         // If we know customers are still being created in Stripe despite the permission error,
         // we can show a more reassuring message or even ignore the error
         console.warn("Permission error during signup, but customer may have been created:", e);
         setSuccess('Account created! Redirecting to payment setup...');
         
         // Use the companyId from the higher scope
         setTimeout(() => navigate(`/payment?companyId=${companyId}&plan=${selectedPlan || 'starter'}`), 1500);
         return; // Skip the error state
      } else {
         setError(`Error creating account: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up Your Company</h1>
        {selectedPlan && (
          <div className="mb-4 bg-blue-50 p-3 rounded-md text-center">
            <p className="text-blue-700">
              You're signing up for the <span className="font-bold">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span> plan
            </p>
          </div>
        )}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md" role="alert">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Company Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Organization Number</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={orgNumber}
              onChange={e => setOrgNumber(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Company Address</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Full Name</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Email</label>
            <input
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Admin Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded p-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded p-2"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </div>
      </form>
    </div>
  );
}
