'use client';

import { useEffect, useRef, useState } from 'react';
import type mermaidAPI from 'mermaid';
import { Download, ZoomIn, ZoomOut, RotateCcw, Code, Eye, AlertCircle, X } from 'lucide-react';

interface Props {
  code: string;
  diagramRef?: React.RefObject<HTMLDivElement | null>;
  showCodeToggle?: boolean;
  onToggleCode?: () => void;
  showCode?: boolean;
}

export default function MermaidPreview({ code, diagramRef: externalDiagramRef, showCodeToggle = false, onToggleCode, showCode = true }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const internalDiagramRef = useRef<HTMLDivElement>(null);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const diagramRef = externalDiagramRef || internalDiagramRef;
  const mermaidRef = useRef<typeof mermaidAPI | null>(null);

  // Initialize mermaid
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaidRef.current = mermaid;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        setMermaidLoaded(true);
      } catch (err) {
        console.error('Failed to load mermaid:', err);
        setError('Failed to load diagram library');
      }
    };

    loadMermaid();
  }, []);

  // Render diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !mermaidContainerRef.current || !mermaidLoaded || !mermaidRef.current) return;

      const container = mermaidContainerRef.current;

      try {
        setError(null);
        setShowErrorPopup(false);
        container.innerHTML = '';

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaidRef.current.render(id, code);
        container.innerHTML = svg;

        // Also update the export ref if provided
        if (externalDiagramRef?.current) {
          externalDiagramRef.current = container;
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);

        // Clear any partial renders or mermaid error messages
        container.innerHTML = '';

        // Extract clean error message
        let errorMessage = 'Syntax error in diagram code';
        if (err?.message) {
          errorMessage = err.message
            .replace(/^Error: /, '')
            .replace(/Lexical error.*$/m, 'Invalid syntax in diagram code')
            .replace(/Parse error.*$/m, 'Syntax error - check your code')
            .split('\n')[0];
        }

        setError(errorMessage);
        setShowErrorPopup(true);

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setShowErrorPopup(false);
        }, 5000);
      }
    };

    const debounce = setTimeout(renderDiagram, 500);
    return () => clearTimeout(debounce);
  }, [code, mermaidLoaded, externalDiagramRef]);

  const handleDownloadSVG = () => {
    const svg = mermaidContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'application-architecture.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-white font-semibold">Live Preview</span>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400 font-medium">Syntax Error</span>}

          {/* Code Toggle */}
          {showCodeToggle && (
            <button
              onClick={onToggleCode}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                showCode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={showCode ? 'Hide Code' : 'Show Code'}
            >
              {showCode ? (
                <>
                  <Eye className="w-3 h-3" />
                  Full Preview
                </>
              ) : (
                <>
                  <Code className="w-3 h-3" />
                  Show Code
                </>
              )}
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 px-2 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            <Download className="w-3 h-3" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div
        ref={diagramRef}
        className="flex-1 overflow-auto p-8 flex items-center justify-center relative"
      >
        {!mermaidLoaded ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-400">Loading renderer...</p>
          </div>
        ) : (
          <div
            ref={mermaidContainerRef}
            className="mermaid-container max-w-full"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        )}

        {/* Error Popup Notification */}
        {showErrorPopup && error && (
          <div className="fixed top-4 right-4 max-w-md bg-red-900 border-2 border-red-500 rounded-lg shadow-2xl p-4 animate-in slide-in-from-top-2 z-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-200 font-semibold mb-1">Syntax Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <p className="text-red-400 text-xs mt-2">Check your Mermaid code and fix the syntax.</p>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-red-400 hover:text-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
