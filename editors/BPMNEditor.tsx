'use client';

import { useState, useRef, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { BPMNNodeType, BPMNNode, BPMNEdge, BPMNSwimlane } from '@/types/project';
import BPMNCanvas from '@/components/bpmn/BPMNCanvas';
import BPMNToolbar from '@/components/bpmn/BPMNToolbar';
import BPMNPropertiesPanel from '@/components/bpmn/BPMNPropertiesPanel';
import BPMNImportModal from '@/components/bpmn/BPMNImportModal';
import BPMNExportModal from '@/components/bpmn/BPMNExportModal';
import BPMNAIImportModal from '@/components/bpmn/BPMNAIImportModal';
import { applyBPMNLayout } from '@/lib/bpmn/elkLayout';
import { LayoutGrid, Download, Upload, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function BPMNEditor() {
  const {
    project,
    setBPMNNodes,
    setBPMNEdges,
    addBPMNNode,
    updateBPMNNode,
    deleteBPMNNode,
    addBPMNEdge,
    deleteBPMNEdge,
    addBPMNSwimlane,
    updateBPMNSwimlane,
    deleteBPMNSwimlane,
    setBPMNDiagram,
  } = useProjectStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!project) return null;

  const diagram = project.bpmnDiagram || { nodes: [], edges: [], swimlanes: [] };
  const nodes = diagram.nodes;
  const edges = diagram.edges;
  const swimlanes = diagram.swimlanes;

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null;
  const selectedEdge = selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) || null : null;
  const selectedSwimlane = selectedNodeId ? swimlanes.find((s) => s.id === selectedNodeId) || null : null;

  const handleAddNode = (type: BPMNNodeType) => {
    const taskTypes = ['task', 'userTask', 'serviceTask', 'scriptTask'];
    const gatewayTypes = ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway'];

    const defaultLabels: Record<string, string> = {
      startEvent: 'Start',
      endEvent: 'End',
      task: 'Task',
      userTask: 'User Task',
      serviceTask: 'Service Task',
      scriptTask: 'Script Task',
      exclusiveGateway: 'XOR',
      parallelGateway: 'AND',
      inclusiveGateway: 'OR',
      subProcess: 'Sub-Process',
      intermediateEvent: 'Timer',
      dataObject: 'Document',
      dataStore: 'Data Store',
      textAnnotation: 'Note',
    };

    // Position near center with some randomness
    const x = 200 + Math.random() * 400;
    const y = 100 + Math.random() * 200;

    addBPMNNode({
      type,
      label: defaultLabels[type] || type,
      position: { x, y },
      data: taskTypes.includes(type) ? { taskType: type } : gatewayTypes.includes(type) ? { gatewayType: type } : {},
    });
  };

  const handleAddSwimlane = () => {
    addBPMNSwimlane({
      label: `Lane ${swimlanes.length + 1}`,
      role: `Role ${swimlanes.length + 1}`,
      color: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][swimlanes.length % 5],
      order: swimlanes.length,
    });
  };

  const handleAutoLayout = async () => {
    if (nodes.length === 0) return;
    setIsLayouting(true);
    try {
      const layoutedNodes = await applyBPMNLayout(nodes, edges, swimlanes);
      setBPMNNodes(layoutedNodes);
    } catch (error) {
      console.error('Auto-layout failed:', error);
    } finally {
      setIsLayouting(false);
    }
  };

  const handleUpdateEdge = (id: string, updates: Partial<BPMNEdge>) => {
    const updatedEdges = edges.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setBPMNEdges(updatedEdges);
  };

  const handleImport = (data: any) => {
    const importedNodes = (data.nodes || []).map((n: any) => ({ ...n, id: n.id || uuidv4() }));
    const importedEdges = (data.edges || []).map((e: any) => ({ ...e, id: e.id || uuidv4() }));
    const importedSwimlanes = (data.swimlanes || []).map((s: any) => ({ ...s, id: s.id || uuidv4() }));
    setBPMNDiagram({ nodes: importedNodes, edges: importedEdges, swimlanes: importedSwimlanes });
  };

  const handleAIImport = async (data: any) => {
    const importedNodes = (data.nodes || []).map((n: any) => ({ ...n, id: n.id || uuidv4() }));
    const importedEdges = (data.edges || []).map((e: any) => ({ ...e, id: e.id || uuidv4() }));
    const importedSwimlanes = (data.swimlanes || []).map((s: any) => ({ ...s, id: s.id || uuidv4() }));

    // Auto-layout after AI generation
    try {
      const layoutedNodes = await applyBPMNLayout(importedNodes, importedEdges, importedSwimlanes);
      setBPMNDiagram({ nodes: layoutedNodes, edges: importedEdges, swimlanes: importedSwimlanes });
    } catch {
      setBPMNDiagram({ nodes: importedNodes, edges: importedEdges, swimlanes: importedSwimlanes });
    }
  };

  const handleCloseProperties = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleAutoLayout}
          disabled={isLayouting || nodes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          {isLayouting ? 'Laying out...' : 'Auto-Layout'}
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={() => setShowAIModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          AI Generate
        </button>
        <div className="ml-auto text-xs text-gray-400">
          {nodes.length} nodes · {edges.length} edges · {swimlanes.length} lanes
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <BPMNToolbar onAddNode={handleAddNode} onAddSwimlane={handleAddSwimlane} />

        {/* Canvas */}
        <div className="flex-1" ref={canvasRef} id="bpmn-export-area">
          <BPMNCanvas
            nodes={nodes}
            edges={edges}
            swimlanes={swimlanes}
            onNodesChange={setBPMNNodes}
            onEdgesChange={setBPMNEdges}
            onNodeSelect={(id) => { setSelectedNodeId(id); setSelectedEdgeId(null); }}
            onEdgeSelect={(id) => { setSelectedEdgeId(id); setSelectedNodeId(null); }}
          />
        </div>

        {/* Properties Panel */}
        <BPMNPropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          selectedSwimlane={selectedSwimlane}
          swimlanes={swimlanes}
          onUpdateNode={updateBPMNNode}
          onUpdateEdge={handleUpdateEdge}
          onUpdateSwimlane={updateBPMNSwimlane}
          onDeleteNode={(id) => { deleteBPMNNode(id); setSelectedNodeId(null); }}
          onDeleteEdge={(id) => { deleteBPMNEdge(id); setSelectedEdgeId(null); }}
          onDeleteSwimlane={(id) => { deleteBPMNSwimlane(id); setSelectedNodeId(null); }}
          onClose={handleCloseProperties}
        />
      </div>

      {/* Modals */}
      <BPMNImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImport} />
      <BPMNExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} diagramRef={canvasRef} diagram={diagram} fileName={`${project.name}-bpmn`} />
      <BPMNAIImportModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} onImport={handleAIImport} />
    </div>
  );
}
