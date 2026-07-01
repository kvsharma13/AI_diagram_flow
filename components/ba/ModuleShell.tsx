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
      {/* Header — compact, so each module keeps the maximum working area. */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 md:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)' }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent-hover)' }} />
              </div>
            )}
            <div className="min-w-0 flex items-baseline gap-2">
              <h1 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              {subtitle && <p className="text-xs truncate hidden md:block" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
          </div>
          {(actions || exportModuleId) && (
            <div className="flex items-center gap-2 overflow-x-auto flex-shrink-0">
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
