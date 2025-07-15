import { loadStripe } from '@stripe/stripe-js'
import { logger } from '../utils/logger'

// Stripe configuration
export const STRIPE_CONFIG = {
  // Secure configuration - no hardcoded fallbacks
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // Pricing plans configuration
  plans: {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 99,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || 'price_basic_test',
      features: [
        '1 Booking Form',
        'Basic Pricing Calculator',
        'Email Notifications',
        'Up to 50 bookings/month',
        'Standard Support'
      ],
      limits: {
        forms: 1,
        bookings: 50,
        customization: 'basic'
      }
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      price: 199,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_STANDARD_PRICE_ID || 'price_standard_test',
      features: [
        '3 Booking Forms',
        'Advanced Pricing Models',
        'Custom Branding',
        'Up to 200 bookings/month',
        'Priority Support',
        'Analytics Dashboard'
      ],
      limits: {
        forms: 3,
        bookings: 200,
        customization: 'advanced'
      },
      popular: true
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 399,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_test',
      features: [
        'Unlimited Booking Forms',
        'Custom Pricing Logic',
        'White-label Solution',
        'Unlimited bookings',
        'Dedicated Support',
        'Advanced Analytics',
        'API Access',
        'Custom Integrations'
      ],
      limits: {
        forms: 'unlimited',
        bookings: 'unlimited',
        customization: 'full'
      }
    }
  }
}

// Initialize Stripe
let stripePromise
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)
  }
  return stripePromise
}

// Utility functions
export const formatPrice = (price, currency = 'SEK') => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export const getPlanByPriceId = (priceId) => {
  return Object.values(STRIPE_CONFIG.plans).find(plan => plan.priceId === priceId)
}

export const createCheckoutSession = async (planId, companyId, userEmail) => {
  const plan = STRIPE_CONFIG.plans[planId]
  if (!plan) {
    throw new Error('Invalid plan selected')
  }

  // const stripe = await getStripe()
  
  // In a real implementation, this would call your backend API
  // For now, we'll create a mock session
  const checkoutSession = {
    lineItems: [{
      price: plan.priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/admin/${companyId}/billing?success=true`,
    cancelUrl: `${window.location.origin}/pricing`,
    metadata: {
      companyId,
      planId,
    },
    customerEmail: userEmail,
    allowPromotionCodes: true,
  }

  logger.debug('Stripe', 'Checkout session created successfully')
  
  // Note: In production, you would send this to your backend
  // and get a session ID from Stripe, then redirect like this:
  // const { error } = await stripe.redirectToCheckout({ sessionId })
  
  return checkoutSession
} 