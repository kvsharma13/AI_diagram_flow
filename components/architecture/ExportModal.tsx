'use client';

import { useState } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import { toPng, toJpeg, toSvg } from 'html-to-image';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagramRef: React.RefObject<HTMLDivElement | null>;
  fileName: string;
}

type ExportFormat = 'png' | 'jpg' | 'svg';
type BackgroundTheme = 'light' | 'dark';

export default function ExportModal({ isOpen, onClose, diagramRef, fileName }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [theme, setTheme] = useState<BackgroundTheme>('dark');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!diagramRef.current) {
      alert('No diagram to export');
      return;
    }

    setExporting(true);

    const bg = theme === 'light' ? '#F4F6FB' : '#0B0F1A';
    const capture = (el: HTMLElement, extra: Record<string, any>) => {
      const opts = { backgroundColor: bg, cacheBust: true, pixelRatio: 2, ...extra };
      if (format === 'jpg') return toJpeg(el, { ...opts, quality: 0.95 });
      if (format === 'svg') return toSvg(el, opts);
      return toPng(el, opts);
    };
    const download = (dataUrl: string) => {
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      link.click();
    };

    try {
      const root = diagramRef.current;
      const viewport = root.querySelector('.react-flow__viewport') as HTMLElement | null;

      // Mermaid / SVG diagrams: capture the SVG container directly.
      if (!viewport) {
        const svg = root.querySelector('svg');
        const el = (svg?.parentElement as HTMLElement) || root;
        download(await capture(el, {}));
        onClose();
        return;
      }

      // React Flow: measure the WHOLE graph in flow coordinates, then capture the
      // viewport at 1:1 scale — so the export is the full diagram at full size and
      // resolution, independent of the current zoom/pan (the old code captured the
      // visible box at the current zoom, which made everything tiny).
      const parent = viewport.parentElement as HTMLElement;
      const pRect = parent.getBoundingClientRect();
      const tr = getComputedStyle(viewport).transform;
      const m = tr && tr !== 'none' ? new DOMMatrix(tr) : new DOMMatrix();
      const k = m.a || 1;
      const tx = m.e;
      const ty = m.f;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      viewport.querySelectorAll('.react-flow__node').forEach((n) => {
        const r = (n as HTMLElement).getBoundingClientRect();
        const fx = (r.left - pRect.left - tx) / k;
        const fy = (r.top - pRect.top - ty) / k;
        minX = Math.min(minX, fx);
        minY = Math.min(minY, fy);
        maxX = Math.max(maxX, fx + r.width / k);
        maxY = Math.max(maxY, fy + r.height / k);
      });
      if (!isFinite(minX)) throw new Error('No nodes to export');

      const pad = 60;
      minX -= pad; minY -= pad; maxX += pad; maxY += pad;
      const W = Math.ceil(maxX - minX);
      const H = Math.ceil(maxY - minY);

      download(
        await capture(viewport, {
          width: W,
          height: H,
          style: {
            width: `${W}px`,
            height: `${H}px`,
            transform: `translate(${-minX}px, ${-minY}px) scale(1)`,
            transformOrigin: '0 0',
          },
        })
      );
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again. Make sure the diagram is fully loaded.');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Export Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Options */}
          <div className="grid grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-white font-semibold block">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpg', 'svg'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      format === fmt
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <label className="text-white font-semibold block">Background Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-white text-black shadow-lg ring-2 ring-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-400"></div>
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gray-900 text-white shadow-lg ring-2 ring-gray-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-500"></div>
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg p-4 bg-blue-900/20 border border-blue-600">
            <p className="text-sm text-blue-300">
              <strong>💡 Tip:</strong> {format === 'svg'
                ? 'SVG format is vector-based and can be scaled without quality loss.'
                : `${format.toUpperCase()} format is exported at 2x resolution for high quality.`}
            </p>
          </div>

          {/* Note */}
          <div className="rounded-lg p-4 bg-green-900/20 border border-green-600">
            <p className="text-sm text-green-300">
              <strong>✓ Note:</strong> The export will capture your entire diagram including all nodes and connections,
              regardless of the current zoom or pan position.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            File: <span className="text-white font-mono">{fileName}.{format}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
