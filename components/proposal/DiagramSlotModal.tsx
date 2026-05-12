'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, AlertCircle, RotateCcw, ImageIcon } from 'lucide-react';
import { DiagramToken, DiagramSlotData, getMermaidTemplate, getTypeLabel } from '@/lib/proposal/diagramTokens';

interface DiagramSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: DiagramToken;
  existingData?: DiagramSlotData | null;
  onInsert: (uid: string, data: DiagramSlotData) => void;
}

async function svgToPng(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = (img.naturalWidth || 900) * scale;
      canvas.height = (img.naturalHeight || 500) * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject(new Error('SVG to PNG conversion failed'));
    img.src = url;
  });
}

export default function DiagramSlotModal({ isOpen, onClose, token, existingData, onInsert }: DiagramSlotModalProps) {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [svg, setSvg] = useState('');
  const [renderError, setRenderError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const renderIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    const code = existingData?.mermaidCode || getMermaidTemplate(token.type);
    setMermaidCode(code);
    setDescription('');
    setSvg('');
    setRenderError('');
    setGenerateError('');
  }, [isOpen, token.uid]);

  // Debounced Mermaid render on code change
  useEffect(() => {
    if (!mermaidCode.trim()) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const renderId = ++renderIdRef.current;
      const elemId = `mermaid-slot-${token.uid}-${renderId}`;
      import('mermaid').then(({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
        mermaid.render(elemId, mermaidCode)
          .then(({ svg: rendered }) => {
            if (renderIdRef.current === renderId) { setSvg(rendered); setRenderError(''); }
          })
          .catch(err => {
            if (renderIdRef.current === renderId) {
              setRenderError(typeof err === 'string' ? err : 'Syntax error — check your Mermaid code');
              setSvg('');
            }
          });
      });
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [mermaidCode]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setGenerateError('');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput: `Generate a Mermaid diagram for the section titled "${token.label}".\nDiagram type: ${token.type}\nDescription: ${description}\n\nReturn ONLY raw Mermaid code — no code fences, no explanation.`,
          type: 'mermaid_diagram',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Generation failed');
      const result = await res.json();
      const code = typeof result.data === 'string' ? result.data.trim() : '';
      // Strip markdown fences if present
      const cleaned = code.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim();
      if (cleaned) setMermaidCode(cleaned);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = async () => {
    if (!svg) return;
    setIsInserting(true);
    try {
      const snapshot = await svgToPng(svg);
      onInsert(token.uid, { type: token.type, label: token.label, snapshot, mermaidCode });
      onClose();
    } catch (err) {
      console.error('Insert failed:', err);
    } finally {
      setIsInserting(false);
    }
  };

  if (!isOpen) return null;

  const typeLabel = getTypeLabel(token.type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {existingData?.snapshot ? 'Replace' : 'Create'} Diagram
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{token.label}</span>
              <span className="mx-2 text-gray-300">·</span>
              <span>{typeLabel}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body — split panel */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* Left — code editor */}
          <div className="w-[42%] flex flex-col border-r border-gray-200 overflow-y-auto">
            {/* AI generate */}
            <div className="p-5 border-b border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generate with AI</p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder={`Describe what this ${typeLabel.toLowerCase()} should show…\ne.g. Show the data flow from invoice intake through AI extraction, validation, and Oracle posting with confidence scoring`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                  : <><Sparkles className="w-4 h-4" />Generate Diagram</>}
              </button>
              {generateError && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {generateError}
                </div>
              )}
            </div>

            {/* Mermaid editor */}
            <div className="flex-1 p-5 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mermaid Code</p>
                <button
                  onClick={() => setMermaidCode(getMermaidTemplate(token.type))}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to template
                </button>
              </div>
              <textarea
                value={mermaidCode}
                onChange={e => setMermaidCode(e.target.value)}
                spellCheck={false}
                className="flex-1 min-h-[280px] px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-gray-50 leading-relaxed"
              />
              <p className="text-xs text-gray-400">
                Edit Mermaid code directly or use AI to generate it. Preview updates automatically.
              </p>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
              {svg && <span className="text-xs text-green-600 font-medium">✓ Ready to insert</span>}
            </div>
            <div className="flex-1 overflow-auto p-5">
              {renderError ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-red-700 mb-1">Syntax Error</p>
                    <p className="text-xs text-red-500 font-mono bg-red-50 rounded p-2">{renderError}</p>
                  </div>
                </div>
              ) : svg ? (
                <div
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Describe your diagram or edit the Mermaid code to see a preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-400">
            {existingData?.snapshot ? 'Inserting will replace the existing diagram in this slot.' : 'The diagram will be embedded at the placeholder location in your document.'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!svg || isInserting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
            >
              {isInserting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Inserting...</>
                : 'Insert Diagram'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
