'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { bpmnNodeTypes } from './nodes';
import { bpmnEdgeTypes } from './edges';
import { BPMNNode, BPMNEdge, BPMNSwimlane } from '@/types/project';

interface BPMNCanvasProps {
  nodes: BPMNNode[];
  edges: BPMNEdge[];
  swimlanes: BPMNSwimlane[];
  onNodesChange: (nodes: BPMNNode[]) => void;
  onEdgesChange: (edges: BPMNEdge[]) => void;
  onNodeSelect: (id: string | null) => void;
  onEdgeSelect: (id: string | null) => void;
}

export default function BPMNCanvas({
  nodes, edges, swimlanes, onNodesChange, onEdgesChange, onNodeSelect, onEdgeSelect,
}: BPMNCanvasProps) {
  const prevNodeIdsRef = useRef<string>('');

  // Convert BPMNNode[] to ReactFlow Node[]
  const convertedNodes: RFNode[] = useMemo(() => {
    const rfNodes: RFNode[] = [];

    // Add swimlane group nodes
    const sortedSwimlanes = [...swimlanes].sort((a, b) => a.order - b.order);
    sortedSwimlanes.forEach((sl, idx) => {
      rfNodes.push({
        id: sl.id,
        type: 'swimlane',
        position: { x: 0, y: idx * 180 },
        data: { label: sl.label, color: sl.color || '#6366f1', width: '900px', height: '160px' },
        style: { width: 900, height: 160, zIndex: -1 },
        draggable: true,
        selectable: true,
      });
    });

    // Add BPMN nodes
    nodes.forEach((node) => {
      const taskTypes = ['task', 'userTask', 'serviceTask', 'scriptTask'];
      const gatewayTypes = ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway'];

      let rfType = node.type as string;
      let data: any = { label: node.label, assignee: node.assignee };

      if (taskTypes.includes(node.type)) {
        rfType = node.type;
        data.taskType = node.type;
      }
      if (gatewayTypes.includes(node.type)) {
        rfType = node.type;
        data.gatewayType = node.type;
      }
      if (node.type === 'dataObject' || node.type === 'dataStore') {
        rfType = node.type;
        data.dataType = node.type;
      }

      const rfNode: RFNode = {
        id: node.id,
        type: rfType,
        position: node.position,
        data,
      };

      if (node.swimlaneId && swimlanes.some((s) => s.id === node.swimlaneId)) {
        rfNode.parentNode = node.swimlaneId;
        rfNode.extent = 'parent';
      }

      rfNodes.push(rfNode);
    });

    return rfNodes;
  }, [nodes, swimlanes]);

  // Convert BPMNEdge[] to ReactFlow Edge[]
  const convertedEdges: RFEdge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === 'messageFlow' ? 'messageFlow' : 'sequenceFlow',
      animated: edge.animated || false,
      data: { label: edge.label },
      markerEnd: { type: 'arrowclosed' as any, color: '#6b7280' },
    }));
  }, [edges]);

  const [rfNodes, setRfNodes, onRfNodesChange] = useNodesState(convertedNodes);
  const [rfEdges, setRfEdges, onRfEdgesChange] = useEdgesState(convertedEdges);

  // Sync store changes to ReactFlow
  useEffect(() => {
    const currentNodeIds = nodes.map((n) => n.id).sort().join(',');
    if (prevNodeIdsRef.current !== currentNodeIds) {
      setRfNodes(convertedNodes);
      prevNodeIdsRef.current = currentNodeIds;
    }
  }, [nodes, swimlanes, convertedNodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(convertedEdges);
  }, [edges, convertedEdges, setRfEdges]);

  // Handle node drag end - sync positions back to store
  const handleNodesChange = useCallback((changes: any[]) => {
    onRfNodesChange(changes);

    const positionChanges = changes.filter((c: any) => c.type === 'position' && c.dragging === false);
    if (positionChanges.length > 0) {
      setRfNodes((currentNodes) => {
        const updatedNodes = nodes.map((node) => {
          const rfNode = currentNodes.find((n) => n.id === node.id);
          if (rfNode) return { ...node, position: rfNode.position };
          return node;
        });
        onNodesChange(updatedNodes);
        return currentNodes;
      });
    }

    const removeChanges = changes.filter((c: any) => c.type === 'remove');
    if (removeChanges.length > 0) {
      const removedIds = new Set(removeChanges.map((c: any) => c.id));
      onNodesChange(nodes.filter((n) => !removedIds.has(n.id)));
      onEdgesChange(edges.filter((e) => !removedIds.has(e.source) && !removedIds.has(e.target)));
    }
  }, [onRfNodesChange, nodes, edges, onNodesChange, onEdgesChange, setRfNodes]);

  const handleEdgesChange = useCallback((changes: any[]) => {
    onRfEdgesChange(changes);
    const removeChanges = changes.filter((c: any) => c.type === 'remove');
    if (removeChanges.length > 0) {
      const removedIds = new Set(removeChanges.map((c: any) => c.id));
      onEdgesChange(edges.filter((e) => !removedIds.has(e.id)));
    }
  }, [onRfEdgesChange, edges, onEdgesChange]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;

    // Validate: start events can only be sources
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (targetNode?.type === 'startEvent') return;
    if (sourceNode?.type === 'endEvent') return;

    // Prevent duplicate edges
    if (edges.some((e) => e.source === connection.source && e.target === connection.target)) return;

    const newEdge: BPMNEdge = {
      id: `e-${connection.source}-${connection.target}`,
      type: 'sequenceFlow',
      source: connection.source,
      target: connection.target,
    };

    const rfEdge = {
      ...connection,
      id: newEdge.id,
      type: 'sequenceFlow',
      markerEnd: { type: 'arrowclosed' as any, color: '#6b7280' },
    };
    setRfEdges((eds) => addEdge(rfEdge, eds));
    onEdgesChange([...edges, newEdge]);
  }, [edges, nodes, setRfEdges, onEdgesChange]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      onEdgeClick={(_, edge) => onEdgeSelect(edge.id)}
      onPaneClick={() => { onNodeSelect(null); onEdgeSelect(null); }}
      nodeTypes={bpmnNodeTypes}
      edgeTypes={bpmnEdgeTypes}
      fitView
      deleteKeyCode={['Delete', 'Backspace']}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{ stroke: '#6b7280', strokeWidth: 2 }}
      defaultEdgeOptions={{ type: 'sequenceFlow', markerEnd: { type: 'arrowclosed' as any, color: '#6b7280' } }}
    >
      <Background color="#e5e7eb" variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} className="!bg-white !border-gray-200 !rounded-lg !shadow-md" />
      <MiniMap
        nodeColor={(node) => {
          if (node.type === 'swimlane') return '#e0e7ff';
          if (node.type === 'startEvent') return '#22c55e';
          if (node.type === 'endEvent') return '#ef4444';
          if (node.type?.includes('Gateway')) return '#f59e0b';
          return '#3b82f6';
        }}
        className="!bg-gray-50 !border-gray-200 !rounded-lg"
      />
    </ReactFlow>
  );
}
