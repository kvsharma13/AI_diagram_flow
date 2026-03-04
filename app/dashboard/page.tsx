'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Sparkles, TrendingUp, Zap, Lock, Calendar, Plus, RefreshCw } from 'lucide-react';
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
  const [showGanttDialog, setShowGanttDialog] = useState(false);
  const [showRaciDialog, setShowRaciDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkSubscription();

    // Refetch when page becomes visible again (e.g., after using AI)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionCheck(data);
        // Don't redirect - allow access to dashboard regardless of subscription
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

  const createGanttProject = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/gantt?projectId=${data.project.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const createRaciProject = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/raci?projectId=${data.project.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
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

  // Allow access to dashboard even without subscription
  const needsSubscription = subscriptionCheck?.needsSubscription && !subscriptionCheck?.isWhitelisted;

  const planBadge = subscriptionCheck?.planType === 'pro' ? (
    <Badge variant="default">Pro Plan</Badge>
  ) : subscriptionCheck?.planType === 'basic' ? (
    <Badge variant="secondary">Basic Plan</Badge>
  ) : subscriptionCheck?.isWhitelisted ? (
    <Badge variant="success">Unlimited Access</Badge>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Subscription Warning Banner */}
        {needsSubscription && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Subscribe to unlock all features</p>
                  <p className="text-sm text-white/90">
                    You can explore the dashboard, but need a subscription to use AI generation and features
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
                <Link href="/pricing">
                  Subscribe Now
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={checkSubscription}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
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

          {/* Gantt Chart */}
          <Card
            className="group bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setShowGanttDialog(true)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">Gantt Chart</CardTitle>
                  <CardDescription>
                    Create beautiful timelines with drag-and-drop editing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* RACI Matrix */}
          <Card
            className="group bg-gradient-to-br from-purple-600 to-pink-600 border-none text-white hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setShowRaciDialog(true)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl mb-2 text-white">RACI Matrix</CardTitle>
                  <CardDescription className="text-white/90">
                    Define clear responsibilities with visual matrix
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
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

        {/* Gantt Project Name Dialog */}
        {showGanttDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Gantt Chart</h3>
              <p className="text-sm text-gray-600 mb-4">Give your project a name to get started</p>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createGanttProject()}
                placeholder="Enter project name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowGanttDialog(false);
                    setProjectName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={createGanttProject}
                  disabled={!projectName.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RACI Project Name Dialog */}
        {showRaciDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create RACI Matrix</h3>
              <p className="text-sm text-gray-600 mb-4">Give your project a name to get started</p>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createRaciProject()}
                placeholder="Enter project name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRaciDialog(false);
                    setProjectName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={createRaciProject}
                  disabled={!projectName.trim() || isCreating}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
