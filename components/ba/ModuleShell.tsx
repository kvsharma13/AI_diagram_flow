'use client';

import { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import ExportMenu from '@/components/ba/ExportMenu';

/* Standard chrome for every BA module editor — mirrors the header/body
   layout used by the existing editors (RACI, Gantt, …) so the modules
   feel native. `id` is set on the root for diagram/export snapshotting. */
export default function ModuleShell({
  id, title, subtitle, icon: Icon, actions, exportModuleId, children, bodyClassName = 'overflow-auto p-4 md:p-6',
}: {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  exportModuleId?: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div id={id} className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)' }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              {subtitle && <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
          </div>
          {(actions || exportModuleId) && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 flex-wrap lg:flex-nowrap">
              {actions}
              {exportModuleId && <ExportMenu moduleId={exportModuleId} />}
            </div>
          )}
        </div>
      </div>
      {/* Body */}
      <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
