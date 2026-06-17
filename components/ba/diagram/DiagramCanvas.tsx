'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  Node as RFNode, Edge as RFEdge, Controls, Background, MiniMap, addEdge,
  Connection, useNodesState, useEdgesState, BackgroundVariant, ConnectionLineType,
  NodeTypes, EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { DiagramNode, DiagramEdge } from '@/types/project';

/* Generic React-Flow canvas for the shared DiagramNode/DiagramEdge shape.
   Node/edge components edit their own data via injected `__update`/`__delete`
   (injected at conversion, never persisted). Resyncs only when the structural
   signature (ids/types/data — NOT positions) changes, so dragging never jitters
   but inline edits show live. */
export interface DiagramCanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  makeEdge: (source: string, target: string) => DiagramEdge;
  onNodesChange: (nodes: DiagramNode[]) => void;
  onEdgesChange: (edges: DiagramEdge[]) => void;
  background?: string;
}

const signature = (nodes: DiagramNode[], edges: DiagramEdge[]) =>
  JSON.stringify(nodes.map((n) => [n.id, n.type, n.data, n.width, n.height, n.parentNode])) +
  '|' +
  JSON.stringify(edges.map((e) => [e.id, e.type, e.source, e.target, e.data, e.label]));

export default function DiagramCanvas({
  nodes, edges, nodeTypes, edgeTypes, makeEdge, onNodesChange, onEdgesChange, background = '#ffffff',
}: DiagramCanvasProps) {
  const prevSig = useRef('');

  const updateNodeData = useCallback((id: string, patch: Record<string, any>) => {
    onNodesChange(nodes.map((n) => (n.id === id ? { ...n, data: { ...(n.data || {}), ...patch } } : n)));
  }, [nodes, onNodesChange]);
  const deleteNode = useCallback((id: string) => {
    onNodesChange(nodes.filter((n) => n.id !== id));
    onEdgesChange(edges.filter((e) => e.source !== id && e.target !== id));
  }, [nodes, edges, onNodesChange, onEdgesChange]);
  const updateEdgeData = useCallback((id: string, patch: Record<string, any>) => {
    onEdgesChange(edges.map((e) => (e.id === id ? { ...e, data: { ...(e.data || {}), ...patch } } : e)));
  }, [edges, onEdgesChange]);
  const deleteEdge = useCallback((id: string) => onEdgesChange(edges.filter((e) => e.id !== id)), [edges, onEdgesChange]);

  const convertedNodes: RFNode[] = useMemo(() => nodes.map((n) => {
    const rf: RFNode = {
      id: n.id,
      type: n.type,
      position: n.position,
      data: { ...(n.data || {}), __update: (p: any) => updateNodeData(n.id, p), __delete: () => deleteNode(n.id) },
    };
    const style: Record<string, any> = {};
    if (n.width) style.width = n.width;
    if (n.height) style.height = n.height;
    if (n.data?.container) style.zIndex = -1;
    if (Object.keys(style).length) rf.style = style;
    if (n.parentNode) { rf.parentNode = n.parentNode; rf.extent = 'parent'; }
    return rf;
  }), [nodes, updateNodeData, deleteNode]);

  const convertedEdges: RFEdge[] = useMemo(() => edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    data: { ...(e.data || {}), label: e.label, __update: (p: any) => updateEdgeData(e.id, p), __delete: () => deleteEdge(e.id) },
  })), [edges, updateEdgeData, deleteEdge]);

  const [rfNodes, setRfNodes, onRfNodesChange] = useNodesState(convertedNodes);
  const [rfEdges, setRfEdges, onRfEdgesChange] = useEdgesState(convertedEdges);

  useEffect(() => {
    const s = signature(nodes, edges);
    if (prevSig.current !== s) {
      setRfNodes(convertedNodes);
      setRfEdges(convertedEdges);
      prevSig.current = s;
    }
  }, [nodes, edges, convertedNodes, convertedEdges, setRfNodes, setRfEdges]);

  const handleNodesChange = useCallback((changes: any[]) => {
    onRfNodesChange(changes);
    const pos = changes.filter((c: any) => c.type === 'position' && c.dragging === false);
    if (pos.length) {
      setRfNodes((curr) => {
        onNodesChange(nodes.map((n) => {
          const r = curr.find((c) => c.id === n.id);
          return r ? { ...n, position: r.position } : n;
        }));
        return curr;
      });
    }
    const rem = changes.filter((c: any) => c.type === 'remove');
    if (rem.length) {
      const ids = new Set(rem.map((c: any) => c.id));
      onNodesChange(nodes.filter((n) => !ids.has(n.id)));
      onEdgesChange(edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)));
    }
  }, [onRfNodesChange, nodes, edges, onNodesChange, onEdgesChange, setRfNodes]);

  const handleEdgesChange = useCallback((changes: any[]) => {
    onRfEdgesChange(changes);
    const rem = changes.filter((c: any) => c.type === 'remove');
    if (rem.length) {
      const ids = new Set(rem.map((c: any) => c.id));
      onEdgesChange(edges.filter((e) => !ids.has(e.id)));
    }
  }, [onRfEdgesChange, edges, onEdgesChange]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target || c.source === c.target) return;
    if (edges.some((e) => e.source === c.source && e.target === c.target)) return;
    const ne = makeEdge(c.source, c.target);
    setRfEdges((eds) => addEdge({ ...c, id: ne.id, type: ne.type, data: { ...(ne.data || {}), label: ne.label } }, eds));
    onEdgesChange([...edges, ne]);
  }, [edges, makeEdge, setRfEdges, onEdgesChange]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      deleteKeyCode={['Delete', 'Backspace']}
      connectionLineType={ConnectionLineType.SmoothStep}
      style={{ background }}
    >
      <Background color="#e5e7eb" variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
      <MiniMap pannable className="!bg-gray-50" />
    </ReactFlow>
  );
}
