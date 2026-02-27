'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Check, Sparkles, Zap, ArrowRight, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

type PlanType = 'basic' | 'pro';

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState<PlanType | null>(null);

  const handleSubscribe = async (planType: PlanType) => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }

    setIsLoading(planType);

    try {
      // Create subscription via API
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      const planNames = {
        basic: 'Basic Plan - ₹900/month',
        pro: 'Pro Plan - ₹2000/month',
      };

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'ProjectFlow AI',
        description: planNames[planType],
        image: '/logo.png',
        handler: function (response: any) {
          // Payment successful
          router.push('/payment/success?subscription_id=' + data.subscriptionId);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
        },
        theme: {
          color: '#9333EA', // Purple
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        router.push('/payment/cancelled');
      });
      razorpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ProjectFlow AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Get unlimited access to all features. Only AI generation is limited by plan.
          </p>
          <p className="text-sm text-gray-500">
            ✅ Cancel anytime • Secure payment with Razorpay
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
              <div className="mb-2">
                <h3 className="text-2xl font-bold">Basic Plan</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">₹900</span>
                <span className="text-xl opacity-90">/month</span>
              </div>
              <p className="mt-2 opacity-90">Perfect for getting started</p>
            </div>

            {/* Features */}
            <div className="px-8 py-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">5 AI Generations per Month</p>
                    <p className="text-sm text-gray-600">Combined for both Gantt charts and RACI matrices</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Manual Editing</p>
                    <p className="text-sm text-gray-600">Create and edit projects without any limits</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Code Imports</p>
                    <p className="text-sm text-gray-600">Import from JSON without restrictions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Projects</p>
                    <p className="text-sm text-gray-600">Create as many projects as you need</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Auto-Save & Cloud Storage</p>
                    <p className="text-sm text-gray-600">Automatic cloud backup for all projects</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Export to PNG/JSON</p>
                    <p className="text-sm text-gray-600">Download charts for presentations</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe('basic')}
                disabled={isLoading !== null}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading === 'basic' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Cancel anytime • Secure payment
              </p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden relative">
            {/* Popular Badge */}
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-4 h-4" />
                Most Popular
              </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6">
              <div className="mb-2">
                <h3 className="text-2xl font-bold">Pro Plan</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">₹2000</span>
                <span className="text-xl opacity-90">/month</span>
              </div>
              <p className="mt-2 opacity-90">Best value for power users</p>
            </div>

            {/* Features */}
            <div className="px-8 py-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">12 AI Generations per Month</p>
                    <p className="text-sm text-gray-600">Combined for both Gantt charts and RACI matrices</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Manual Editing</p>
                    <p className="text-sm text-gray-600">Create and edit projects without any limits</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Code Imports</p>
                    <p className="text-sm text-gray-600">Import from JSON without restrictions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unlimited Projects</p>
                    <p className="text-sm text-gray-600">Create as many projects as you need</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Auto-Save & Cloud Storage</p>
                    <p className="text-sm text-gray-600">Automatic cloud backup for all projects</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Priority Support</p>
                    <p className="text-sm text-gray-600">Get help faster via email</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading !== null}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading === 'pro' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Cancel anytime • Secure payment
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What's the difference between Basic and Pro?</h3>
              <p className="text-gray-600">
                Both plans give you unlimited access to all features (manual editing, code imports, projects). The only difference is AI generations per month: Basic gets 5, Pro gets 12. Choose based on how often you need AI assistance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What happens when I reach my AI limit?</h3>
              <p className="text-gray-600">
                You can still use unlimited manual editing and code imports. AI generations reset on the 1st of each month. You can also upgrade to Pro anytime for more AI credits.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I switch plans later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade from Basic to Pro or downgrade from Pro to Basic anytime from your dashboard. Changes take effect on your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! Cancel anytime from your dashboard. You'll continue to have access until the end of your billing period. No questions asked.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level encryption, regular backups, and secure cloud storage. Your projects are safe with us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
