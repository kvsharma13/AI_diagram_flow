'use client';

import { useState, useEffect, useRef } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import ReactFlowCanvas from './ReactFlowCanvas';
import NodeSidebar from './NodeSidebar';
import ExportModal from '../ExportModal';
import {
  parseInfrastructureCode,
  generateNodesAndEdges,
  DEFAULT_INFRASTRUCTURE_CODE,
} from '@/lib/architecture/infrastructureCodeGenerator';
import { Download, Code, Trash2, Play, Eye, FileCode, ArrowDownUp, ArrowLeftRight } from 'lucide-react';

export default function InfrastructureEditor() {
  const { diagram, setNodes, setEdges } = useArchitectureStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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

  const handleLayoutChange = () => {
    const newDirection = layoutDirection === 'horizontal' ? 'vertical' : 'horizontal';
    setLayoutDirection(newDirection);

    // Apply layout to nodes
    if (diagram && diagram.nodes.length > 0) {
      const layoutedNodes = applyDagreLayout(
        diagram.nodes,
        diagram.edges,
        newDirection
      );
      setNodes(layoutedNodes);
    }
  };

  const applyDagreLayout = (
    nodes: any[],
    edges: any[],
    direction: 'horizontal' | 'vertical'
  ) => {
    const dagre = require('dagre');
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 150;

    dagreGraph.setGraph({
      rankdir: direction === 'horizontal' ? 'LR' : 'TB',
      nodesep: 100,
      ranksep: 150,
    });

    // Add nodes (skip group nodes for layout)
    nodes.forEach((node) => {
      if (node.type !== 'group') {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      }
    });

    // Add edges
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // Update node positions
    return nodes.map((node) => {
      if (node.type === 'group') {
        return node; // Keep group nodes as is
      }

      const nodeWithPosition = dagreGraph.node(node.id);
      if (nodeWithPosition) {
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
          },
        };
      }
      return node;
    });
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
    <div className="h-full flex">
      {/* Sidebar or Code Panel */}
      {viewMode === 'visual' ? (
        <NodeSidebar />
      ) : (
        <div className="w-1/2 flex flex-col bg-gray-900 border-r border-gray-700">
          {/* Code Editor Toolbar */}
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold">Infrastructure Code</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadTemplate('aws')}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium"
                >
                  AWS Template
                </button>
                <button
                  onClick={() => loadTemplate('microservices')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                >
                  Microservices
                </button>
                <button
                  onClick={handleGenerateFromCode}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                >
                  <Play className="w-3 h-3" />
                  Generate
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Define groups, nodes, and connections. Click Generate to create diagram.
            </p>
          </div>

          {/* Code Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
            style={{ lineHeight: '1.6', tabSize: 2 }}
            spellCheck={false}
          />

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-gray-400 text-xs">
            <p>💡 Use simple YAML-like syntax to define your infrastructure</p>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Infrastructure Architecture</span>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-900 p-1 rounded">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'visual'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Visual
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'code'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  Code
                </button>
              </div>

              {/* Layout Direction Toggle */}
              <button
                onClick={handleLayoutChange}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
                title="Toggle layout direction and auto-arrange nodes"
              >
                {layoutDirection === 'horizontal' ? (
                  <>
                    <ArrowLeftRight className="w-3 h-3" />
                    Horizontal
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="w-3 h-3" />
                    Vertical
                  </>
                )}
              </button>

              {selectedNodeId && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium"
              >
                <Code className="w-3 h-3" />
                JSON
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={canvasRef}>
          <ReactFlowCanvas
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            showCodePanel={showCodePanel}
            layoutDirection={layoutDirection}
            onDeleteNode={handleDeleteSelected}
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
