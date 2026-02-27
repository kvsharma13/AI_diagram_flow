'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupCheckPage() {
  const { user, isLoaded } = useUser();
  const [checks, setChecks] = useState<any>({});
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = async () => {
    setIsChecking(true);
    const results: any = {};

    // Check 1: Clerk Authentication
    results.clerk = isLoaded && user ? 'success' : 'error';

    // Check 2: Supabase Connection
    try {
      const response = await fetch('/api/setup-check');
      const data = await response.json();

      results.supabase = data.supabaseConnected ? 'success' : 'error';
      results.supabaseDetails = data.supabaseDetails;
      results.databaseSchema = data.tablesExist ? 'success' : 'warning';
      results.razorpay = data.razorpayConfigured ? 'success' : 'warning';
      results.openai = data.openaiConfigured ? 'success' : 'warning';
    } catch (error) {
      results.supabase = 'error';
      results.supabaseDetails = 'Connection failed';
    }

    setChecks(results);
    setIsChecking(false);
  };

  const getIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'success') return 'Working';
    if (status === 'warning') return 'Optional';
    return 'Not Configured';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Verification</h1>
          <p className="text-gray-600 mb-8">Check if all services are configured correctly</p>

          <button
            onClick={runChecks}
            disabled={isChecking}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold mb-8 flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              'Run Setup Check'
            )}
          </button>

          {Object.keys(checks).length > 0 && (
            <div className="space-y-4">
              {/* Clerk */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {getIcon(checks.clerk)}
                  <div>
                    <p className="font-semibold text-gray-900">Clerk Authentication</p>
                    <p className="text-sm text-gray-600">
                      {checks.clerk === 'success' ? `Signed in as ${user?.emailAddresses[0]?.emailAddress}` : 'Not signed in'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${checks.clerk === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(checks.clerk)}
                </span>
              </div>

              {/* Supabase */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {getIcon(checks.supabase)}
                  <div>
                    <p className="font-semibold text-gray-900">Supabase Database</p>
                    <p className="text-sm text-gray-600">{checks.supabaseDetails || 'Database connection'}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${checks.supabase === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {getStatusText(checks.supabase)}
                </span>
              </div>

              {/* Database Schema */}
              {checks.databaseSchema && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {getIcon(checks.databaseSchema)}
                    <div>
                      <p className="font-semibold text-gray-900">Database Schema</p>
                      <p className="text-sm text-gray-600">
                        {checks.databaseSchema === 'success' ? 'Tables created' : 'Run /supabase/schema.sql'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${checks.databaseSchema === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getStatusText(checks.databaseSchema)}
                  </span>
                </div>
              )}

              {/* OpenAI */}
              {checks.openai && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {getIcon(checks.openai)}
                    <div>
                      <p className="font-semibold text-gray-900">OpenAI API</p>
                      <p className="text-sm text-gray-600">AI chart generation</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${checks.openai === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getStatusText(checks.openai)}
                  </span>
                </div>
              )}

              {/* Razorpay */}
              {checks.razorpay && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {getIcon(checks.razorpay)}
                    <div>
                      <p className="font-semibold text-gray-900">Razorpay Payment</p>
                      <p className="text-sm text-gray-600">Subscription payments</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${checks.razorpay === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getStatusText(checks.razorpay)}
                  </span>
                </div>
              )}
            </div>
          )}

          {checks.databaseSchema === 'warning' && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">⚠️ Database Schema Not Found</p>
              <p className="text-sm text-yellow-800 mb-3">
                You need to run the database schema to create the required tables.
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Copy contents of <code className="bg-yellow-100 px-1 rounded">/supabase/schema.sql</code></li>
                <li>Paste and click "Run"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {checks.supabase === 'error' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-2">❌ Supabase Connection Failed</p>
              <p className="text-sm text-red-800 mb-3">
                Check your Supabase configuration in <code className="bg-red-100 px-1 rounded">.env.local</code>
              </p>
              <p className="text-sm text-red-800">Required variables:</p>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside mt-2">
                <li><code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                <li><code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
