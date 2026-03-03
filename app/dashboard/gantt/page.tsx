'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProjectStore } from '@/store/useProjectStore';
import GanttEditor from '@/editors/GanttEditor';

export default function GanttPage() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { project, setProject } = useProjectStore();

  useEffect(() => {
    checkSubscription();
    initializeProject();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        setHasSubscription(
          (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing') ||
          data.isWhitelisted
        );
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeProject = () => {
    // Initialize a temporary project for the Gantt editor
    if (!project) {
      setProject({
        id: 'temp-gantt',
        name: 'Gantt Chart Editor',
        ganttPhases: [],
        raciTasks: [],
        raciStakeholders: [],
        raciAssignments: [],
        architectureComponents: [],
        flowchartSteps: [],
        timelineMonths: 12,
        timelineUnit: 'months',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  return (
    <div className="relative min-h-screen">
        {/* Subscribe Overlay */}
        {!hasSubscription && !isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="max-w-md p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Subscribe to Use Gantt Charts
              </h2>
              <p className="text-gray-600 mb-8">
                Create beautiful Gantt charts with AI-powered generation, drag-and-drop editing, and export options.
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
          {hasSubscription && project && <GanttEditor />}
        </div>
      </div>
  );
}
