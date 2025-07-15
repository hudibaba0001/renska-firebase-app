import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Spinner, 
  Alert 
} from 'flowbite-react';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import { STRIPE_CONFIG, formatPrice } from '../stripe/config';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/init';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState(null);
  const { currentUser } = useAuth();
  
  // Get query parameters
  const params = new URLSearchParams(location.search);
  const companyId = params.get('companyId');
  const planId = params.get('plan') || 'starter';
  
  // Get plan details
  const plan = STRIPE_CONFIG.plans[planId] || STRIPE_CONFIG.plans.starter;
  
  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        setError('No company ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (!companyDoc.exists()) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        
        setCompany(companyDoc.data());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Error loading company data');
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [companyId]);
  
  const handleFreeTrial = async () => {
    if (!companyId || !planId || !company) return;
    
    setProcessing(true);
    setError('');
    
    try {
      // Update company with subscription info
      await updateDoc(doc(db, 'companies', companyId), {
        subscriptionStatus: 'trialing',
        subscriptionPlan: planId,
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        paymentMethod: 'Free Trial'
      });
      
      toast.success('Your free trial has been activated!');
      setTimeout(() => navigate(`/admin/${companyId}`), 1500);
    } catch (err) {
      console.error('Error activating trial:', err);
      setError('Failed to activate free trial');
      setProcessing(false);
    }
  };
  
  const handlePayment = async () => {
    if (!companyId || !planId || !company) return;
    
    setProcessing(true);
    setError('');
    
    try {
      // Create a checkout session using the Stripe extension structure
      const checkoutSessionRef = await addDoc(
        collection(db, `customers/${currentUser.uid}/checkout_sessions`),
        {
          price: plan.priceId,
          success_url: `${window.location.origin}/admin/${companyId}?payment=success`,
          cancel_url: `${window.location.origin}/payment?companyId=${companyId}&plan=${planId}&canceled=true`,
          metadata: {
            companyId: companyId,
            planId: planId
          }
        }
      );
      
      // Listen for the checkout session to be created
      onSnapshot(checkoutSessionRef, (snap) => {
        const { error, url } = snap.data();
        if (error) {
          setError(error.message);
          setProcessing(false);
        }
        if (url) {
          window.location.assign(url); // Redirect to Stripe checkout
        }
      });
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to create checkout session');
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert color="failure">
          <p>{error}</p>
          <Button onClick={() => navigate('/pricing')} className="mt-4">
            Back to Pricing
          </Button>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
        <p className="text-gray-600">You're just one step away from getting started with {plan.name}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>{plan.name} Plan</span>
              <span>{formatPrice(plan.price, plan.currency)}/month</span>
            </div>
            {plan.id === 'starter' && (
              <div className="text-green-600 font-medium">
                Includes 14-day free trial
              </div>
            )}
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(plan.price, plan.currency)}/month</span>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
              <span>Secure payment processing by Stripe</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <LockClosedIcon className="h-5 w-5 mr-2 text-green-600" />
              <span>Your data is protected and encrypted</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          
          {plan.id === 'starter' ? (
            <>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Start with a 14-day free trial. No credit card required.
                </p>
                <Button
                  color="success"
                  onClick={handleFreeTrial}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <><Spinner size="sm" className="mr-2" /> Processing...</>
                  ) : (
                    'Start 14-day free trial'
                  )}
                </Button>
              </div>
              <div className="text-center text-gray-500 text-sm">
                <p>Or pay now to start your subscription immediately</p>
              </div>
            </>
          ) : null}
          
          <div className="mt-4">
            <Button
              color="blue"
              onClick={handlePayment}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <><Spinner size="sm" className="mr-2" /> Processing...</>
              ) : (
                <><CreditCardIcon className="h-5 w-5 mr-2" /> Pay with Card</>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 