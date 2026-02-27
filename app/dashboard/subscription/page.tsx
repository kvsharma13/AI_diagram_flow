'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard, Calendar, Zap, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useUser();
  const [aiUsage, setAiUsage] = useState<any>(null);

  useEffect(() => {
    fetchAIUsage();
  }, []);

  const fetchAIUsage = async () => {
    try {
      const response = await fetch('/api/ai-usage');
      if (response.ok) {
        const data = await response.json();
        setAiUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI usage:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription</h1>
        <p className="text-gray-600">Manage your subscription and usage</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Subscription Status Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
              <p className="opacity-90">Active Subscription</p>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold">
              ₹900/month
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm opacity-90">Next Billing</span>
              </div>
              <p className="text-xl font-bold">1st of next month</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm opacity-90">Status</span>
              </div>
              <p className="text-xl font-bold">Active</p>
            </div>
          </div>
        </div>

        {/* AI Usage Card */}
        {aiUsage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Generations</h3>
                <p className="text-sm text-gray-600">This month's usage</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Usage</span>
                <span className="text-sm font-semibold text-gray-900">
                  {aiUsage.used}/{aiUsage.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                  style={{ width: `${(aiUsage.used / aiUsage.limit) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {aiUsage.remaining > 0 ? (
                <>
                  You have <span className="font-semibold text-purple-600">{aiUsage.remaining} AI generations</span> remaining this month.
                </>
              ) : (
                <span className="text-red-600 font-semibold">
                  ⚠️ You've used all AI generations for this month. Resets on the 1st.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Plan Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What's Included</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">10 AI Generations per Month</p>
                <p className="text-sm text-gray-600">Create charts from text descriptions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Unlimited Manual Editing</p>
                <p className="text-sm text-gray-600">Create and edit as many projects as you want</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Unlimited Code Imports</p>
                <p className="text-sm text-gray-600">Import from JSON without limits</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Cloud Storage & Auto-Save</p>
                <p className="text-sm text-gray-600">All projects automatically saved</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Priority Support</p>
                <p className="text-sm text-gray-600">Get help when you need it</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manage Subscription */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Subscription</h3>
          <p className="text-gray-600 mb-4">
            Need to update your payment method or cancel your subscription? You can manage your subscription through Razorpay's customer portal.
          </p>
          <button
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all text-sm"
            onClick={() => alert('Razorpay customer portal will be integrated here')}
          >
            Manage via Razorpay
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Cancel anytime • Changes take effect at the end of your billing period
          </p>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Billing History</h3>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices will appear here after your first payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
