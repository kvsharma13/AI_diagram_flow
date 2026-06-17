'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Modal, AIButton, PrimaryButton, ToolbarButton, TextArea } from '@/components/ui/ba-controls';

/* Reusable AI-generation modal for the 4 BA touchpoints.
   Flow: input → Generate (loading) → draft preview ("N generated, review & save")
   → explicit Save. Never auto-applies; the module stays fully usable without AI. */
interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  aiType: string;                 // maps to /api/ai-generate `type`
  mode: 'text' | 'data';
  // text mode
  textLabel?: string;
  textPlaceholder?: string;
  minChars?: number;
  // data mode (input derived from existing project data)
  sourceText?: string;
  sourceSummary?: ReactNode;
  sourceEmpty?: boolean;
  sourceEmptyMessage?: string;
  // results
  parseResult: (data: any) => any[];
  renderPreview: (items: any[]) => ReactNode;
  itemNoun?: string;
  onAccept: (items: any[]) => void;
}

export default function AIGenerateModal({
  isOpen, onClose, title, aiType, mode,
  textLabel, textPlaceholder, minChars = 30,
  sourceText, sourceSummary, sourceEmpty, sourceEmptyMessage,
  parseResult, renderPreview, itemNoun = 'items', onAccept,
}: AIGenerateModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<any[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setText(''); setError(''); setDrafts(null); setLoading(false);
    fetch('/api/ai-usage')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.remaining === 'number') setRemaining(d.remaining); })
      .catch(() => {});
  }, [isOpen]);

  const inputText = mode === 'text' ? text : (sourceText || '');
  const canGenerate = mode === 'text' ? text.trim().length >= minChars : !sourceEmpty;

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: inputText, type: aiType }),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (payload.needsSubscription) throw new Error('An active subscription is required to use AI generation.');
        if (payload.limitReached) throw new Error('You have reached your AI generation limit for this month.');
        throw new Error(payload.error || 'Generation failed. Please try again.');
      }
      if (typeof payload.remaining === 'number') setRemaining(payload.remaining);
      const items = parseResult(payload.data);
      if (!items || !items.length) throw new Error('The AI returned no usable items. Try refining your input.');
      setDrafts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (drafts) onAccept(drafts);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      }
      footer={
        drafts === null ? (
          <>
            <ToolbarButton onClick={onClose}>Cancel</ToolbarButton>
            <AIButton onClick={generate} disabled={!canGenerate || loading}>
              {loading ? 'Generating…' : 'Generate'}
            </AIButton>
          </>
        ) : (
          <>
            <ToolbarButton onClick={() => setDrafts(null)} icon={RotateCcw}>Regenerate</ToolbarButton>
            <PrimaryButton onClick={save}>Save {drafts.length} {itemNoun}</PrimaryButton>
          </>
        )
      }
    >
      {drafts === null ? (
        <div className="space-y-4">
          {mode === 'text' ? (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {textLabel || 'Describe your project'}
              </label>
              <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={textPlaceholder}
                className="min-h-[160px]"
                disabled={loading}
              />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {text.trim().length < minChars
                  ? `Add at least ${minChars - text.trim().length} more characters.`
                  : 'Ready to generate.'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {sourceEmpty ? (
                <p className="text-sm" style={{ color: 'var(--warning)' }}>{sourceEmptyMessage || 'No source data available yet.'}</p>
              ) : (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{sourceSummary}</div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating with AI…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {remaining !== null && (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {remaining} AI generation{remaining === 1 ? '' : 's'} left this month · results are drafts you review before saving.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC' }}>
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            {drafts.length} {itemNoun} generated. Review and save.
          </div>
          {renderPreview(drafts)}
        </div>
      )}
    </Modal>
  );
}
