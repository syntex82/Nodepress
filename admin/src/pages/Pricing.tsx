import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { FaBolt, FaBuilding } from 'react-icons/fa';

// Stripe Pricing Table Configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RjyaDFzzHwoqssW7e8C8sFpNTIOMuZ8gDf783cQdgOAfTeHna4Bqt4qHL6vsH3SjTZ9xtAMR6o5KlFmihtOkOiJ00VkqHy520';
const PRICING_TABLES = {
  pro: {
    monthly: 'prctbl_1SlFs9FzzHwoqssW6FnSSRPp',
    yearly: 'prctbl_1SlFwxFzzHwoqssWGVxPpjJY',
  },
  business: {
    monthly: 'prctbl_1SlFv0FzzHwoqssWOMKoUr4r',
    yearly: 'prctbl_1SlFvzFzzHwoqssWaFG9da7G',
  },
};

// Stripe Pricing Table Component
function StripePricingTable({ pricingTableId }: { pricingTableId: string }) {
  useEffect(() => {
    if (!document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<stripe-pricing-table pricing-table-id="${pricingTableId}" publishable-key="${STRIPE_PUBLISHABLE_KEY}"></stripe-pricing-table>`,
      }}
    />
  );
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>('pro');
  const { isAuthenticated } = useAuthStore();

  // Get current pricing table ID
  const currentPricingTableId = PRICING_TABLES[selectedPlan]?.[billingCycle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Link */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Plan Selection Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg inline-flex">
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPlan === 'pro'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <FaBolt className="h-4 w-4" />
              Pro - £29/mo
            </button>
            <button
              onClick={() => setSelectedPlan('business')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPlan === 'business'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <FaBuilding className="h-4 w-4" />
              Business - £99/mo
            </button>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Not logged in warning */}
        {!isAuthenticated && (
          <div className="max-w-2xl mx-auto mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Please <a href="/admin/login" className="underline font-semibold">log in</a> or{' '}
              <a href="/admin/register" className="underline font-semibold">register</a> first,
              then return here to subscribe.
            </p>
          </div>
        )}

        {/* Stripe Pricing Table */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {selectedPlan} Plan - {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {selectedPlan === 'pro'
                ? 'Perfect for creators and small teams'
                : 'Best for growing businesses and agencies'}
            </p>
          </div>

          {currentPricingTableId && (
            <StripePricingTable key={currentPricingTableId} pricingTableId={currentPricingTableId} />
          )}
        </div>


      </div>
    </div>
  );
}
