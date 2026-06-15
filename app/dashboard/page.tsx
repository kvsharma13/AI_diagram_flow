'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Sparkles, TrendingUp, Zap, Lock,
  Calendar, Plus, RefreshCw, Boxes, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [showArchitectureDialog, setShowArchitectureDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkSubscription();
    const handleVisibilityChange = () => {
      if (!document.hidden) checkSubscription();
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

  const createProject = async (destination: string) => {
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
        router.push(`${destination}?projectId=${data.project.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch {
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const closeAllDialogs = () => {
    setShowGanttDialog(false);
    setShowRaciDialog(false);
    setShowArchitectureDialog(false);
    setProjectName('');
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-9 w-56 rounded-lg" style={{ background: 'var(--surface-2)' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      </div>
    );
  }

  const needsSubscription = subscriptionCheck?.needsSubscription && !subscriptionCheck?.isWhitelisted;
  const creditPct = stats.aiCreditsLimit > 0
    ? (stats.aiCreditsRemaining / stats.aiCreditsLimit) * 100
    : 0;

  const planLabel = subscriptionCheck?.planType === 'pro'
    ? 'Pro'
    : subscriptionCheck?.planType === 'basic'
    ? 'Basic'
    : subscriptionCheck?.isWhitelisted
    ? 'Unlimited'
    : null;

  const tools = [
    {
      label: 'Gantt Chart',
      description: 'Visual project timelines with drag-and-drop editing',
      icon: Calendar,
      onClick: () => setShowGanttDialog(true),
    },
    {
      label: 'RACI Matrix',
      description: 'Define clear responsibilities across stakeholders',
      icon: Users,
      onClick: () => setShowRaciDialog(true),
    },
    {
      label: 'Architecture Diagram',
      description: 'Design system and infrastructure visually',
      icon: Boxes,
      onClick: () => setShowArchitectureDialog(true),
    },
    {
      label: 'AI Generation',
      description: 'Describe your project — AI builds the artifacts',
      icon: Sparkles,
      onClick: () => setShowGanttDialog(true),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Subscription warning banner */}
      {needsSubscription && (
        <div
          className="flex items-center justify-between px-6 py-3 text-sm"
          style={{
            background: 'rgba(37,99,235,0.12)',
            borderBottom: '1px solid rgba(37,99,235,0.25)',
          }}
        >
          <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-hover)' }} />
            <span>Subscribe to unlock AI generation and all features.</span>
          </div>
          <Button asChild size="sm" className="ml-4">
            <Link href="/pricing">Subscribe</Link>
          </Button>
        </div>
      )}

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Good to see you, {user?.firstName || 'there'}
            </h1>
            {planLabel && (
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  background: 'var(--accent-soft-bg)',
                  color: 'var(--accent-hover)',
                  border: '1px solid var(--accent-soft-bd)',
                }}
              >
                {planLabel}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your workspace is ready. Start building or continue where you left off.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Projects */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Projects
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-soft-bg)' }}
              >
                <Calendar className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stats.projects}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total created</p>
          </div>

          {/* AI Credits */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                AI Credits
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={checkSubscription}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-white/[0.05]"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-soft-bg)' }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stats.aiCreditsRemaining}
              <span className="text-base font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                / {stats.aiCreditsLimit}
              </span>
            </div>
            <div className="w-full h-1 rounded-full mt-2" style={{ background: 'var(--surface-3)' }}>
              <div
                className="h-1 rounded-full transition-all"
                style={{
                  width: `${creditPct}%`,
                  background: creditPct > 30 ? 'var(--accent-hover)' : 'var(--warning)',
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Remaining this month</p>
          </div>

          {/* Charts */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Artifacts
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-soft-bg)' }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stats.totalCharts}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Quick start
            </h2>
            <Link
              href="/dashboard/projects"
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--accent-hover)' }}
            >
              All projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* New Project CTA */}
            <Link
              href="/dashboard/projects/new"
              className="group flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-200"
              style={{
                background: 'var(--accent-soft-bg)',
                border: '1px solid var(--accent-soft-bd)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.20)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft-bg)';
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  New project
                </p>
                <p className="text-xs" style={{ color: 'var(--accent-hover)' }}>
                  Start from scratch or use a template
                </p>
              </div>
            </Link>

            {/* Tool cards */}
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.label}
                  onClick={tool.onClick}
                  className="group flex items-center gap-4 rounded-xl px-5 py-4 text-left transition-all duration-200 w-full"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface-3)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {tool.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features section */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            What&apos;s in your workspace
          </h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            Every tool you need for enterprise project planning, powered by AI
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, label: 'AI Generation', desc: 'Describe a project and get Gantt, RACI, and SOW artifacts instantly' },
              { icon: Calendar, label: 'Gantt Charts', desc: 'Interactive timelines with phases, milestones, and drag-and-drop editing' },
              { icon: Users, label: 'RACI Matrix', desc: 'Define ownership and accountability across all stakeholders' },
              { icon: Zap, label: 'Auto-Save', desc: 'Every change is synced to the cloud automatically, no manual saves needed' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-lg p-4 transition-colors"
                style={{ background: 'var(--surface-2)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-soft-bg)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {label}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Name Dialogs */}
      {(showGanttDialog || showRaciDialog || showArchitectureDialog) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && closeAllDialogs()}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-2xl"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {showGanttDialog && 'New Gantt Chart'}
                  {showRaciDialog && 'New RACI Matrix'}
                  {showArchitectureDialog && 'New Architecture Diagram'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Name your project to continue
                </p>
              </div>
              <button
                onClick={closeAllDialogs}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '';
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (showGanttDialog) createProject('/dashboard/gantt');
                  if (showRaciDialog) createProject('/dashboard/raci');
                  if (showArchitectureDialog) createProject('/dashboard/architecture');
                }
              }}
              placeholder="e.g. Q3 Product Launch"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg text-sm mb-5 outline-none transition-all"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-soft-bd)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={closeAllDialogs} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showGanttDialog) createProject('/dashboard/gantt');
                  if (showRaciDialog) createProject('/dashboard/raci');
                  if (showArchitectureDialog) createProject('/dashboard/architecture');
                }}
                disabled={!projectName.trim() || isCreating}
              >
                {isCreating ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
