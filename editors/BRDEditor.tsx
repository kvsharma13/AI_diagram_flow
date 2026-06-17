'use client';

import { BookOpen } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { TextArea } from '@/components/ui/ba-controls';
import { EMPTY_BRD } from '@/lib/ba/defaults';
import type { BRDDocument } from '@/types/project';

// Module 1A — BRD: fixed sections, each an editable (Markdown) text field.
// No AI. Saves to the store, which the project page autosaves.
const SECTIONS: { key: keyof BRDDocument; label: string; hint: string }[] = [
  { key: 'projectOverview', label: 'Project Overview', hint: 'Background, context, and a short summary of the project.' },
  { key: 'objectives',      label: 'Objectives',       hint: 'The measurable business objectives this project must achieve.' },
  { key: 'scopeIn',         label: 'Scope — In',       hint: 'What is explicitly included in this project.' },
  { key: 'scopeOut',        label: 'Scope — Out',      hint: 'What is explicitly excluded from this project.' },
  { key: 'assumptions',     label: 'Assumptions',      hint: 'Assumptions the plan depends on being true.' },
  { key: 'constraints',     label: 'Constraints',      hint: 'Budget, timeline, technical, or regulatory constraints.' },
  { key: 'stakeholders',    label: 'Stakeholders',     hint: 'Key stakeholders and their interest or role.' },
];

export default function BRDEditor() {
  const { project, setBRD } = useProjectStore();
  if (!project) return null;

  const brd = project.brd || EMPTY_BRD();
  const update = (key: keyof BRDDocument, value: string) => setBRD({ ...brd, [key]: value });

  const filled = SECTIONS.filter((s) => (brd[s.key] || '').trim().length > 0).length;

  return (
    <ModuleShell
      id="brd-export-area"
      exportModuleId="brd"
      title="Business Requirements Document"
      subtitle={`${filled} of ${SECTIONS.length} sections filled · Markdown supported`}
      icon={BookOpen}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {SECTIONS.map((s) => (
          <div
            key={s.key}
            className="rounded-xl p-5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.label}</h3>
            <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>{s.hint}</p>
            <TextArea
              value={brd[s.key] || ''}
              onChange={(e) => update(s.key, e.target.value)}
              placeholder={`Write the ${s.label.toLowerCase()}…`}
              className="min-h-[120px]"
            />
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}
