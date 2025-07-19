import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Button, 
  Badge, 
  Alert,
  Spinner 
} from 'flowbite-react'
import { 
  CheckIcon, 
  XMarkIcon, 
  StarIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { STRIPE_CONFIG, formatPrice } from '../stripe/config'

export default function PricingPage() {
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)

  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId)
    
    try {
      // Redirect to signup page with the selected plan
      navigate(`/signup?plan=${planId}`);
      
      // Note: The following code is for when a user is already logged in and selecting a plan
      // In a real app, you'd get the company ID and user email from auth context
      /*
      const mockCompanyId = 'demo-company'
      const mockUserEmail = 'admin@demo-company.com'
      
      const checkoutSession = await createCheckoutSession(planId, mockCompanyId, mockUserEmail)
      // eslint-disable-next-line no-unused-vars
      
      // For demo purposes, we'll simulate a successful checkout
      toast.success(`Selected ${STRIPE_CONFIG.plans[planId].name} plan!`)
      
      // In production, this would redirect to Stripe Checkout:
      // window.location.href = checkoutSession.url
      
      // For now, redirect to a demo success page
      setTimeout(() => {
        navigate(`/admin/${mockCompanyId}/billing?success=true&plan=${planId}`)
      }, 1500)
      */
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout process')
      setLoadingPlan(null)
    }
  }

  const plans = Object.values(STRIPE_CONFIG.plans)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-text-heading dark:text-white">SwedPrime</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-text-main hover:text-text-heading dark:text-white">Sign In</Link>
              <Button as={Link} to="/signup" color="primary" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Removed motion.div for hero text */}
          <h1 className="text-4xl lg:text-6xl font-bold text-text-heading dark:text-white mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Plan</span>
            </h1>
            <p className="text-xl text-text-main dark:text-white mb-8 max-w-2xl mx-auto">
              Transform your cleaning business with our powerful booking calculator. 
              Start your free trial today and see the difference!
            </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`h-full shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'border-2 border-primary-500 scale-105' : 'hover:scale-105'
                }`}
              >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge color="primary" className="px-4 py-2 flex items-center space-x-1">
                        <StarIcon className="h-4 w-4" />
                        <span>Most Popular</span>
                      </Badge>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className="mb-4">
                        {plan.id === 'starter' && (
                          <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto flex items-center justify-center">
                          <RocketLaunchIcon className="h-8 w-8 text-text-heading" />
                          </div>
                        )}
                        {plan.id === 'vaxt' && (
                          <div className="w-16 h-16 bg-purple-100 rounded-xl mx-auto flex items-center justify-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-text-heading" />
                          </div>
                        )}
                        {plan.id === 'enterprise' && (
                          <div className="w-16 h-16 bg-yellow-100 rounded-xl mx-auto flex items-center justify-center">
                          <SparklesIcon className="h-8 w-8 text-text-heading" />
                          </div>
                        )}
                      </div>
                      
                    <h3 className="text-2xl font-bold text-text-heading dark:text-white mb-2">{plan.name}</h3>
                      
                      <div className="mb-4">
                      <span className="text-4xl font-bold text-text-heading dark:text-white">
                        {formatPrice(STRIPE_CONFIG.plans[plan.id].price)}
                        </span>
                      <span className="text-text-subtle dark:text-white">
                        /month
                        </span>
                      </div>

                    {/* Removed: selectedInterval === 'year' && (
                        <Badge color="success" size="sm">
                          Save {formatPrice(plan.price * 12 * 0.2)} per year
                        </Badge>
                    ) */}
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <CheckIcon className="h-5 w-5 text-success-500" />
                          </div>
                        <span className="text-text-main dark:text-white">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      color={plan.popular ? 'primary' : 'gray'}
                      size="lg"
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.id === 'basic' ? 'Start Free Trial' : 'Get Started'}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Removed motion.div for feature comparison title */}
            <Card className="shadow-soft">
              <div className="p-8">
              <h2 className="text-3xl font-bold text-text-heading dark:text-white text-center mb-8">
                  Compare All Features
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 pr-4">Features</th>
                        {plans.map(plan => (
                          <th key={plan.id} className="text-center py-4 px-4">
                          <div className="font-bold text-text-heading dark:text-white">{plan.name}</div>
                          <div className="text-sm text-text-subtle dark:text-white">
                              {formatPrice(plan.price)}/month
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium">Booking Forms</td>
                        <td className="text-center py-4 px-4">1</td>
                        <td className="text-center py-4 px-4">3</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium">Monthly Bookings</td>
                        <td className="text-center py-4 px-4">50</td>
                        <td className="text-center py-4 px-4">200</td>
                        <td className="text-center py-4 px-4">Unlimited</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium">Custom Branding</td>
                        <td className="text-center py-4 px-4">
                        <XMarkIcon className="h-5 w-5 text-text-subtle mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <CheckIcon className="h-5 w-5 text-success-500 mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <CheckIcon className="h-5 w-5 text-success-500 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium">Analytics Dashboard</td>
                        <td className="text-center py-4 px-4">
                        <XMarkIcon className="h-5 w-5 text-text-subtle mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <CheckIcon className="h-5 w-5 text-success-500 mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <CheckIcon className="h-5 w-5 text-success-500 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 pr-4 font-medium">API Access</td>
                        <td className="text-center py-4 px-4">
                        <XMarkIcon className="h-5 w-5 text-text-subtle mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                        <XMarkIcon className="h-5 w-5 text-text-subtle mx-auto" />
                        </td>
                        <td className="text-center py-4 px-4">
                          <CheckIcon className="h-5 w-5 text-success-500 mx-auto" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Removed motion.div for FAQ title */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="font-bold text-text-heading dark:text-white mb-2">Can I change my plan anytime?</h3>
                <p className="text-text-main dark:text-white">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and you'll be charged or credited accordingly.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="font-bold text-text-heading dark:text-white mb-2">Is there a free trial?</h3>
                <p className="text-text-main dark:text-white">
                  We offer a 14-day free trial for all plans. No credit card required to start your trial.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="font-bold text-text-heading dark:text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-text-main dark:text-white">
                  We accept all major credit cards, including Visa, Mastercard, and American Express. 
                  All payments are processed securely through Stripe.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-text-subtle dark:text-white">
              © 2024 SwedPrime. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 