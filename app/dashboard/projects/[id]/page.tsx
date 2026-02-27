'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Check, FileText, Calendar, Users, Network, GitBranch } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import GanttEditor from '@/editors/GanttEditor';
import RACIMatrixEditor from '@/editors/RACIMatrixEditor';
import { EditorType } from '@/types/project';

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { project, setProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeEditor, setActiveEditor] = useState<EditorType>('gantt');
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Load project from database
  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Auto-save when project changes (debounced)
  useEffect(() => {
    if (!project || isLoading) return;

    const timeout = setTimeout(() => {
      saveProject();
    }, 3000); // Save 3 seconds after last change

    return () => clearTimeout(timeout);
  }, [project]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        router.push('/dashboard/projects');
        return;
      }

      const { project: dbProject } = await response.json();

      // Convert database format to store format
      setProject({
        id: dbProject.id,
        name: dbProject.name,
        ganttPhases: dbProject.gantt_phases || [],
        ganttTemplateStyle: dbProject.gantt_template_style,
        raciTasks: dbProject.raci_tasks || [],
        raciStakeholders: dbProject.raci_stakeholders || [],
        raciAssignments: dbProject.raci_assignments || [],
        architectureComponents: dbProject.architecture_components || [],
        architectureMermaidCode: dbProject.architecture_mermaid_code,
        flowchartSteps: dbProject.flowchart_steps || [],
        timelineMonths: dbProject.timeline_months || 12,
        timelineUnit: dbProject.timeline_unit || 'months',
        createdAt: new Date(dbProject.created_at),
        updatedAt: new Date(dbProject.updated_at),
      });

      setProjectName(dbProject.name);
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = useCallback(async () => {
    if (!project || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          ganttPhases: project.ganttPhases,
          ganttTemplateStyle: project.ganttTemplateStyle,
          raciTasks: project.raciTasks,
          raciStakeholders: project.raciStakeholders,
          raciAssignments: project.raciAssignments,
          timelineMonths: project.timelineMonths,
          timelineUnit: project.timelineUnit,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  }, [project, projectId, isSaving]);

  const handleNameUpdate = async () => {
    if (!projectName.trim() || !project) return;

    const updatedProject = { ...project, name: projectName };
    setProject(updatedProject);
    setIsEditingName(false);
    await saveProject();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const editors = [
    { type: 'gantt' as EditorType, label: 'Gantt Chart', icon: Calendar },
    { type: 'raci' as EditorType, label: 'RACI Matrix', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>

            {/* Save Status */}
            <div className="flex items-center gap-3">
              {isSaving ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}

              <button
                onClick={saveProject}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Now
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div className="mb-4">
            {isEditingName ? (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameUpdate();
                  if (e.key === 'Escape') {
                    setProjectName(project?.name || '');
                    setIsEditingName(false);
                  }
                }}
                className="text-2xl font-bold text-gray-900 px-3 py-1 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors px-3 py-1 rounded-lg hover:bg-purple-50"
              >
                {project?.name}
              </h1>
            )}
          </div>

          {/* Editor Tabs */}
          <div className="flex items-center gap-2">
            {editors.map((editor) => {
              const Icon = editor.icon;
              const isActive = activeEditor === editor.type;

              return (
                <button
                  key={editor.type}
                  onClick={() => setActiveEditor(editor.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {editor.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="h-[calc(100vh-200px)]">
        {activeEditor === 'gantt' && <GanttEditor />}
        {activeEditor === 'raci' && <RACIMatrixEditor />}
      </div>
    </div>
  );
}
