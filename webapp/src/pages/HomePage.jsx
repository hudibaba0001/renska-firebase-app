import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const features = [
    {
      icon: '🛠️',
      title: 'Visual Form Builder',
      description: 'Drag-and-drop interface to create custom booking calculators without any code'
    },
    {
      icon: '💰',
      title: 'Advanced Pricing Models',
      description: 'Tiered, flat-rate, hourly, per-room, and custom pricing configurations'
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'All calculators work perfectly on desktop, tablet, and mobile devices'
    },
    {
      icon: '🔗',
      title: 'Easy Integration',
      description: 'Embed with iframe, NPM widget, or direct links - works with any website'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track form views, conversions, and booking performance'
    },
    {
      icon: '🇸🇪',
      title: 'Swedish RUT/ROT',
      description: 'Built-in support for Swedish tax deduction systems'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '99',
      period: '/month',
      description: 'Perfect for small cleaning businesses',
      features: [
        'Up to 3 custom calculators',
        'Basic analytics',
        'Email support',
        'RUT/ROT integration'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '299',
      period: '/month',
      description: 'For growing cleaning companies',
      features: [
        'Unlimited calculators',
        'Advanced analytics',
        'Priority support',
        'White-label options',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large enterprises and chains',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'Custom branding'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Create Professional
              <span className="block text-blue-200">Booking Calculators</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The no-code platform that lets cleaning companies build custom pricing calculators 
              and booking forms in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admin/demo-company"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
              >
                🚀 Try Live Demo
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for the cleaning industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the power of our form builder with a live demo
            </p>
            <Link
              to="/admin/demo-company"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              <span className="mr-2">🎯</span>
              Launch Interactive Demo
            </Link>
          </div>
          
          <div className="bg-gray-100 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="mt-8">
              <img 
                src="/api/placeholder/800/500" 
                alt="SwedPrime Dashboard Preview" 
                className="w-full rounded-lg shadow-lg"
                style={{backgroundColor: '#f0f8ff', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#666'}}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-500 bg-blue-50 rounded-lg m-8 mt-16">
                📊 Interactive Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-sm border-2 p-8 relative ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of cleaning companies already using SwedPrime to automate their booking process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/admin/demo-company"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Try Demo First
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SwedPrime</h3>
              <p className="text-gray-400">
                The professional booking calculator platform for cleaning companies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/admin/demo-company" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/api" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SwedPrime. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 