'use client';

import { useCallback, useEffect, useRef } from 'react';
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
  Handle,
  Position,
  MarkerType,
  NodeResizer,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architectureStore';
import { SmartEdge } from '@/lib/architecture/smartEdge';
import { resolveIcon } from '@/lib/architecture/iconMap';
import ServiceIcon from '@/components/architecture/ServiceIcon';

const handleStyle = {
  opacity: 0,
  width: 7,
  height: 7,
  background: '#94a3b8',
  border: 'none',
  transition: 'opacity 0.15s',
};

// Unified Service Node — icon-forward, eraser-style card with brand logo,
// left accent bar, type badge and bold service name.
const ServiceNode = ({ data, selected }: any) => {
  const spec = resolveIcon({
    service: data.service || data.icon,
    type: data.type,
    label: data.label,
  });

  return (
    <div
      className="group transition-transform duration-200 hover:-translate-y-[2px]"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #18243C 0%, #0E1626 100%)',
        border: `1px solid ${selected ? spec.accent + 'CC' : spec.accent + '33'}`,
        borderRadius: '11px',
        minWidth: '172px',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 1px ${spec.accent}66, 0 0 22px ${spec.accent}22, 0 10px 28px rgba(0,0,0,0.5)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 3px 12px rgba(0,0,0,0.45)',
      }}
    >
      {/* Left accent strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: spec.accent,
          borderRadius: '10px 0 0 10px',
        }}
      />

      {/* Handles — invisible by default, shown on hover */}
      <Handle type="target" position={Position.Top} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle type="source" position={Position.Bottom} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle type="target" position={Position.Left} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle type="source" position={Position.Right} style={handleStyle} className="group-hover:!opacity-70" />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 14px 10px 17px' }}>
        {/* Icon tile */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: spec.brand ? 'rgba(255,255,255,0.06)' : spec.accent + '1A',
            border: `1px solid ${spec.accent}22`,
            flexShrink: 0,
          }}
        >
          <ServiceIcon spec={spec} size={21} />
        </div>
        {/* Text column */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '8.5px',
              fontWeight: 700,
              letterSpacing: '0.09em',
              color: spec.accent,
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            {spec.label}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#E2E8F0',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Node — subtle dashed border, downward tag badge from top
const GroupNode = ({ data, selected }: any) => {
  const borderColor = data.borderColor || '#6b7280';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `${borderColor}0D`,
        border: `1px solid ${borderColor}30`,
        borderRadius: '14px',
        boxShadow: `inset 0 0 40px ${borderColor}08`,
      }}
    >
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={220}
        minHeight={130}
        handleStyle={{ width: 9, height: 9, borderRadius: 2 }}
        lineStyle={{ borderColor: `${borderColor}66` }}
      />
      {/* Downward tag badge from top */}
      <div
        style={{
          position: 'absolute',
          top: '-1px',
          left: '16px',
          background: borderColor,
          borderRadius: '0 0 6px 6px',
          padding: '2px 10px 3px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          {data.label}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
  group: GroupNode,
};

const edgeTypes = {
  smart: SmartEdge,
};

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  showCodePanel: boolean;
  onDeleteNode?: () => void;
  lightBg?: boolean;
}

