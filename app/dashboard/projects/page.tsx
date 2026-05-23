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

  useEffect(() => { fetchProjects(); }, []);

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
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        alert('Failed to delete project');
      }
    } catch {
      alert('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-hover)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Projects
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(124,58,237,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(124,58,237,0.3)';
            }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div
            className="rounded-xl p-16 text-center"
            style={{
              background: 'var(--surface-1)',
              border: '1px dashed rgba(255,255,255,0.10)',
            }}
          >
            <FolderOpen className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No projects yet
            </h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Create your first project to get started with Gantt charts and RACI matrices
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const hasGantt = project.gantt_phases?.length > 0;
              const hasRaci = project.raci_tasks?.length > 0;

              return (
                <div
                  key={project.id}
                  className="group rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)';
                  }}
                >
                  <div className="p-5">
                    {/* Name */}
                    <h3 className="text-sm font-semibold mb-3 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>

                    {/* Type badges */}
                    <div className="flex items-center gap-2 mb-4">
                      {hasGantt && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            background: 'rgba(56,189,248,0.10)',
                            color: '#38BDF8',
                            border: '1px solid rgba(56,189,248,0.20)',
                          }}
                        >
                          <Calendar className="w-3 h-3" />
                          Gantt
                        </span>
                      )}
                      {hasRaci && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            background: 'rgba(34,197,94,0.10)',
                            color: '#22C55E',
                            border: '1px solid rgba(34,197,94,0.20)',
                          }}
                        >
                          <Users className="w-3 h-3" />
                          RACI
                        </span>
                      )}
                      {!hasGantt && !hasRaci && (
                        <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                          Empty
                        </span>
                      )}
                    </div>

                    {/* Last updated */}
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </p>

                    {/* Divider */}
                    <div className="mb-4" style={{ height: '1px', background: 'var(--divider)' }} />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                        style={{
                          background: 'var(--accent-soft-bg)',
                          color: 'var(--accent-hover)',
                          border: '1px solid var(--accent-soft-bd)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.22)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft-bg)';
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Open
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40"
                        style={{ color: 'var(--text-muted)' }}
                        title="Delete project"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.10)';
                          (e.currentTarget as HTMLElement).style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = '';
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
