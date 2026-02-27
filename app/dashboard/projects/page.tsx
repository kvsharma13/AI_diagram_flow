'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Calendar, Users, Trash2, Edit2, Loader2, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  name: string;
  gantt_phases: any[];
  raci_tasks: any[];
  updated_at: string;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Create your first project to get started with Gantt charts and RACI matrices</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const hasGantt = project.gantt_phases?.length > 0;
            const hasRaci = project.raci_tasks?.length > 0;

            return (
              <div
                key={project.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Project Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {project.name}
                  </h3>

                  {/* Charts Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {hasGantt && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Gantt</span>
                      </div>
                    )}
                    {hasRaci && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">RACI</span>
                      </div>
                    )}
                    {!hasGantt && !hasRaci && (
                      <span className="text-sm text-gray-500">Empty project</span>
                    )}
                  </div>

                  {/* Last Updated */}
                  <p className="text-sm text-gray-500 mb-4">
                    Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Open
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete project"
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
