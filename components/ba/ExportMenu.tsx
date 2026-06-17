'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Loader2, ChevronDown, FileText, FileSpreadsheet, FileType2, Image as ImageIcon, type LucideIcon } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { buildModuleExport, type ExportFormat } from '@/lib/ba/export/model';

const FMT: Record<ExportFormat, { label: string; icon: LucideIcon }> = {
  docx: { label: 'Word (.docx)', icon: FileText },
  pdf: { label: 'PDF (.pdf)', icon: FileType2 },
  xlsx: { label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  png: { label: 'Image (.png)', icon: ImageIcon },
};

/* Per-module export dropdown. The heavy builders (docx/jspdf/exceljs) are
   dynamically imported only when an export is triggered. */
export default function ExportMenu({ moduleId }: { moduleId: string }) {
  const { project } = useProjectStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!project) return null;
  const formats = buildModuleExport(project, moduleId).formats;

  const run = async (fmt: ExportFormat) => {
    setBusy(fmt);
    try {
      const { exportModuleAs } = await import('@/lib/ba/export/builders');
      await exportModuleAs(project, moduleId, fmt);
      setOpen(false);
    } catch (e) {
      alert(`Export failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl p-1.5 z-50" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 20px 50px -15px rgba(0,0,0,0.7)' }}>
          {formats.map((f) => {
            const I = FMT[f].icon;
            return (
              <button
                key={f}
                onClick={() => run(f)}
                disabled={!!busy}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors disabled:opacity-50"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-3)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {busy === f ? <Loader2 className="w-4 h-4 animate-spin" /> : <I className="w-4 h-4" />}
                {FMT[f].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
