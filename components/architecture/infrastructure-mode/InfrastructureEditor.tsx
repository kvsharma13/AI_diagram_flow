'use client';

import { useState, useEffect, useRef } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import ReactFlowCanvas from './ReactFlowCanvas';
import ExportModal from '../ExportModal';
import {
  parseInfrastructureCode,
  generateNodesAndEdges,
  DEFAULT_INFRASTRUCTURE_CODE,
} from '@/lib/architecture/infrastructureCodeGenerator';
import { Download, Code, Trash2, Play, Eye, FileCode, ArrowDownUp, ArrowLeftRight, X, Shapes } from 'lucide-react';
import { applyElkLayout } from '@/lib/architecture/elkLayout';
import NodeSidebarDropdown from './NodeSidebar';

export default function InfrastructureEditor() {
  const { diagram, setNodes, setEdges } = useArchitectureStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [code, setCode] = useState(DEFAULT_INFRASTRUCTURE_CODE);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load default template
  useEffect(() => {
    if (diagram && diagram.nodes.length === 0) {
      handleGenerateFromCode();
    }
  }, []);

  const handleGenerateFromCode = () => {
    try {
      const infraCode = parseInfrastructureCode(code);
      const { nodes, edges } = generateNodesAndEdges(infraCode);
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error('Failed to generate diagram:', error);
      alert('Failed to generate diagram. Please check your code syntax.');
    }
  };

  const handleExportJSON = () => {
    if (!diagram) return;
    const dataStr = JSON.stringify(
      { nodes: diagram.nodes, edges: diagram.edges },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infrastructure-architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId && diagram) {
      const newNodes = diagram.nodes.filter((n) => n.id !== selectedNodeId);
      const newEdges = diagram.edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      );
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNodeId(null);
    }
  };

  const handleLayoutChange = async () => {
    const newDirection = layoutDirection === 'horizontal' ? 'vertical' : 'horizontal';
    setLayoutDirection(newDirection);

    // Apply ELK layout to nodes
    if (diagram && diagram.nodes.length > 0) {
      try {
        const result = await applyElkLayout(
          diagram.nodes,
          diagram.edges,
          newDirection
        );
        setNodes(result.nodes);
      } catch (error) {
        console.error('ELK layout failed:', error);
      }
    }
  };

  const loadTemplate = (template: string) => {
    const templates: Record<string, string> = {
      aws: DEFAULT_INFRASTRUCTURE_CODE,
      microservices: `# Microservices Infrastructure
groups:
  - id: backend
    name: BACKEND SERVICES
    color: "#3b82f6"
    position: { x: 200, y: 50 }
    size: { width: 600, height: 400 }

nodes:
  - id: gateway
    label: API Gateway
    type: api-gateway
    icon: globe
    iconColor: "#ec4899"
    position: { x: 50, y: 200 }

  - id: auth
    label: Auth Service
    type: server
    icon: auth
    iconColor: "#6DB33F"
    group: backend
    position: { x: 100, y: 100 }

  - id: user
    label: User Service
    type: server
    icon: server
    iconColor: "#f97316"
    group: backend
    position: { x: 300, y: 100 }

  - id: order
    label: Order Service
    type: server
    icon: server
    iconColor: "#f97316"
    group: backend
    position: { x: 100, y: 250 }

  - id: payment
    label: Payment Service
    type: server
    icon: server
    iconColor: "#f97316"
    group: backend
    position: { x: 300, y: 250 }

  - id: db
    label: Database
    type: database
    icon: database
    iconColor: "#3b82f6"
    position: { x: 900, y: 200 }

connections:
  - from: gateway
    to: auth
    animated: true
  - from: gateway
    to: user
    animated: true
  - from: gateway
    to: order
    animated: true
  - from: gateway
    to: payment
    animated: true
  - from: user
    to: db
  - from: order
    to: db
  - from: payment
    to: db
`,
    };

    const selectedTemplate = templates[template] || DEFAULT_INFRASTRUCTURE_CODE;
    setCode(selectedTemplate);

    // Auto-generate after loading template
    setTimeout(() => {
      const infraCode = parseInfrastructureCode(selectedTemplate);
      const { nodes, edges } = generateNodesAndEdges(infraCode);
      setNodes(nodes);
      setEdges(edges);
    }, 100);
  };

  return (
    <div className="h-full flex relative">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Toolbar */}
        <div className="bg-slate-900/60 px-3 py-1.5 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            {/* Left — Icons toggle */}
            <button
              onClick={() => setShowIcons(!showIcons)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                showIcons
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shapes className="w-3.5 h-3.5" />
              Icons
            </button>

            {/* Right — actions */}
            <div className="flex items-center gap-0.5">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-800/50 p-0.5 rounded">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'visual'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Visual mode"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'code'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Code editor"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-px h-4 bg-slate-700/50 mx-1" />

              {/* Layout */}
              <button
                onClick={handleLayoutChange}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title={`Auto-layout: ${layoutDirection}`}
              >
                {layoutDirection === 'horizontal' ? (
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownUp className="w-3.5 h-3.5" />
                )}
              </button>

              {selectedNodeId && (
                <>
                  <div className="w-px h-4 bg-slate-700/50 mx-1" />
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                    title="Delete selected"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <div className="w-px h-4 bg-slate-700/50 mx-1" />

              {/* Export */}
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Export JSON"
              >
                <FileCode className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Export image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Icons dropdown panel */}
        {showIcons && (
          <NodeSidebarDropdown onClose={() => setShowIcons(false)} />
        )}

        {/* Canvas */}
        <div className="flex-1" ref={canvasRef}>
          <ReactFlowCanvas
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            showCodePanel={viewMode === 'code'}
            onDeleteNode={handleDeleteSelected}
          />
        </div>
      </div>

      {/* Slide-over Code Panel */}
      <div
        className="absolute top-0 right-0 h-full z-40 flex transition-transform duration-300 ease-in-out"
        style={{
          width: '480px',
          transform: viewMode === 'code' ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="flex-1 flex flex-col bg-slate-900 border-l border-slate-800/50 shadow-2xl">
          {/* Code Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium text-xs">Infrastructure Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadTemplate('aws')}
                className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-[10px] font-medium transition-colors"
              >
                Template
              </button>
              <button
                onClick={handleGenerateFromCode}
                className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-medium transition-colors"
              >
                <Play className="w-3 h-3" />
                Generate
              </button>
              <button
                onClick={() => setViewMode('visual')}
                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-xs resize-none focus:outline-none bg-slate-900 text-slate-300"
            style={{ lineHeight: '1.6', tabSize: 2 }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        diagramRef={canvasRef}
        fileName="infrastructure-architecture"
      />
    </div>
  );
}
