'use client';

import { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Calendar, Users, Sparkles, TrendingUp, Zap, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

        if (data.needsSubscription && !data.isWhitelisted) {
          router.push('/pricing?required=true');
        }
      }

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
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (subscriptionCheck?.needsSubscription && !subscriptionCheck?.isWhitelisted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Subscription Required</CardTitle>
            <CardDescription>
              Please subscribe to access the dashboard and all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planBadge = subscriptionCheck?.planType === 'pro' ? (
    <Badge variant="default">Pro Plan</Badge>
  ) : subscriptionCheck?.planType === 'basic' ? (
    <Badge variant="secondary">Basic Plan</Badge>
  ) : subscriptionCheck?.isWhitelisted ? (
    <Badge variant="success">Unlimited Access</Badge>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              {planBadge}
            </div>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
          <SignOutButton redirectUrl="/">
            <Button variant="destructive" size="default">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </SignOutButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Projects Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Projects
              </CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.projects}</div>
              <p className="text-xs text-gray-600 mt-1">Projects created</p>
            </CardContent>
          </Card>

          {/* AI Credits Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                AI Generations
              </CardTitle>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.aiCreditsRemaining}/{stats.aiCreditsLimit}</div>
              <p className="text-xs text-white/80 mt-1">Remaining this month</p>
            </CardContent>
          </Card>

          {/* Charts Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Charts
              </CardTitle>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCharts}</div>
              <p className="text-xs text-gray-600 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create New Project */}
          <Card className="group border-2 border-dashed border-gray-300 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer">
            <Link href="/dashboard/projects/new">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">Create New Project</CardTitle>
                    <CardDescription>
                      Start a new Gantt chart or RACI matrix from scratch or with AI
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          {/* View All Projects */}
          <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer">
            <Link href="/dashboard/projects">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">View All Projects</CardTitle>
                    <CardDescription className="text-gray-700">
                      Access and manage all your existing projects
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What you can do with ProjectFlow AI</CardTitle>
            <CardDescription>Explore all the powerful features at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">AI-Powered Generation</h3>
                  <p className="text-sm text-gray-600">
                    Paste your project description and let AI create professional charts instantly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">Gantt Charts</h3>
                  <p className="text-sm text-gray-600">
                    Create beautiful timelines with drag-and-drop editing and templates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">RACI Matrix</h3>
                  <p className="text-sm text-gray-600">
                    Define clear responsibilities with visual matrix and dual marks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg">Auto-Save</h3>
                  <p className="text-sm text-gray-600">
                    Never lose your work with automatic cloud backup and sync
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
