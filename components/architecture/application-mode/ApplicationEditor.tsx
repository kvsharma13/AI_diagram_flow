'use client';

import { useState, useEffect, useRef } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import { generateMermaidFromApplication } from '@/lib/architecture/mermaidGenerator';
import MermaidPreview from './MermaidPreview';
import ExportModal from '../ExportModal';
import { Copy, Download, Plus, Layers as LayersIcon, Code, Eye } from 'lucide-react';

export default function ApplicationEditor() {
  const { diagram, setLayers, setNodes, setEdges, setMermaidCode } = useArchitectureStore();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const diagramRef = useRef<HTMLDivElement>(null);

  // Load default template
  useEffect(() => {
    if (diagram && diagram.nodes.length === 0) {
      loadDefaultTemplate();
    }
  }, []);

  // Generate Mermaid code when nodes/edges/layers change
  useEffect(() => {
    if (diagram && diagram.nodes.length > 0) {
      const generated = generateMermaidFromApplication(
        diagram.nodes,
        diagram.edges,
        diagram.layers
      );
      setCode(generated);
      setMermaidCode(generated);
    }
  }, [diagram?.nodes, diagram?.edges, diagram?.layers]);

  const loadDefaultTemplate = () => {
    const defaultLayers = [
      { id: 'client', name: 'Client Layer', color: '#61DAFB' },
      { id: 'api', name: 'API Layer', color: '#68A063' },
      { id: 'application', name: 'Application Layer', color: '#8B5CF6' },
      { id: 'services', name: 'Services Layer', color: '#F59E0B' },
      { id: 'data', name: 'Data Layer', color: '#336791' },
      { id: 'external', name: 'External Systems', color: '#EC4899' },
    ];

    const defaultNodes = [
      { id: 'web', label: 'Web App', type: 'frontend', layerId: 'client', position: { x: 100, y: 100 } },
      { id: 'mobile', label: 'Mobile App', type: 'frontend', layerId: 'client', position: { x: 300, y: 100 } },
      { id: 'gateway', label: 'API Gateway', type: 'api', layerId: 'api', position: { x: 200, y: 250 } },
      { id: 'api', label: 'REST API', type: 'api', layerId: 'application', position: { x: 100, y: 400 } },
      { id: 'graphql', label: 'GraphQL API', type: 'api', layerId: 'application', position: { x: 300, y: 400 } },
      { id: 'campaign', label: 'Campaign Service', type: 'service', layerId: 'services', position: { x: 100, y: 550 } },
      { id: 'user', label: 'User Service', type: 'service', layerId: 'services', position: { x: 300, y: 550 } },
      { id: 'postgres', label: 'PostgreSQL', type: 'database', layerId: 'data', position: { x: 100, y: 700 } },
      { id: 'redis', label: 'Redis', type: 'cache', layerId: 'data', position: { x: 300, y: 700 } },
      { id: 'email', label: 'Email Service', type: 'external', layerId: 'external', position: { x: 200, y: 850 } },
    ];

    const defaultEdges = [
      { id: 'e1', source: 'web', target: 'gateway', animated: true },
      { id: 'e2', source: 'mobile', target: 'gateway', animated: true },
      { id: 'e3', source: 'gateway', target: 'api', animated: false },
      { id: 'e4', source: 'gateway', target: 'graphql', animated: false },
      { id: 'e5', source: 'api', target: 'campaign', animated: false },
      { id: 'e6', source: 'api', target: 'user', animated: false },
      { id: 'e7', source: 'campaign', target: 'postgres', animated: false },
      { id: 'e8', source: 'user', target: 'postgres', animated: false },
      { id: 'e9', source: 'user', target: 'redis', animated: false },
      { id: 'e10', source: 'campaign', target: 'email', animated: true },
    ];

    setLayers(defaultLayers);
    setNodes(defaultNodes);
    setEdges(defaultEdges);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.mmd';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex">
      {/* Left: Code Editor */}
      {showCode && (
        <div className="w-1/2 flex flex-col bg-gray-900 border-r border-gray-700">
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">Application Architecture Code</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadDefaultTemplate}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Load Template
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Code
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setMermaidCode(e.target.value);
          }}
          className="flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
          style={{
            lineHeight: '1.6',
            tabSize: 4,
          }}
          spellCheck={false}
          placeholder="Mermaid code will appear here..."
        />

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-gray-400 text-xs">
          <p>Application Architecture - Logical layer-based view</p>
        </div>
        </div>
      )}

      {/* Right: Mermaid Preview */}
      <div className={showCode ? 'w-1/2' : 'flex-1'}>
        <MermaidPreview code={code} diagramRef={diagramRef} showCodeToggle={true} onToggleCode={() => setShowCode(!showCode)} showCode={showCode} />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        diagramRef={diagramRef}
        fileName="application-architecture"
      />
    </div>
  );
}
