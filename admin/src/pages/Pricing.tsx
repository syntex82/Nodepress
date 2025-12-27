import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getPlans, createCheckout, SubscriptionPlan } from '../services/subscriptionApi';
import { showToast } from '../utils/toast';
import { FaCheck, FaStar, FaBolt, FaBuilding, FaCrown } from 'react-icons/fa';

const PLAN_ICONS: Record<string, JSX.Element> = {
  free: <FaStar className="h-8 w-8" />,
  pro: <FaBolt className="h-8 w-8" />,
  business: <FaBuilding className="h-8 w-8" />,
  enterprise: <FaCrown className="h-8 w-8" />,
};

const FEATURE_LABELS: Record<string, string> = {
  basic_cms: 'Content Management',
  media_library: 'Media Library',
  video_calls: 'Video Calls',
  lms: 'Learning Management',
  ecommerce: 'E-Commerce',
  analytics: 'Advanced Analytics',
  api_access: 'API Access',
  priority_support: 'Priority Support',
  custom_domain: 'Custom Domain',
  sla: 'SLA Agreement',
  dedicated_support: 'Dedicated Support',
  custom_integrations: 'Custom Integrations',
};

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      showToast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      navigate(`/admin/register?plan=${plan.slug}&billing=${billingCycle}`);
      return;
    }

    if (plan.monthlyPrice === 0) {
      showToast.success('You are on the Free plan!');
      return;
    }

    setCheckoutLoading(plan.id);
    try {
      const { url } = await createCheckout(plan.id, billingCycle);
      if (url) window.location.href = url;
    } catch {
      showToast.error('Failed to create checkout session');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatLimit = (limit: number | null, unit = '') => {
    if (limit === null) return 'Unlimited';
    return `${limit.toLocaleString()}${unit}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow'
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  plan.isFeatured ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.badgeText && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badgeText}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.isFeatured ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {PLAN_ICONS[plan.slug] || <FaStar className="h-8 w-8" />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 h-12">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(monthlyEquivalent)}
                      </span>
                      <span className="text-gray-500 mb-1">/month</span>
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-sm text-gray-500 mt-1">Billed {formatPrice(price)} yearly</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={checkoutLoading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      plan.isFeatured
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {checkoutLoading === plan.id ? 'Loading...' : plan.monthlyPrice === 0 ? 'Get Started Free' : 'Get Started'}
                  </button>

                  {/* Limits */}
                  <div className="mt-8 space-y-3 border-t dark:border-gray-700 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Users</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatLimit(plan.maxUsers)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Storage</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.maxStorageMb === null ? 'Unlimited' : plan.maxStorageMb >= 1024 ? `${plan.maxStorageMb / 1024} GB` : `${plan.maxStorageMb} MB`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Courses</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatLimit(plan.maxCourses)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Products</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatLimit(plan.maxProducts)}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 space-y-3">
                    {(plan.features as string[]).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <FaCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {FEATURE_LABELS[feature] || feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Contact us for enterprise pricing with custom limits, SLA, and dedicated support.
          </p>
          <a
            href="mailto:sales@example.com"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
