import React, { useState, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/init'
import { 
  Card, 
  Button, 
  Spinner, 
  Alert 
} from 'flowbite-react'
import { 
  ExclamationTriangleIcon,
  CreditCardIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { STRIPE_CONFIG } from '../stripe/config'

export default function RequireSubscription({ children, feature = null }) {
  const { companyId } = useParams()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkSubscription() {
      if (!companyId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const companyRef = doc(db, 'companies', companyId)
        const companySnap = await getDoc(companyRef)

        if (companySnap.exists()) {
          const companyData = companySnap.data()
          
          // Check subscription status
          const subscriptionData = {
            active: companyData.subscription?.active || false,
            plan: companyData.subscription?.plan || 'basic',
            trialEndsAt: companyData.subscription?.trialEndsAt,
            status: companyData.subscription?.status || 'inactive'
          }

          // For demo purposes, let's assume companies have active subscriptions
          // In production, this would check actual Stripe subscription status
          if (!subscriptionData.active) {
            subscriptionData.active = true
            subscriptionData.plan = 'standard'
            subscriptionData.status = 'active'
          }

          setSubscription(subscriptionData)
        } else {
          setError('Company not found')
        }
      } catch (err) {
        console.error('Subscription check error:', err)
        setError('Failed to check subscription status')
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [companyId])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96 text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Subscription</h3>
          <p className="text-gray-500">Please wait while we verify your access...</p>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <Alert color="failure" className="mb-4">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="font-medium">Error:</span> {error}
          </Alert>
          <Button as="a" href="/pricing" color="primary" className="w-full">
            View Pricing Plans
          </Button>
        </Card>
      </div>
    )
  }

  // Check if subscription is active
  if (!subscription?.active || subscription?.status !== 'active') {
    return <SubscriptionRequired companyId={companyId} />
  }

  // Check feature limits for specific features
  if (feature && !hasFeatureAccess(subscription, feature)) {
    return <FeatureUpgradeRequired companyId={companyId} feature={feature} currentPlan={subscription.plan} />
  }

  // Subscription is active, render children
  return children
}

// Helper function to check feature access
function hasFeatureAccess(subscription, feature) {
  const plan = STRIPE_CONFIG.plans[subscription.plan]
  if (!plan) return false

  switch (feature) {
    case 'multiple_forms':
      return plan.limits.forms > 1 || plan.limits.forms === 'unlimited'
    case 'custom_branding':
      return plan.limits.customization === 'advanced' || plan.limits.customization === 'full'
    case 'analytics':
      return subscription.plan === 'standard' || subscription.plan === 'premium'
    case 'api_access':
      return subscription.plan === 'premium'
    default:
      return true
  }
}

// Component for when subscription is required
function SubscriptionRequired({ companyId }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-warning-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CreditCardIcon className="h-8 w-8 text-warning-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Subscription Required
            </h1>
            
            <p className="text-gray-600 mb-6">
              You need an active subscription to access this feature. 
              Choose a plan that fits your needs and start building amazing booking forms.
            </p>

            <div className="space-y-3">
              <Button 
                as="a" 
                href="/pricing" 
                color="primary" 
                size="lg" 
                className="w-full"
              >
                View Pricing Plans
              </Button>
              
              <Button 
                as="a" 
                href={`/admin/${companyId}/billing`} 
                color="gray" 
                className="w-full"
              >
                Manage Billing
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Already have a subscription?{' '}
                <a href={`/admin/${companyId}/billing`} className="text-primary-600 hover:text-primary-700">
                  Check your billing status
                </a>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

// Component for when feature upgrade is required
function FeatureUpgradeRequired({ companyId, feature, currentPlan }) {
  const requiredPlan = getRequiredPlanForFeature(feature)
  const requiredPlanConfig = STRIPE_CONFIG.plans[requiredPlan]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <div className="p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-primary-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Upgrade Required
            </h1>
            
            <p className="text-gray-600 mb-2">
              This feature requires the <strong>{requiredPlanConfig?.name}</strong> plan or higher.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              You're currently on the <strong>{STRIPE_CONFIG.plans[currentPlan]?.name}</strong> plan.
            </p>

            <div className="space-y-3">
              <Button 
                as="a" 
                href={`/admin/${companyId}/billing`} 
                color="primary" 
                size="lg" 
                className="w-full"
              >
                Upgrade Plan
              </Button>
              
              <Button 
                as="a" 
                href="/pricing" 
                color="gray" 
                className="w-full"
              >
                View All Plans
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

// Helper function to determine required plan for feature
function getRequiredPlanForFeature(feature) {
  switch (feature) {
    case 'multiple_forms':
    case 'custom_branding':
    case 'analytics':
      return 'standard'
    case 'api_access':
      return 'premium'
    default:
      return 'basic'
  }
} 