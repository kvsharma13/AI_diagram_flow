'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { BA_MODULES, type BAGroup } from '@/lib/ba/modules';
import { EditorType } from '@/types/project';

const GROUP_ORDER: BAGroup[] = ['Overview', 'Requirements', 'Modeling', 'Analysis'];

/* "BA Modules" dropdown — sits beside the existing generator tabs so the 7
   generators keep their position while the 10 BA modules live under one
   labeled, grouped menu. */
export default function BAModuleNav({
  active, onSelect,
}: { active: EditorType; onSelect: (id: EditorType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const activeModule = BA_MODULES.find((m) => m.id === active);
  const isActive = !!activeModule;
  const TriggerIcon = activeModule?.icon || LayoutGrid;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
        style={isActive
          ? { background: 'var(--accent)', color: '#fff' }
          : { background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        <TriggerIcon className="w-4 h-4" />
        <span className="whitespace-nowrap">{activeModule ? activeModule.label : 'BA Modules'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl p-1.5 z-50 max-h-[70vh] overflow-auto"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 20px 50px -15px rgba(0,0,0,0.7)' }}
        >
          {GROUP_ORDER.map((group) => {
            const items = BA_MODULES.filter((m) => m.group === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-1 last:mb-0">
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {group}
                </div>
                {items.map((m) => {
                  const Icon = m.icon;
                  const selected = m.id === active;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { onSelect(m.id); setOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left"
                      style={selected
                        ? { background: 'var(--accent-soft-bg)', color: 'var(--accent-hover)' }
                        : { color: 'var(--text-secondary)', background: 'transparent' }}
                      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; }}
                      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
