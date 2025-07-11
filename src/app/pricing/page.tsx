import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/auth';

export default async function PricingPage() {
  const user = await currentUser();
  const currentRole = user ? await getUserRole() : 'free';

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 AI messages per day',
        'Basic game analytics',
        'Moneyline & Over/Under insights',
        'Community support'
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      features: [
        'Unlimited AI messages',
        'Advanced statistical models',
        'F5 & YRFI/NRFI analysis',
        'Live odds tracking',
        'Email support'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'VIP',
      price: '$99',
      period: 'month',
      features: [
        'Everything in Pro',
        'Player props analysis',
        'Custom model parameters',
        'Priority support',
        'Early access to features'
      ],
      cta: 'Upgrade to VIP',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚾</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">MLB Sharp Edge</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            ) : (
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered MLB betting analytics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-sm border-2 p-8 ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {plan.price}
                  {plan.price !== '$0' && <span className="text-lg text-gray-600">/{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : currentRole === plan.name.toLowerCase()
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                disabled={currentRole === plan.name.toLowerCase()}
              >
                {currentRole === plan.name.toLowerCase() ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What makes your predictions different?
              </h3>
              <p className="text-gray-600">
                Our models analyze over 50+ statistical features including advanced metrics like 
                FIP, wOBA, and defensive efficiency. We focus on the most predictive features 
                for each betting market based on correlation analysis and machine learning.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How often is the data updated?
              </h3>
              <p className="text-gray-600">
                Game statistics are updated in real-time during games, and odds are refreshed 
                every 5 minutes. Our models recalibrate daily to incorporate the latest performance data.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have 
                access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
