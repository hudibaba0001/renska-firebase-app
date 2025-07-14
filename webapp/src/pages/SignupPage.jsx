import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase/init';

function toCompanyId(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

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
    let userCred = null;

    try {
      // Step 1: Create the user in Firebase Auth first.
      userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const companyId = toCompanyId(companyName);

      // Step 2: Now that the user is created and authenticated, check if the company ID already exists.
      const companyRef = doc(db, 'companies', companyId);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        // IMPORTANT: If the company exists, we must delete the newly created user to avoid orphans.
        await deleteUser(user); 
        setError('A company with this name already exists. Please choose a different name.');
        setLoading(false);
        return;
      }

      // Step 3: Use a batch write for atomicity to create company and user profile docs.
      const batch = writeBatch(db);

      // Company document
      batch.set(companyRef, {
        companyName,
        address,
        orgNumber,
        adminName,
        adminEmail: email,
        adminPhone: phone,
        adminUid: user.uid,
        created: new Date(),
        plan: selectedPlan || 'basic', // Store the selected plan
        pricePerSqm: 0,
        services: [],
        frequencyMultiplier: {},
        addOns: {},
        windowCleaningPrices: {},
        zipAreas: [],
        rutEnabled: false,
      });

      // User profile document
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        email,
        name: adminName,
        companyId,
        phone,
        created: new Date(),
      });

      // Commit the batch
      await batch.commit();

      setSuccess('Account created! Redirecting to payment setup...');
      // Redirect to payment page with company ID and plan information
      setTimeout(() => navigate(`/payment?companyId=${companyId}&plan=${selectedPlan || 'basic'}`), 1500);

    } catch (e) {
      // If any error occurs after user creation, delete the user.
      if (userCred) {
        await deleteUser(userCred.user).catch(deleteError => {
          console.error("Failed to clean up user after signup error:", deleteError);
          setError("An error occurred, and we couldn't automatically clean up the new user. Please contact support.");
        });
      }
      const message = e.message.replace('Firebase:', '');
      if (e.code === 'auth/email-already-in-use') {
         setError('This email address is already in use by another account.');
      } else {
        setError(message);
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
        {error && <div className="mb-4 text-red-600" role="alert">{error}</div>}
        {success && <div className="mb-4 text-green-700" role="alert">{success}</div>}
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
