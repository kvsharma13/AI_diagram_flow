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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architectureStore';
import { SmartEdge } from '@/lib/architecture/smartEdge';
import {
  Server, Database, Workflow, Cpu, HardDrive, Globe, Zap, Activity, Cloud,
  Lock, Shield, Bell, Users, Monitor, Smartphone, CreditCard, BarChart3,
  FileText, Key, Mail, Search, GitBranch, Layers, Network, Settings,
  Box, Eye, Clipboard, Repeat, Triangle,
} from 'lucide-react';

// Type-aware color styles
const TYPE_STYLES: Record<string, { accent: string; bg: string; label: string }> = {
  'api-gateway':   { accent: '#38BDF8', bg: 'rgba(56,189,248,0.08)',   label: 'API GATEWAY' },
  'load-balancer': { accent: '#38BDF8', bg: 'rgba(56,189,248,0.08)',   label: 'LOAD BALANCER' },
  'cloud':         { accent: '#38BDF8', bg: 'rgba(56,189,248,0.08)',   label: 'CLOUD' },
  'database':      { accent: '#34D399', bg: 'rgba(52,211,153,0.08)',   label: 'DATABASE' },
  'redis':         { accent: '#FB7185', bg: 'rgba(251,113,133,0.08)',  label: 'CACHE' },
  's3':            { accent: '#A78BFA', bg: 'rgba(167,139,250,0.08)',  label: 'STORAGE' },
  'lambda':        { accent: '#FB923C', bg: 'rgba(251,146,60,0.08)',   label: 'FUNCTION' },
  'ec2':           { accent: '#818CF8', bg: 'rgba(129,140,248,0.08)',  label: 'COMPUTE' },
  'worker':        { accent: '#FB923C', bg: 'rgba(251,146,60,0.08)',   label: 'WORKER' },
  'queue':         { accent: '#FBBF24', bg: 'rgba(251,191,36,0.08)',   label: 'QUEUE' },
  'server':        { accent: '#818CF8', bg: 'rgba(129,140,248,0.08)',  label: 'SERVICE' },
  'analytics':     { accent: '#C084FC', bg: 'rgba(192,132,252,0.08)',  label: 'ANALYTICS' },
  'lock':          { accent: '#F472B6', bg: 'rgba(244,114,182,0.08)',  label: 'AUTH' },
  'shield':        { accent: '#F472B6', bg: 'rgba(244,114,182,0.08)',  label: 'SECURITY' },
  'monitor':       { accent: '#60A5FA', bg: 'rgba(96,165,250,0.08)',   label: 'CLIENT' },
  'globe':         { accent: '#60A5FA', bg: 'rgba(96,165,250,0.08)',   label: 'WEB' },
  'smartphone':    { accent: '#60A5FA', bg: 'rgba(96,165,250,0.08)',   label: 'MOBILE' },
};

const FALLBACK_STYLE = { accent: '#818CF8', bg: 'rgba(129,140,248,0.08)', label: 'SERVICE' };

function getTypeStyle(data: any): { accent: string; bg: string; label: string } {
  if (data.type && TYPE_STYLES[data.type]) return TYPE_STYLES[data.type];
  if (data.icon && TYPE_STYLES[data.icon]) return TYPE_STYLES[data.icon];
  if (data.type) return { ...FALLBACK_STYLE, label: data.type.toUpperCase() };
  return FALLBACK_STYLE;
}

