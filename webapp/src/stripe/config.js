import { loadStripe } from '@stripe/stripe-js'

// Stripe configuration
export const STRIPE_CONFIG = {
  // Secure configuration - no hardcoded fallbacks
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // Pricing plans configuration
  plans: {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 349,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
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
    vaxt: {
      id: 'vaxt',
      name: 'Våxt',
      price: 799,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_VAXT_PRICE_ID,
      features: [
        '3 Booking Forms',
        'Advanced Pricing Calculator',
        'SMS & Email Notifications',
        'Up to 200 bookings/month',
        'Priority Support',
        'Custom Branding',
        'Analytics Dashboard'
      ],
      limits: {
        forms: 3,
        bookings: 200,
        customization: 'advanced'
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2000,
      currency: 'SEK',
      interval: 'month',
      priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
      features: [
        'Unlimited Booking Forms',
        'Custom Pricing Calculator',
        'Advanced Notifications',
        'Unlimited bookings',
        'Dedicated Support',
        'Custom Integrations',
        'Advanced Analytics',
        'API Access'
      ],
      limits: {
        forms: -1, // unlimited
        bookings: -1, // unlimited
        customization: 'full'
      }
    }
  }
}

// Format price with currency
export function formatPrice(price, currency = 'SEK') {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
}

// Initialize Stripe
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

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

  console.log('🔧 Checkout session created:', checkoutSession)
  
  // Note: In production, you would send this to your backend
  // and get a session ID from Stripe, then redirect like this:
  // const { error } = await stripe.redirectToCheckout({ sessionId })
  
  return checkoutSession
} 