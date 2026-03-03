'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function DebugPaymentPage() {
  const { isSignedIn, user } = useUser();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRazorpayConfig = () => {
    const config = {
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      razorpayScriptLoaded: typeof (window as any).Razorpay !== 'undefined',
      isSignedIn,
      userEmail: user?.emailAddresses[0]?.emailAddress,
      userName: user?.fullName,
    };
    setResult(config);
  };

  const testCreateSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'basic' }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment Debug Tool</h1>

        <div className="space-y-4">
          <button
            onClick={testRazorpayConfig}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Test Razorpay Config
          </button>

          <button
            onClick={testCreateSubscription}
            disabled={loading || !isSignedIn}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 ml-4"
          >
            {loading ? 'Testing...' : 'Test Create Subscription API'}
          </button>

          {!isSignedIn && (
            <p className="text-red-600">You need to sign in to test subscription creation</p>
          )}
        </div>

        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Common Issues:</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Razorpay Script Not Loaded:</strong> Make sure the Razorpay checkout script
              is loaded on the page
            </li>
            <li>
              <strong>Test vs Live Mode:</strong> Check if you're using test keys (rzp_test_) or
              live keys (rzp_live_)
            </li>
            <li>
              <strong>Plan IDs:</strong> Verify RAZORPAY_BASIC_PLAN_ID and RAZORPAY_PRO_PLAN_ID
              are correct
            </li>
            <li>
              <strong>Customer Verification:</strong> Make sure customers are created properly in
              Razorpay
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