// Unified Service Node — left 3px accent bar, icon + type badge, bold name
const ServiceNode = ({ data, selected }: any) => {
  const iconMap: Record<string, any> = {
    'api-gateway': Globe,
    lambda: Zap,
    s3: HardDrive,
    server: Server,
    ec2: Server,
    database: Database,
    queue: Workflow,
    worker: Cpu,
    analytics: Activity,
    redis: Database,
    cloud: Cloud,
    'load-balancer': Cloud,
    globe: Globe,
    auth: Lock,
    lock: Lock,
    shield: Shield,
    bell: Bell,
    users: Users,
    monitor: Monitor,
    smartphone: Smartphone,
    'credit-card': CreditCard,
    'bar-chart': BarChart3,
    'file-text': FileText,
    key: Key,
    mail: Mail,
    search: Search,
    'git-branch': GitBranch,
    layers: Layers,
    network: Network,
    settings: Settings,
    box: Box,
    eye: Eye,
    clipboard: Clipboard,
    repeat: Repeat,
    triangle: Triangle,
  };

  const typeStyle = getTypeStyle(data);
  const Icon = iconMap[data.icon] || iconMap[data.type] || Server;

  return (
    <div
      className="group"
      style={{
        position: 'relative',
        background: typeStyle.bg,
        border: `1px solid ${selected ? typeStyle.accent + 'CC' : typeStyle.accent + '40'}`,
        borderRadius: '8px',
        minWidth: '160px',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 1px ${typeStyle.accent}40, 0 4px 12px rgba(0,0,0,0.4)`
          : '0 1px 4px rgba(0,0,0,0.35)',
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
          background: typeStyle.accent,
          borderRadius: '8px 0 0 8px',
        }}
      />

      {/* Handles — invisible by default, shown on group hover */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 6, height: 6, background: '#94a3b8', border: 'none', transition: 'opacity 0.15s' }}
        className="group-hover:!opacity-70"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 6, height: 6, background: '#94a3b8', border: 'none', transition: 'opacity 0.15s' }}
        className="group-hover:!opacity-70"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 6, height: 6, background: '#94a3b8', border: 'none', transition: 'opacity 0.15s' }}
        className="group-hover:!opacity-70"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 6, height: 6, background: '#94a3b8', border: 'none', transition: 'opacity 0.15s' }}
        className="group-hover:!opacity-70"
      />

      {/* Content */}
      <div style={{ padding: '10px 12px 10px 18px' }}>
        {/* Type badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Icon style={{ width: 11, height: 11, color: typeStyle.accent, flexShrink: 0 }} />
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              color: typeStyle.accent,
              textTransform: 'uppercase',
            }}
          >
            {typeStyle.label}
          </span>
        </div>
        {/* Service name */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#E2E8F0',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
          }}
        >
          {data.label}
        </div>
      </div>
    </div>
  );
};

// Group Node — subtle dashed border, downward tag badge from top
const GroupNode = ({ data }: any) => {
  const borderColor = data.borderColor || '#6b7280';

  return (
    <div
      style={{
        position: 'relative',
        background: `${borderColor}06`,
        border: `1.5px dashed ${borderColor}45`,
        borderRadius: '10px',
        minWidth: data.width || '400px',
        minHeight: data.height || '300px',
      }}
    >
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
}

export default function ReactFlowCanvas({
  selectedNodeId,
  onSelectNode,
  showCodePanel,
  onDeleteNode,
}: Props) {
  const { diagram, setNodes: storeSetNodes, setEdges: storeSetEdges } = useArchitectureStore();

  // Convert store nodes/edges to ReactFlow format
  const rfNodes = (diagram?.nodes || []) as RFNode[];

  // First, get all valid parent node IDs
  const validParentIds = new Set(
    rfNodes.filter((n) => n.type === 'group').map((n) => n.id)
  );

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
        data: { ...nodeData.data, label: nodeData.label, icon: nodeData.icon || node.type, type: nodeData.type },
      };

      // Handle parent-child relationships - only if parent exists
      if (nodeData.layerId && validParentIds.has(nodeData.layerId)) {
        rfNode.parentNode = nodeData.layerId;
        rfNode.extent = 'parent' as const;
      }

      // Set dimensions for group nodes
      if (node.type === 'group' && nodeData.data?.width && nodeData.data?.height) {
        rfNode.style = {
          width: parseInt(nodeData.data.width),
          height: parseInt(nodeData.data.height),
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
      markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#64748B' },
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
    const currentNodeIds = (diagram?.nodes || []).map(n => n.id).sort().join(',');

    if (isInitialMount.current || prevNodeIdsRef.current !== currentNodeIds) {
      setNodes(convertedNodes);
      prevNodeIdsRef.current = currentNodeIds;

      if (isInitialMount.current) {
        isInitialMount.current = false;
      }
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
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#64748B' },
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
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#64748B' },
      }}
      connectionLineStyle={{ stroke: '#64748b', strokeWidth: 1.5 }}
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Background color="rgba(71,85,105,0.3)" variant={BackgroundVariant.Dots} gap={20} size={0.6} />
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
