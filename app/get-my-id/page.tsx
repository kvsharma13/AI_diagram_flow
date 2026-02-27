'use client';

import { useUser } from '@clerk/nextjs';
import { Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function GetMyIdPage() {
  const { user, isLoaded } = useUser();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your user ID.</p>
          <Link
            href="/sign-in"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const userId = user.id;
  const email = user.emailAddresses[0]?.emailAddress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your User ID</h1>
            <p className="text-gray-600">
              Use this ID to add yourself to the whitelist
            </p>
          </div>

          {/* User ID Section */}
          <div className="space-y-6">
            {/* Clerk User ID */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <label className="text-sm font-semibold text-purple-900 mb-2 block">
                Clerk User ID
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg text-sm font-mono text-gray-900 border border-purple-200 break-all">
                  {userId}
                </code>
                <button
                  onClick={() => copyToClipboard(userId)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Email Address
              </label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg text-sm font-mono text-gray-900 border border-gray-200">
                  {email}
                </code>
                <button
                  onClick={() => copyToClipboard(email || '')}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can also use your email in the whitelist
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📝</span>
              Next Steps
            </h2>
            <ol className="space-y-2 text-sm text-blue-900">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Copy your User ID or Email using the button above</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Open <code className="bg-blue-100 px-2 py-1 rounded text-xs">/lib/config.ts</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Add your ID to the <code className="bg-blue-100 px-2 py-1 rounded text-xs">WHITELISTED_USERS</code> array</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Restart your development server</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">5.</span>
                <span>You'll have unlimited access to all features!</span>
              </li>
            </ol>
          </div>

          {/* Code Example */}
          <div className="mt-6 bg-gray-900 rounded-xl p-6">
            <p className="text-xs text-gray-400 mb-3 font-semibold">Example configuration:</p>
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{`export const WHITELISTED_USERS = [
  '${userId}', // Your User ID
  '${email}', // Or your email
];`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
