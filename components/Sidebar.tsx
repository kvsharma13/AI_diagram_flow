'use client';

import { Calendar, Users, Network, GitBranch, FileText } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { EditorType } from '@/types/project';

export default function Sidebar() {
  const { currentEditor, setCurrentEditor } = useProjectStore();

  const menuItems: { id: EditorType; label: string; icon: React.ReactNode }[] = [
    { id: 'gantt',      label: 'Gantt',        icon: <Calendar className="w-4 h-4" /> },
    { id: 'raci',       label: 'RACI Matrix',   icon: <Users className="w-4 h-4" /> },
    { id: 'architecture',label: 'Architecture', icon: <Network className="w-4 h-4" /> },
    { id: 'flowchart',  label: 'Flowchart',     icon: <GitBranch className="w-4 h-4" /> },
    { id: 'templates',  label: 'Templates',     icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div
      className="w-56 h-screen fixed left-0 top-0 flex flex-col"
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--divider)' }}>
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          ProjectFlow <span style={{ color: 'var(--accent-hover)' }}>AI</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Editor workspace</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentEditor(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              currentEditor === item.id
                ? {
                    background: 'var(--accent-soft-bg)',
                    border: '1px solid var(--accent-soft-bd)',
                    color: '#fff',
                  }
                : {
                    color: 'var(--text-secondary)',
                    border: '1px solid transparent',
                  }
            }
            onMouseEnter={(e) => {
              if (currentEditor !== item.id) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentEditor !== item.id) {
                (e.currentTarget as HTMLElement).style.background = '';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--divider)' }}>
        <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
          ProjectFlow AI
        </p>
      </div>
    </div>
  );
}
