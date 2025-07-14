import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { 
  Card, 
  Button, 
  Badge, 
  Alert, 
  Modal,
  Spinner 
} from 'flowbite-react'
import { 
  CreditCardIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  StarIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { STRIPE_CONFIG, formatPrice } from '../stripe/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init'

export default function AdminBillingPage() {
  const { companyId } = useParams()
  const [searchParams] = useSearchParams()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [billingInfo, setBillingInfo] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [changingPlan, setChangingPlan] = useState(null)

  // Check for success/error messages from URL params
  useEffect(() => {
    const success = searchParams.get('success')
    const plan = searchParams.get('plan')

    if (success === 'true') {
      toast.success('Subscription activated successfully!')
      if (plan) {
        const selectedPlan = STRIPE_CONFIG.plans[plan]
        if (selectedPlan) {
          setCurrentPlan(selectedPlan)
        }
      }
    }

  }, [searchParams])

  // Load real subscription data
  useEffect(() => {
    const loadBillingData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      
      try {
        // Fetch company data from Firestore
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        
        if (!companyDoc.exists()) {
          toast.error('Company not found');
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
        
        // Set billing info based on company data
        const subscriptionActive = companyData.subscriptionActive || false;
        const paymentStatus = companyData.paymentStatus || 'inactive';
        const trialEndDate = companyData.trialEndDate ? 
          (companyData.trialEndDate.toDate ? companyData.trialEndDate.toDate() : new Date(companyData.trialEndDate)) : 
          null;
        
        const nextBillingDate = companyData.subscriptionStartDate ? 
          new Date((companyData.subscriptionStartDate.toDate ? companyData.subscriptionStartDate.toDate() : new Date(companyData.subscriptionStartDate)).getTime() + 30 * 24 * 60 * 60 * 1000) : 
          new Date();
        
        setBillingInfo({
          nextBillingDate: nextBillingDate.toISOString(),
          paymentMethod: companyData.paymentMethod || {
            type: 'card',
            last4: '****',
            brand: 'unknown',
            expMonth: '--',
            expYear: '--'
          },
          status: paymentStatus,
          subscriptionActive,
          trialEndDate: trialEndDate ? trialEndDate.toISOString() : null
        });
        
        // For now, use mock invoices (in a real app, these would come from Stripe API)
        setInvoices([
          {
            id: 'inv_001',
            date: new Date().toISOString().split('T')[0],
            amount: plan.price,
            status: subscriptionActive ? 'paid' : 'pending',
            downloadUrl: '#'
          }
        ]);
      } catch (error) {
        console.error('Error loading billing data:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [companyId]);

  const handleChangePlan = async (newPlanId) => {
    setChangingPlan(newPlanId)
    
    try {
      // In a real app, this would call your backend to create a Stripe Customer Portal session
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate plan change
      const newPlan = STRIPE_CONFIG.plans[newPlanId]
      setCurrentPlan(newPlan)
      setShowPlanModal(false)
      toast.success(`Successfully changed to ${newPlan.name} plan!`)
      
      // In production, you would redirect to Stripe Customer Portal:
      // window.location.href = portalSession.url
      
    } catch (error) {
      toast.error('Failed to change plan')
    } finally {
      setChangingPlan(null)
    }
  }

  const handleManageBilling = () => {
    // In production, this would open Stripe Customer Portal
    toast.success('Opening billing portal...')
    // window.location.href = customerPortalUrl
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <p className="text-text-main dark:text-white">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  const plans = Object.values(STRIPE_CONFIG.plans)
  const isTrialActive = billingInfo?.status === 'trial' && billingInfo?.trialEndDate && new Date(billingInfo.trialEndDate) > new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading dark:text-white">Billing & Subscription</h1>
          <p className="text-sm text-text-main dark:text-white">Manage your subscription and billing information</p>
        </div>
        <Button
          color="gray"
          onClick={handleManageBilling}
          className="flex items-center space-x-2"
        >
          <CreditCardIcon className="h-4 w-4" />
          <span>Manage Billing</span>
        </Button>
      </div>

      {/* Subscription Status Alert */}
      {isTrialActive && (
        <Alert color="info">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">Free Trial Active</div>
              <div className="text-sm">
                Your trial ends on {new Date(billingInfo.trialEndDate).toLocaleDateString()}
                . Add a payment method to continue your service after the trial.
              </div>
            </div>
          </div>
        </Alert>
      )}

      {billingInfo?.status === 'inactive' && (
        <Alert color="warning">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">Subscription Inactive</div>
              <div className="text-sm">
                Your subscription is not active. Please add a payment method to activate your subscription.
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* Current Plan */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-soft">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <StarIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-heading dark:text-white">Current Plan</h2>
                  <p className="text-sm text-text-main dark:text-white">Your active subscription</p>
                </div>
              </div>
              <Button
                color="primary"
                size="sm"
                onClick={() => setShowPlanModal(true)}
              >
                Change Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold text-text-heading dark:text-white">{currentPlan?.name}</h3>
                  {currentPlan?.popular && (
                    <Badge color="primary" size="sm">Popular</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {formatPrice(currentPlan?.price)}/month
                </div>
                <div className="text-sm text-text-main dark:text-white">
                  {currentPlan?.features?.length} features included
                </div>
                
                {isTrialActive && (
                  <div className="mt-3 bg-blue-50 p-2 rounded-md text-xs text-blue-700">
                    Free trial until {new Date(billingInfo.trialEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Next Billing */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-text-heading dark:text-white">Next Billing</h3>
                </div>
                <div className="text-lg font-bold text-text-heading dark:text-white mb-1">
                  {isTrialActive 
                    ? new Date(billingInfo.trialEndDate).toLocaleDateString('sv-SE')
                    : new Date(billingInfo?.nextBillingDate).toLocaleDateString('sv-SE')}
                </div>
                <div className="text-sm text-text-main dark:text-white">
                  {billingInfo?.status === 'active' ? 'Auto-renewal active' : 'No active subscription'}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCardIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-text-heading dark:text-white">Payment Method</h3>
                </div>
                {billingInfo?.paymentMethod?.last4 !== '****' ? (
                  <>
                    <div className="text-lg font-bold text-text-heading dark:text-white mb-1">
                      •••• {billingInfo?.paymentMethod?.last4}
                    </div>
                    <div className="text-sm text-text-main dark:text-white capitalize">
                      {billingInfo?.paymentMethod?.brand} ending {billingInfo?.paymentMethod?.expMonth}/{billingInfo?.paymentMethod?.expYear}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-bold text-text-heading dark:text-white mb-1">
                      No payment method
                    </div>
                    <Button size="xs" color="light" onClick={handleManageBilling}>
                      Add payment method
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Plan Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-text-heading dark:text-white mb-3">Your Plan Includes:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlan?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 flex-shrink-0" />
                    <span className="text-sm text-text-main dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Billing Status */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-soft">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-success-100 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading dark:text-white">Account Status</h2>
                <p className="text-sm text-text-main dark:text-white">Your subscription is active</p>
              </div>
            </div>

            <Alert color="success">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Account Active</span>
              </div>
              <div className="mt-2 text-sm">
                Your subscription is active and all features are available. 
                Your next payment of {formatPrice(currentPlan?.price)} will be processed on{' '}
                {new Date(billingInfo?.nextBillingDate).toLocaleDateString('sv-SE')}.
              </div>
            </Alert>
          </div>
        </Card>
      </div>

      {/* Invoice History */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-soft">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-secondary-100 rounded-xl">
                <BanknotesIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading dark:text-white">Invoice History</h2>
                <p className="text-sm text-text-main dark:text-white">Download your past invoices</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-gray-100"><tr>
                  <th className="px-4 py-3 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-2">
                        {new Date(invoice.date).toLocaleDateString('sv-SE')}
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {formatPrice(invoice.amount)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge color={invoice.status === 'paid' ? 'success' : 'warning'}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          color="gray"
                          size="xs"
                          onClick={() => toast.success('Downloading invoice...')}
                          className="flex items-center space-x-1"
                        >
                          <DocumentArrowDownIcon className="h-3 w-3" />
                          <span>Download</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Change Modal */}
      <Modal show={showPlanModal} onClose={() => setShowPlanModal(false)} size="4xl">
        <Modal.Header>Choose Your Plan</Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-200 ${
                  plan.id === currentPlan?.id
                    ? 'border-2 border-primary-500 bg-primary-50'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  {plan.popular && (
                    <Badge color="primary" className="mb-4">Most Popular</Badge>
                  )}
                  
                  <h3 className="text-lg font-bold text-text-heading dark:text-white mb-2">{plan.name}</h3>
                  <div className="text-2xl font-bold text-primary-600 mb-4">
                    {formatPrice(plan.price)}/month
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-success-500" />
                        <span className="text-sm text-text-main dark:text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    color={plan.id === currentPlan?.id ? 'gray' : 'primary'}
                    className="w-full"
                    disabled={plan.id === currentPlan?.id || changingPlan !== null}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {changingPlan === plan.id ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Changing...
                      </>
                    ) : plan.id === currentPlan?.id ? (
                      'Current Plan'
                    ) : (
                      `Switch to ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
} 