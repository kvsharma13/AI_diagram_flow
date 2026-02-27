'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isActivating, setIsActivating] = useState(true);

  useEffect(() => {
    const activateSubscription = async () => {
      const subscriptionId = searchParams.get('subscription_id');

      if (subscriptionId) {
        try {
          // Activate the subscription
          await fetch('/api/activate-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriptionId }),
          });
        } catch (error) {
          console.error('Failed to activate subscription:', error);
        }
      }

      setIsActivating(false);
    };

    activateSubscription();

    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Welcome to ProjectFlow AI Pro! Your subscription is now active.
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">What's Next?</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Create your first project</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Try AI-powered chart generation (10/month)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Explore templates and export options</span>
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl mb-4"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-sm text-gray-500">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
