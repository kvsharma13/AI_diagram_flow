'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Cancelled
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Your payment was not completed. No charges have been made to your account.
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Need Help?</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            If you encountered any issues during payment, please contact our support team.
          </p>
          <p className="text-sm text-gray-600">
            Email: support@projectflow.ai
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
