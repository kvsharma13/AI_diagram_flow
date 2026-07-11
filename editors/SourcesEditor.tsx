'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Upload, FileText, Loader2, Trash2, CheckCircle2, AlertCircle,
  Sparkles, ListChecks, FileUp,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { ClientBrief, ProjectDocument, Requirement } from '@/types/project';

const ACCEPT = '.pdf,.docx,.txt,.md';

export default function SourcesEditor() {
  const { project, setClientBrief, setRequirements } = useProjectStore();
  const projectId = project?.id || '';
  const brief = project?.clientBrief;

  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshDocuments = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingDocs(false);
    }
  }, [projectId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!projectId) return;
      setError('');
      setNotice('');
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`/api/projects/${projectId}/documents`, { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Upload failed');
        if (data.clientBrief) setClientBrief(data.clientBrief as ClientBrief);
        setNotice(`Analysed "${file.name}" and updated the client brief.`);
        await refreshDocuments();
      } catch (e: any) {
        setError(e?.message || 'Upload failed');
        await refreshDocuments();
      } finally {
        setUploading(false);
      }
    },
    [projectId, setClientBrief, refreshDocuments]
  );

  const onPickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Upload sequentially so each merges cleanly into the brief.
    (async () => {
      for (const f of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        await uploadFile(f);
      }
    })();
  };

  const deleteDoc = async (docId: string) => {
    if (!projectId) return;
    try {
      await fetch(`/api/projects/${projectId}/documents/${docId}`, { method: 'DELETE' });
      await refreshDocuments();
    } catch {
      /* ignore */
    }
  };

  // ── Brief editing ──────────────────────────────────────────────────────
  const update = (patch: Partial<ClientBrief>) => setClientBrief({ ...(brief || {}), ...patch });

  const sendRequirementsToModule = () => {
    if (!brief?.requirements?.length) return;
    const reqs: Requirement[] = brief.requirements.map((r, i) => ({
      id: uuidv4(),
      reqId: `REQ-${String(i + 1).padStart(3, '0')}`,
      description: r.description,
      type: r.type || 'Functional',
      priority: r.priority || 'Should Have',
      status: 'Draft',
      source: 'Client Documents',
      category: r.category,
    }));
    setRequirements(reqs);
    setNotice(`Added ${reqs.length} requirements to the Requirements module.`);
  };

  if (!project) return null;

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Client Sources</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Upload the RFP and any client documents. We analyse them once into a structured brief that grounds every
            generator (SOW, Requirements, Architecture…). PDF, DOCX, or TXT · max 4MB each.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onPickFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
          style={{
            borderColor: dragOver ? '#3b82f6' : 'var(--border)',
            background: dragOver ? 'rgba(59,130,246,0.06)' : 'var(--surface-1)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => { onPickFiles(e.target.files); e.target.value = ''; }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
              <span className="text-sm font-medium">Analysing document… this can take a moment</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Upload className="w-7 h-7 text-blue-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Drop files here or click to upload
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF · DOCX · TXT</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}
        {notice && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(34,197,94,0.1)', color: '#86efac' }}>
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {notice}
          </div>
        )}

        {/* Documents list */}
        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Uploaded documents
          </h2>
          {loadingDocs ? (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
          ) : documents.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents yet.</div>
          ) : (
            <div className="space-y-2">
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{d.fileName}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round((d.fileSize || 0) / 1024)} KB</div>
                  </div>
                  <StatusBadge status={d.status} error={d.error} />
                  <button
                    onClick={() => deleteDoc(d.id)}
                    className="p-1.5 rounded transition-colors text-red-400 hover:bg-red-900/30"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Brief */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Client Brief</h2>
            </div>
            {brief?.requirements?.length ? (
              <button
                onClick={sendRequirementsToModule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Populate the Requirements module from the brief"
              >
                <ListChecks className="w-3.5 h-3.5" />
                Send {brief.requirements.length} requirements to Requirements
              </button>
            ) : null}
          </div>

          {!brief ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Upload a document above and its distilled brief will appear here — editable, and used to ground your generators.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Client" value={brief.clientName || ''} onChange={(v) => update({ clientName: v })} />
                <Field label="Project" value={brief.projectName || ''} onChange={(v) => update({ projectName: v })} />
              </div>
              <TextArea label="Summary" value={brief.summary || ''} onChange={(v) => update({ summary: v })} rows={3} />
              <TextArea label="Background" value={brief.background || ''} onChange={(v) => update({ background: v })} rows={3} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ListField label="Objectives" items={brief.objectives} onChange={(a) => update({ objectives: a })} />
                <ListField label="Deliverables" items={brief.deliverables} onChange={(a) => update({ deliverables: a })} />
                <ListField label="In scope" items={brief.scopeIn} onChange={(a) => update({ scopeIn: a })} />
                <ListField label="Out of scope" items={brief.scopeOut} onChange={(a) => update({ scopeOut: a })} />
                <ListField label="Constraints" items={brief.constraints} onChange={(a) => update({ constraints: a })} />
                <ListField label="Assumptions" items={brief.assumptions} onChange={(a) => update({ assumptions: a })} />
                <ListField label="Compliance" items={brief.compliance} onChange={(a) => update({ compliance: a })} />
                <ListField label="Risks" items={brief.risks} onChange={(a) => update({ risks: a })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Budget" value={brief.budget || ''} onChange={(v) => update({ budget: v })} />
                <Field label="Timeline" value={brief.timeline || ''} onChange={(v) => update({ timeline: v })} />
              </div>

              {brief.requirements?.length ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Requirements ({brief.requirements.length})
                  </div>
                  <ul className="space-y-1">
                    {brief.requirements.map((r, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          [{r.type || '—'}/{r.priority || '—'}]
                        </span>
                        <span>{r.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, error }: { status: ProjectDocument['status']; error?: string }) {
  if (status === 'ready') {
    return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>;
  }
  if (status === 'error') {
    return <span className="flex items-center gap-1 text-xs text-red-400" title={error}><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
  }
  return <span className="flex items-center gap-1 text-xs text-blue-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing</span>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-lg px-3 py-1.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
    </label>
  );
}

// Edits a string[] as one-item-per-line text (simple + robust).
function ListField({ label, items, onChange }: { label: string; items?: string[]; onChange: (a: string[]) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <textarea
        value={(items || []).join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
        rows={Math.min(6, Math.max(2, (items?.length || 0) + 1))}
        placeholder="One per line"
        className="mt-1 w-full rounded-lg px-3 py-1.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
    </label>
  );
}
