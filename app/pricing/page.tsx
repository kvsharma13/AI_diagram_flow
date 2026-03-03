'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Check, Sparkles, ArrowRight, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
          router.push('/payment/success?subscription_id=' + data.subscriptionId);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
        },
        theme: {
          color: '#9333EA',
        },
      };

      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay script not loaded. Please refresh the page.');
      }

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        router.push('/payment/cancelled');
      });
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start subscription';
      alert(errorMessage);
    } finally {
      setIsLoading(null);
    }
  };

  const features = {
    basic: [
      { name: '5 AI Generations per Month', description: 'Combined for both Gantt charts and RACI matrices' },
      { name: 'Unlimited Manual Editing', description: 'Create and edit projects without any limits' },
      { name: 'Unlimited Code Imports', description: 'Import from JSON without restrictions' },
      { name: 'Unlimited Projects', description: 'Create as many projects as you need' },
      { name: 'Auto-Save & Cloud Storage', description: 'Automatic cloud backup for all projects' },
      { name: 'Export to PNG/JSON', description: 'Download charts for presentations' },
    ],
    pro: [
      { name: '12 AI Generations per Month', description: 'Combined for both Gantt charts and RACI matrices' },
      { name: 'Unlimited Manual Editing', description: 'Create and edit projects without any limits' },
      { name: 'Unlimited Code Imports', description: 'Import from JSON without restrictions' },
      { name: 'Unlimited Projects', description: 'Create as many projects as you need' },
      { name: 'Auto-Save & Cloud Storage', description: 'Automatic cloud backup for all projects' },
      { name: 'Priority Support', description: 'Get help faster via email' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="default" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to all features. Only AI generation is limited by plan.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <Card className="relative overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardHeader className="pb-8">
              <CardTitle className="text-gray-900">Basic Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">₹900</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {features.basic.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{feature.name}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                onClick={() => handleSubscribe('basic')}
                disabled={isLoading !== null}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
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
              </Button>
              <p className="text-center text-sm text-gray-500">
                Cancel anytime • Secure payment
              </p>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative overflow-hidden transition-all hover:scale-105 border-4 border-purple-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
            <div className="absolute top-6 right-6">
              <Badge variant="default" className="shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-8">
              <CardTitle className="text-gray-900">Pro Plan</CardTitle>
              <CardDescription>Best value for power users</CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">₹2000</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {features.pro.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{feature.name}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading !== null}
                className="w-full"
                size="lg"
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
              </Button>
              <p className="text-center text-sm text-gray-500">
                Cancel anytime • Secure payment
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What's the difference between Basic and Pro?",
                a: "Both plans give you unlimited access to all features (manual editing, code imports, projects). The only difference is AI generations per month: Basic gets 5, Pro gets 12. Choose based on how often you need AI assistance."
              },
              {
                q: "What happens when I reach my AI limit?",
                a: "You can still use unlimited manual editing and code imports. AI generations reset on the 1st of each month. You can also upgrade to Pro anytime for more AI credits."
              },
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade from Basic to Pro or downgrade from Pro to Basic anytime from your dashboard. Changes take effect on your next billing cycle."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes! Cancel anytime from your dashboard. You'll continue to have access until the end of your billing period. No questions asked."
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use bank-level encryption, regular backups, and secure cloud storage. Your projects are safe with us."
              }
            ].map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Razorpay script loaded')}
      />
    </div>
  );
}
