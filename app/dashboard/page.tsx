'use client';

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Calendar, Users, Sparkles, TrendingUp, Zap, Lock, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    projects: 0,
    aiCreditsRemaining: 0,
    aiCreditsLimit: 0,
    totalCharts: 0,
  });
  const [subscriptionCheck, setSubscriptionCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionCheck(data);

        // If user needs subscription and is not whitelisted, redirect to pricing
        if (data.needsSubscription && !data.isWhitelisted) {
          router.push('/pricing?required=true');
        }
      }

      // Fetch AI usage
      const usageResponse = await fetch('/api/ai-usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setStats(prev => ({
          ...prev,
          aiCreditsRemaining: usageData.remaining,
          aiCreditsLimit: usageData.limit,
        }));
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show subscription required message
  if (subscriptionCheck?.needsSubscription && !subscriptionCheck?.isWhitelisted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            Please subscribe to access the dashboard and all features.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>
        <SignOutButton redirectUrl="/">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </SignOutButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Projects Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.projects}</div>
          <div className="text-sm text-gray-600">Projects Created</div>
        </div>

        {/* AI Credits Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium opacity-90">This Month</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.aiCreditsRemaining}/{stats.aiCreditsLimit}</div>
          <div className="text-sm opacity-90">AI Generations Left</div>
        </div>

        {/* Charts Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">All Time</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCharts}</div>
          <div className="text-sm text-gray-600">Charts Created</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create New Project */}
        <Link
          href="/dashboard/projects/new"
          className="group bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-purple-400 p-8 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Project</h3>
              <p className="text-gray-600 text-sm">
                Start a new Gantt chart or RACI matrix from scratch or with AI
              </p>
            </div>
          </div>
        </Link>

        {/* View All Projects */}
        <Link
          href="/dashboard/projects"
          className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 hover:border-blue-400 p-8 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">View All Projects</h3>
              <p className="text-gray-700 text-sm">
                Access and manage all your existing projects
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          What you can do with ProjectFlow AI
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Generation</h3>
              <p className="text-sm text-gray-600">
                Paste your project description and let AI create professional charts instantly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Gantt Charts</h3>
              <p className="text-sm text-gray-600">
                Create beautiful timelines with drag-and-drop editing and templates
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">RACI Matrix</h3>
              <p className="text-sm text-gray-600">
                Define clear responsibilities with visual matrix and dual marks
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Auto-Save</h3>
              <p className="text-sm text-gray-600">
                Never lose your work with automatic cloud backup and sync
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
