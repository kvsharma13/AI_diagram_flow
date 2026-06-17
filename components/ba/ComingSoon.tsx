'use client';

import { Hammer } from 'lucide-react';
import ModuleShell from './ModuleShell';
import { BA_MODULES } from '@/lib/ba/modules';
import { EditorType } from '@/types/project';

/* Temporary placeholder for BA modules whose editor hasn't landed yet.
   The data model, store, persistence and nav are already wired, so the
   module is reachable; only its editor UI is pending. */
export default function ComingSoon({ module }: { module: EditorType }) {
  const def = BA_MODULES.find((m) => m.id === module);
  const Icon = def?.icon || Hammer;
  return (
    <ModuleShell title={def?.label || 'BA Module'} subtitle="BA module" icon={Icon}>
      <div
        className="max-w-lg mx-auto mt-12 text-center rounded-xl border-2 border-dashed p-12"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <Icon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{def?.label}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          This module&apos;s data model, store, persistence and navigation are wired and ready.
          The editor is being built in an upcoming pass.
        </p>
      </div>
    </ModuleShell>
  );
}
