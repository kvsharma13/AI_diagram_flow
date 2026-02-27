'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName }),
      });

      if (response.ok) {
        const { project } = await response.json();
        router.push(`/dashboard/projects/${project.id}`);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Failed to create project';
        const details = errorData.details ? `\n\nDetails: ${errorData.details}` : '';
        alert(`Error: ${errorMsg}${details}`);
        console.error('Create project error:', errorData);
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
        <p className="text-gray-600">Give your project a name to get started</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Website Redesign Q1 2025"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">What happens next?</p>
                <p>After creating your project, you can:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Add Gantt chart phases and timelines</li>
                  <li>Create RACI matrix with stakeholders</li>
                  <li>Use AI to generate charts from text</li>
                  <li>Import from JSON code</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={isCreating || !projectName.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Project
                </>
              )}
            </button>
            <Link
              href="/dashboard/projects"
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
