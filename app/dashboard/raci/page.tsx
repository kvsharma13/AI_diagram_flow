'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProjectStore } from '@/store/useProjectStore';
import RACIMatrixEditor from '@/editors/RACIMatrixEditor';

function RACIContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const { project, setProject } = useProjectStore();

  useEffect(() => {
    checkSubscription();
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        setHasSubscription(
          (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing') ||
          data.isWhitelisted ||
          data.isTestUser
        );
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = async (id: string) => {
    setLoadingProject(true);
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        const dbProject = data.project;

        // Convert database fields (snake_case) to store format (camelCase)
        const project = {
          id: dbProject.id,
          name: dbProject.name,
          ganttPhases: dbProject.gantt_phases || [],
          raciTasks: dbProject.raci_tasks || [],
          raciStakeholders: dbProject.raci_stakeholders || [],
          raciAssignments: dbProject.raci_assignments || [],
          architectureComponents: dbProject.architecture_components || [],
          flowchartSteps: dbProject.flowchart_steps || [],
          timelineMonths: dbProject.timeline_months || 12,
          timelineUnit: dbProject.timeline_unit || 'months',
          createdAt: new Date(dbProject.created_at),
          updatedAt: new Date(dbProject.updated_at),
        };

        setProject(project);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoadingProject(false);
    }
  };

  if (loadingProject || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
          <p className="text-gray-600 mb-6">
            Please go back to the dashboard and create or select a project.
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
        {/* Subscribe Overlay */}
        {!hasSubscription && !isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="max-w-md p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Subscribe to Use RACI Matrix
              </h2>
              <p className="text-gray-600 mb-8">
                Create professional RACI matrices with AI-powered generation and unlimited editing.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Plans & Subscribe
                </Link>
              </Button>
            </Card>
          </div>
        )}

        {/* Page Content */}
        <div className={!hasSubscription ? 'blur-sm pointer-events-none' : ''}>
          {hasSubscription && project && <RACIMatrixEditor />}
        </div>
      </div>
  );
}

export default function RACIPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RACIContent />
    </Suspense>
  );
}
