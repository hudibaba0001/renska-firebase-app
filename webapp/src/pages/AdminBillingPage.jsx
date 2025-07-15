import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'flowbite-react';
import { CreditCardIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../components/AdminLayout';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/init';
import { STRIPE_CONFIG, formatPrice } from '../stripe/config';
import { useAuth } from '../context/AuthContext';
import { httpsCallable, getFunctions } from 'firebase/functions';

export default function AdminBillingPage() {
  const { companyId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      if (!companyId || !currentUser) {
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
        
        const companyData = companyDoc.data();
        
        // Get subscription plan
        const planId = companyData.subscriptionPlan || 'starter';
        const plan = STRIPE_CONFIG.plans[planId];
        
        if (plan) {
          setCurrentPlan(plan);
        }
        
        // Check for active subscriptions in Stripe extension collection
        const subscriptionsQuery = query(
          collection(db, 'customers', currentUser.uid, 'subscriptions'),
          where('status', 'in', ['trialing', 'active'])
        );
        
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        if (!subscriptionsSnapshot.empty) {
          // Get the first active subscription
          const subscriptionDoc = subscriptionsSnapshot.docs[0];
          const subscriptionData = subscriptionDoc.data();
          setSubscription(subscriptionData);
          
          // Get payment method if available
          if (subscriptionData.default_payment_method) {
            const paymentMethodDoc = await getDoc(
              doc(db, 'customers', currentUser.uid, 'payment_methods', subscriptionData.default_payment_method)
            );
            
            if (paymentMethodDoc.exists()) {
              setPaymentMethod(paymentMethodDoc.data());
            }
          }
        } else if (companyData.subscriptionStatus === 'trialing') {
          // Handle free trial case
          setSubscription({
            status: 'trialing',
            trial_start: companyData.trialStart?.toDate(),
            trial_end: companyData.trialEnd?.toDate(),
            current_period_end: companyData.trialEnd?.toDate()
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing information');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [companyId, currentUser]);
  
  const handleManageSubscription = async () => {
    try {
      const functions = getFunctions();
      const createPortalLink = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');
      
      const { data } = await createPortalLink({
        returnUrl: window.location.href
      });
      
      window.location.assign(data.url);
    } catch (err) {
      console.error('Error creating portal link:', err);
      setError('Failed to open customer portal');
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <Alert color="failure">
          <p>{error}</p>
        </Alert>
      </AdminLayout>
    );
  }
  
  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';
  const renewalDate = subscription?.current_period_end?.toDate();
  const trialEndDate = subscription?.trial_end?.toDate();
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Current Plan */}
          <Card className="col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Current Plan</h2>
              
              {currentPlan && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-2xl font-bold">{currentPlan.name}</div>
                      <div className="text-gray-500">{formatPrice(currentPlan.price, currentPlan.currency)}/month</div>
                    </div>
                    
                    {isTrialing && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Free Trial
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <h3 className="font-medium">Features:</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {isTrialing && trialEndDate && (
                    <div className="flex items-center text-blue-600 mb-6">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>
                        Your free trial ends on {trialEndDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {isActive && renewalDate && (
                    <div className="flex items-center text-gray-600 mb-6">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>
                        Next billing date: {renewalDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <Button color="blue" onClick={handleManageSubscription}>
                    Manage Subscription
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          {/* Payment Method */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              
              {paymentMethod ? (
                <div>
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="h-8 w-8 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">
                        {paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)}
                      </div>
                      <div className="text-gray-500">
                        •••• {paymentMethod.card.last4} • Expires {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}
                      </div>
                    </div>
                  </div>
                  
                  <Button color="light" onClick={handleManageSubscription}>
                    Update Payment Method
                  </Button>
                </div>
              ) : isTrialing ? (
                <div>
                  <div className="text-gray-500 mb-4">
                    No payment method on file. Your free trial is currently active.
                  </div>
                  
                  <Button color="light" onClick={handleManageSubscription}>
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500">
                  No payment method on file.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 