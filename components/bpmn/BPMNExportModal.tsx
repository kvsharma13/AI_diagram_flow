'use client';

import { useState } from 'react';
import { X, Download, Image as ImageIcon, FileCode } from 'lucide-react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { exportToBPMNXml } from '@/lib/bpmn/bpmnXmlParser';
import { BPMNDiagram } from '@/types/project';

interface BPMNExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagramRef: React.RefObject<HTMLDivElement | null>;
  diagram: BPMNDiagram;
  fileName: string;
}

type ExportFormat = 'png' | 'jpg' | 'svg' | 'bpmn';

export default function BPMNExportModal({ isOpen, onClose, diagramRef, diagram, fileName }: BPMNExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      if (format === 'bpmn') {
        const xml = exportToBPMNXml(diagram);
        const blob = new Blob([xml], { type: 'application/xml' });
        const link = document.createElement('a');
        link.download = `${fileName}.bpmn`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        onClose();
        return;
      }

      if (!diagramRef.current) { alert('No diagram to export'); return; }

      const viewport = diagramRef.current.querySelector('.react-flow__viewport')?.parentElement as HTMLElement || diagramRef.current;

      // Fix SVG edge paths before export: html-to-image loses inline styles on SVG paths,
      // causing them to render as thick black blobs. Set attributes directly.
      const edgePaths = viewport.querySelectorAll('.react-flow__edge-path');
      const originalStyles: { el: Element; fill: string; stroke: string; strokeWidth: string }[] = [];
      edgePaths.forEach((path) => {
        const el = path as SVGPathElement;
        originalStyles.push({
          el,
          fill: el.getAttribute('fill') || '',
          stroke: el.getAttribute('stroke') || '',
          strokeWidth: el.getAttribute('stroke-width') || '',
        });
        if (!el.getAttribute('fill') || el.getAttribute('fill') === 'none') {
          el.setAttribute('fill', 'none');
        }
        if (!el.getAttribute('stroke')) {
          el.setAttribute('stroke', '#6b7280');
        }
        if (!el.getAttribute('stroke-width')) {
          el.setAttribute('stroke-width', '2');
        }
      });

      const options = {
        backgroundColor: '#ffffff',
        quality: format === 'jpg' ? 0.95 : 1.0,
        pixelRatio: 2,
        filter: (node: HTMLElement) => {
          const className = node.className || '';
          if (typeof className === 'string') {
            return !(className.includes('react-flow__controls') || className.includes('react-flow__minimap') || className.includes('react-flow__attribution'));
          }
          return true;
        },
      };

      let dataUrl: string;
      if (format === 'png') dataUrl = await toPng(viewport, options);
      else if (format === 'jpg') dataUrl = await toJpeg(viewport, options);
      else dataUrl = await toSvg(viewport, options);

      // Restore original attributes
      originalStyles.forEach(({ el, fill, stroke, strokeWidth }) => {
        if (fill) el.setAttribute('fill', fill); else el.removeAttribute('fill');
        if (stroke) el.setAttribute('stroke', stroke); else el.removeAttribute('stroke');
        if (strokeWidth) el.setAttribute('stroke-width', strokeWidth); else el.removeAttribute('stroke-width');
      });

      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = dataUrl;
      link.click();
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Export Diagram</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {(['png', 'jpg', 'svg', 'bpmn'] as ExportFormat[]).map((fmt) => (
              <button key={fmt} onClick={() => setFormat(fmt)}
                className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${format === fmt ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {format === 'bpmn' ? 'Export as BPMN 2.0 XML for use in other BPMN tools.' : `Export as ${format.toUpperCase()} image at 2x resolution.`}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg transition-all">
            {exporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