export default function ReactFlowCanvas({
  selectedNodeId,
  onSelectNode,
  showCodePanel,
  onDeleteNode,
  lightBg = false,
}: Props) {
  const { diagram, setNodes: storeSetNodes, setEdges: storeSetEdges } = useArchitectureStore();

  // Convert store nodes/edges to ReactFlow format
  const rfNodes = (diagram?.nodes || []) as RFNode[];

  // First, get all valid parent node IDs
  const validParentIds = new Set(
    rfNodes.filter((n) => n.type === 'group').map((n) => n.id)
  );

  // Bounding box of each group's children, so a group is always sized to contain
  // them (prevents nodes spilling out, regardless of layout or imported sizes).
  const groupBounds = new Map<string, { w: number; h: number }>();
  rfNodes.forEach((n: any) => {
    const pid = n.layerId;
    if (pid && validParentIds.has(pid) && n.type !== 'group') {
      const label = String(n.data?.label || n.label || '');
      const w = Math.min(300, Math.max(190, 78 + label.length * 7.2));
      const right = (n.position?.x || 0) + w;
      const bottom = (n.position?.y || 0) + 72;
      const cur = groupBounds.get(pid) || { w: 0, h: 0 };
      groupBounds.set(pid, { w: Math.max(cur.w, right), h: Math.max(cur.h, bottom) });
    }
  });

  // Convert nodes, validating parent relationships
  const convertedNodes: RFNode[] = rfNodes
    .map((node) => {
      const nodeData = node as any;
      // All non-group nodes map to 'service'
      const nodeType = node.type || 'service';
      let rfType = 'service';
      if (nodeType === 'group') rfType = 'group';

      const rfNode: RFNode = {
        id: node.id,
        type: rfType,
        position: node.position,
        data: {
          ...nodeData.data,
          label: nodeData.label,
          icon: nodeData.icon || node.type,
          type: nodeData.type,
          service: nodeData.data?.service ?? nodeData.service,
        },
      };

      // Handle parent-child relationships - only if parent exists
      if (nodeData.layerId && validParentIds.has(nodeData.layerId)) {
        rfNode.parentNode = nodeData.layerId;
        rfNode.extent = 'parent' as const;
      }

      // Size group nodes to at least bound their children — so contents can
      // never overflow the box — while still allowing a larger manual/code size.
      if (node.type === 'group') {
        const b = groupBounds.get(node.id);
        const dataW = nodeData.data?.width ? parseInt(nodeData.data.width) : 0;
        const dataH = nodeData.data?.height ? parseInt(nodeData.data.height) : 0;
        rfNode.style = {
          width: Math.max(b ? b.w + 30 : 0, dataW) || 400,
          height: Math.max(b ? b.h + 30 : 0, dataH) || 200,
          zIndex: nodeData.layerId ? -1 : -2,
        };
      }

      return rfNode;
    })
    // Sort: parent groups first, then child groups, then service nodes
    .sort((a, b) => {
      const order = (n: RFNode) => {
        if (n.type === 'group' && !n.parentNode) return 0;
        if (n.type === 'group' && n.parentNode) return 1;
        return 2;
      };
      return order(a) - order(b);
    });

  const rfEdges: RFEdge[] =
    diagram?.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smart',
      animated: edge.animated,
      style: { stroke: '#3F4E63', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#8593AD' },
      ...(edge.label ? { label: edge.label } : {}),
    })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(convertedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);
  const isInitialMount = useRef(true);
  const prevNodeIdsRef = useRef<string>('');

  // Sync when:
  // 1. Initial mount
  // 2. Node IDs completely change (new diagram generated from code)
  useEffect(() => {
    // Re-sync when structure OR positions/sizes change — so auto-layout and the
    // direction toggle actually move the nodes (not just on a new diagram). The
    // store only updates on drag-end, so this never fights an in-progress drag.
    // Position-only signature: re-sync on layout/structure changes, but NOT on a
    // group resize (size-only), so NodeResizer is not reset mid-drag.
    const syncSig = (diagram?.nodes || [])
      .map((n: any) => `${n.id}:${Math.round(n.position?.x ?? 0)},${Math.round(n.position?.y ?? 0)}`)
      .join('|');

    if (isInitialMount.current || prevNodeIdsRef.current !== syncSig) {
      setNodes(convertedNodes);
      prevNodeIdsRef.current = syncSig;
      if (isInitialMount.current) isInitialMount.current = false;
    }
  }, [diagram?.nodes, setNodes]);

  // Sync edges when they change
  useEffect(() => {
    setEdges(rfEdges);
  }, [diagram?.edges, setEdges]);

  // Handle node changes and sync to store
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);

      if (!diagram) return;

      // Check for node removals
      const removeChanges = changes.filter((change) => change.type === 'remove');
      if (removeChanges.length > 0) {
        const removedIds = new Set(removeChanges.map((change) => change.id));

        // Get current positions from React Flow nodes before filtering
        setNodes((currentNodes) => {
          const currentPositions = new Map(
            currentNodes.map((n) => [n.id, n.position])
          );

          // Update store with current positions and filter removed nodes
          const newNodes = diagram.nodes
            .filter((node) => !removedIds.has(node.id))
            .map((node) => ({
              ...node,
              position: currentPositions.get(node.id) || node.position,
            }));

          const newEdges = diagram.edges.filter(
            (edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target)
          );

          storeSetNodes(newNodes);
          storeSetEdges(newEdges);

          return currentNodes; // Return unchanged, onNodesChange already handled the removal
        });
      }

      // Check for position changes (when dragging ends)
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (positionChanges.length > 0) {
        setNodes((currentNodes) => {
          const updatedNodes = diagram.nodes.map((node) => {
            const currentNode = currentNodes.find((n) => n.id === node.id);
            if (currentNode) {
              return { ...node, position: currentNode.position };
            }
            return node;
          });
          storeSetNodes(updatedNodes);
          return currentNodes; // Return unchanged, onNodesChange already handled the position update
        });
      }

      // Persist group container resizes (NodeResizer). Excludes mount auto-measure
      // (which has no `resizing` flag). Safe to run live — the sync is position-only.
      const dimChanges = changes.filter(
        (change: any) => change.type === 'dimensions' && change.dimensions && change.resizing !== undefined
      );
      if (dimChanges.length > 0) {
        const updated = diagram.nodes.map((node) => {
          const ch = dimChanges.find((c: any) => c.id === node.id);
          if (ch && node.type === 'group') {
            return {
              ...node,
              data: {
                ...(node as any).data,
                width: Math.round(ch.dimensions.width) + 'px',
                height: Math.round(ch.dimensions.height) + 'px',
              },
            };
          }
          return node;
        });
        storeSetNodes(updated);
      }
    },
    [onNodesChange, diagram, storeSetNodes, storeSetEdges, setNodes]
  );

  // Handle edge changes and sync deletions to store
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);

      // Check for edge removals
      const removeChanges = changes.filter((change) => change.type === 'remove');
      if (removeChanges.length > 0 && diagram) {
        const removedIds = new Set(removeChanges.map((change) => change.id));
        const newEdges = diagram.edges.filter((edge) => !removedIds.has(edge.id));
        storeSetEdges(newEdges);
      }
    },
    [onEdgesChange, diagram, storeSetEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smart',
        animated: false,
        style: { stroke: '#3F4E63', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#8593AD' },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Update store
      if (diagram) {
        storeSetEdges([
          ...diagram.edges,
          {
            id: `${connection.source}-${connection.target}`,
            source: connection.source!,
            target: connection.target!,
            animated: true,
          },
        ]);
      }
    },
    [setEdges, diagram, storeSetEdges]
  );

  const handleNodeClick = useCallback(
    (_: any, node: RFNode) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  // Handle edge click to allow deletion
  const handleEdgeClick = useCallback(
    (_: any, edge: RFEdge) => {
      if (window.confirm('Delete this connection?')) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Update store
        if (diagram) {
          storeSetEdges(diagram.edges.filter((e) => e.id !== edge.id));
        }
      }
    },
    [diagram, storeSetEdges, setEdges]
  );

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        onDeleteNode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onDeleteNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      elementsSelectable={true}
      nodesDraggable={true}
      nodesConnectable={true}
      defaultEdgeOptions={{
        animated: false,
        style: { stroke: '#3F4E63', strokeWidth: 1.5 },
        type: 'smart',
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#8593AD' },
      }}
      connectionLineStyle={{ stroke: '#64748b', strokeWidth: 1.5 }}
      connectionLineType={ConnectionLineType.SmoothStep}
      minZoom={0.15}
      maxZoom={2.5}
      style={{ background: lightBg ? '#F1F5F9' : '#0B0F1A', transition: 'background 0.2s' }}
    >
      <Background color={lightBg ? 'rgba(15,23,42,0.16)' : 'rgba(71,85,105,0.3)'} variant={BackgroundVariant.Dots} gap={20} size={0.6} />
      <Controls showInteractive={false} className="!bg-slate-900/80 !border-slate-700/50 !rounded-lg !shadow-lg [&_button]:!border-slate-700/30 [&_button]:!bg-transparent [&_button:hover]:!bg-slate-700/50 [&_button_svg]:!fill-slate-400" />
      <MiniMap
        nodeColor={(node) => node.type === 'group' ? 'rgba(71,85,105,0.4)' : 'rgba(148,163,184,0.6)'}
        maskColor="rgba(15,23,42,0.85)"
        style={{
          backgroundColor: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(51,65,85,0.4)',
          borderRadius: '8px',
        }}
      />
    </ReactFlow>
  );
}
