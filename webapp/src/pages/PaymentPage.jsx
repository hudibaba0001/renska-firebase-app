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
import { STRIPE_CONFIG, formatPrice, getStripe } from '../stripe/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/init';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [company, setCompany] = useState(null);
  const [plan, setPlan] = useState(null);
  
  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get('companyId');
  const planId = searchParams.get('plan');
  
  // Fetch company and plan details
  useEffect(() => {
    async function fetchData() {
      if (!companyId || !planId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }
      
      try {
        // Get company data
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (!companyDoc.exists()) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        
        setCompany(companyDoc.data());
        
        // Get plan data
        const selectedPlan = STRIPE_CONFIG.plans[planId];
        if (!selectedPlan) {
          setError('Invalid plan selected');
          setLoading(false);
          return;
        }
        
        setPlan(selectedPlan);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load payment information');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [companyId, planId]);
  
  // Handle payment processing
  const handlePayment = async () => {
    if (!companyId || !planId || !company) return;
    
    setProcessing(true);
    
    try {
      // In a production environment, you would:
      // 1. Call your backend API to create a Stripe Checkout session
      // 2. Redirect the user to Stripe Checkout
      // 3. Handle the success/cancel redirects
      
      // For demo purposes with sandbox, we'll create a simple checkout flow
      // This would typically be handled by a secure backend
      const stripe = await getStripe();
      // Explicitly mark stripe as intentionally unused to satisfy linter
      void stripe;
      
      // Create a checkout session (in production, this would be done server-side)
      // For demo, we'll simulate the session creation
      const sessionData = {
        price: plan.priceId,
        success_url: `${window.location.origin}/admin/${companyId}?payment=success`,
        cancel_url: `${window.location.origin}/payment?companyId=${companyId}&plan=${planId}&error=cancelled`,
        customer_email: company.adminEmail,
        client_reference_id: companyId,
        metadata: {
          companyId,
          planId
        }
      };
      
      console.log('Creating checkout session with:', sessionData);
      
      // In production, you would make an API call to your backend:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sessionData)
      // });
      // const session = await response.json();
      
      // For demo purposes, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update company with subscription info
      await updateDoc(doc(db, 'companies', companyId), {
        subscriptionActive: true,
        subscriptionPlan: planId,
        subscriptionStartDate: new Date(),
        paymentStatus: 'active',
        stripeCustomerId: `cus_demo_${Date.now()}`, // In production, this would come from Stripe
        paymentMethod: {
          type: 'card',
          last4: '4242', // Demo data
          brand: 'visa',
          expMonth: '12',
          expYear: '2025'
        }
      });
      
      toast.success('Payment processed successfully!');
      
      // Redirect to admin dashboard
      navigate(`/admin/${companyId}`);
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };
  
  // Skip payment for free trials
  const handleSkipPayment = async () => {
    if (!companyId || !planId || !company) return;
    
    setProcessing(true);
    
    try {
      // Update company with trial info
      await updateDoc(doc(db, 'companies', companyId), {
        subscriptionActive: true,
        subscriptionPlan: planId,
        subscriptionStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        paymentStatus: 'trial'
      });
      
      toast.success('Free trial activated!');
      
      // Redirect to admin dashboard
      navigate(`/admin/${companyId}`);
    } catch (error) {
      console.error('Trial activation error:', error);
      setError('Failed to activate trial. Please try again.');
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-lg mx-auto my-8 px-4">
        <Alert color="failure">
          <div className="font-medium">
            Error
          </div>
          <div className="mt-2">
            {error}
          </div>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate('/pricing')}>
            Return to Plans
          </Button>
        </div>
      </div>
    );
  }
  
  // Check if this is the starter plan which offers a free trial
  const offersFreeTrial = planId === 'starter';
  
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
        <p className="text-gray-600">You're just one step away from transforming your cleaning business</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <div className="font-medium">{plan.name} Plan</div>
                <div className="text-sm text-gray-500">Monthly subscription</div>
              </div>
              <div className="font-bold">{formatPrice(plan.price)}</div>
            </div>
            
            <div className="space-y-2 mb-4">
              <h3 className="font-medium">Includes:</h3>
              <ul className="space-y-1">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="font-bold">Total</div>
              <div className="font-bold text-lg">{formatPrice(plan.price)}/month</div>
            </div>
          </div>
        </Card>
        
        {/* Payment Form */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Credit / Debit Card</span>
                </div>
                <div className="flex space-x-1">
                  <img src="https://cdn.jsdelivr.net/gh/creativetimofficial/public-assets@master/soft-ui-dashboard/assets/img/logos/mastercard.png" alt="mastercard" className="h-6" />
                  <img src="https://cdn.jsdelivr.net/gh/creativetimofficial/public-assets@master/soft-ui-dashboard/assets/img/logos/visa.png" alt="visa" className="h-6" />
                </div>
              </div>
              
              <Button
                color="primary"
                className="w-full mb-3"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </div>
                ) : (
                  <>Pay {formatPrice(plan.price)}</>
                )}
              </Button>
              
              {offersFreeTrial && (
                <Button
                  color="light"
                  className="w-full"
                  onClick={handleSkipPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>Start 14-day free trial</>
                  )}
                </Button>
              )}
            </div>
            
            <div className="text-center space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <LockClosedIcon className="h-4 w-4 mr-1" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center justify-center">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                <span>Your data is protected</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 