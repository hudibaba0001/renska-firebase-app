import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { 
  Card, 
  Button, 
  Badge, 
  Alert, 
  Table,
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

  // Mock data loading
  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock current plan (in real app, this would come from Firestore)
      const mockPlan = STRIPE_CONFIG.plans.standard
      setCurrentPlan(mockPlan)
      
      // Mock billing info
      setBillingInfo({
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025
        },
        status: 'active'
      })
      
      // Mock invoice history
      setInvoices([
        {
          id: 'inv_001',
          date: '2024-01-01',
          amount: 199,
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_002',
          date: '2023-12-01',
          amount: 199,
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_003',
          date: '2023-11-01',
          amount: 199,
          status: 'paid',
          downloadUrl: '#'
        }
      ])
      
      setLoading(false)
    }

    loadBillingData()
  }, [companyId])

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
              </div>

              {/* Next Billing */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-text-heading dark:text-white">Next Billing</h3>
                </div>
                <div className="text-lg font-bold text-text-heading dark:text-white mb-1">
                  {new Date(billingInfo?.nextBillingDate).toLocaleDateString('sv-SE')}
                </div>
                <div className="text-sm text-text-main dark:text-white">
                  Auto-renewal active
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCardIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-text-heading dark:text-white">Payment Method</h3>
                </div>
                <div className="text-lg font-bold text-text-heading dark:text-white mb-1">
                  •••• {billingInfo?.paymentMethod?.last4}
                </div>
                <div className="text-sm text-text-main dark:text-white capitalize">
                  {billingInfo?.paymentMethod?.brand} ending {billingInfo?.paymentMethod?.expMonth}/{billingInfo?.paymentMethod?.expYear}
                </div>
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
              <Table>
                <Table.Head>
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Amount</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {invoices.map((invoice) => (
                    <Table.Row key={invoice.id}>
                      <Table.Cell>
                        {new Date(invoice.date).toLocaleDateString('sv-SE')}
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {formatPrice(invoice.amount)}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={invoice.status === 'paid' ? 'success' : 'warning'}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          color="gray"
                          size="xs"
                          onClick={() => toast.success('Downloading invoice...')}
                          className="flex items-center space-x-1"
                        >
                          <DocumentArrowDownIcon className="h-3 w-3" />
                          <span>Download</span>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
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