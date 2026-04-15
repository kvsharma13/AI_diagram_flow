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

// Custom Node Component - Compact eraser.io style
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

  const Icon = iconMap[data.icon] || Server;

  return (
    <div
      className={`group relative flex items-center px-3 py-2 rounded-lg border transition-all ${
        selected ? 'ring-1 ring-slate-400 ring-offset-1 ring-offset-gray-950' : ''
      }`}
      style={{
        backgroundColor: 'rgba(30,41,59,0.8)',
        borderColor: selected ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.4)',
        borderWidth: '1px',
        minWidth: '160px',
        minHeight: '56px',
        boxShadow: selected
          ? '0 2px 8px rgba(100,116,139,0.2)'
          : '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {/* Handles - hidden by default, show on hover */}
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />

      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: data.iconColor || '#94a3b8' }} />
        <div className="text-slate-200 font-medium text-xs">{data.label}</div>
      </div>
    </div>
  );
};

// Group Node Component - Subtle border with left accent
const GroupNode = ({ data }: any) => {
  return (
    <div
      className="rounded relative"
      style={{
        backgroundColor: 'transparent',
        border: '1px solid rgba(107,114,128,0.4)',
        minWidth: data.width || '400px',
        minHeight: data.height || '300px',
        padding: '28px 16px 16px 16px',
      }}
    >
      {/* Colored left accent bar */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l"
        style={{ backgroundColor: data.borderColor || '#6b7280' }}
      />
      {/* Plain text label */}
      <div
        className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'rgba(156,163,175,0.8)' }}
      >
        {data.label}
      </div>
    </div>
  );
};

// Database Node - Cylinder shape
const DatabaseNode = ({ data, selected }: any) => {
  const iconMap: Record<string, any> = { database: Database, redis: Database };
  const Icon = iconMap[data.icon] || Database;

  return (
    <div className="group relative flex flex-col items-center" style={{ minWidth: '120px' }}>
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <svg width="120" height="64" viewBox="0 0 120 64" fill="none">
        {/* Cylinder body */}
        <path
          d="M 10 16 L 10 48 Q 10 58 60 58 Q 110 58 110 48 L 110 16"
          fill="rgba(30,41,59,0.8)"
          stroke={selected ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.4)'}
          strokeWidth="1"
        />
        {/* Bottom ellipse */}
        <ellipse cx="60" cy="48" rx="50" ry="10" fill="rgba(30,41,59,0.8)" stroke={selected ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.4)'} strokeWidth="1" />
        {/* Top ellipse */}
        <ellipse cx="60" cy="16" rx="50" ry="10" fill="rgba(30,41,59,0.9)" stroke={selected ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.4)'} strokeWidth="1" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 pt-1">
        <Icon className="w-3.5 h-3.5" style={{ color: data.iconColor || '#94a3b8' }} />
        <span className="text-slate-200 font-medium text-[10px]">{data.label}</span>
      </div>
    </div>
  );
};

// Cloud Node - Cloud shape
const CloudNode = ({ data, selected }: any) => {
  const iconMap: Record<string, any> = { cloud: Cloud, 'load-balancer': Cloud };
  const Icon = iconMap[data.icon] || Cloud;

  return (
    <div className="group relative flex flex-col items-center" style={{ minWidth: '140px' }}>
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-slate-400 !border-none !opacity-0 group-hover:!opacity-70 transition-opacity" />
      <svg width="140" height="70" viewBox="0 0 140 70" fill="none">
        <path
          d="M 35 55 C 10 55 5 40 20 30 C 10 15 30 5 50 12 C 60 0 90 0 100 12 C 120 5 135 20 125 35 C 140 45 130 60 110 55 Z"
          fill="rgba(30,41,59,0.8)"
          stroke={selected ? 'rgba(148,163,184,0.5)' : 'rgba(71,85,105,0.4)'}
          strokeWidth="1"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: data.iconColor || '#94a3b8' }} />
        <span className="text-slate-200 font-medium text-[10px]">{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
  group: GroupNode,
  database: DatabaseNode,
  cloud: CloudNode,
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
      // Map node type to ReactFlow node type
      const dbTypes = new Set(['database', 'redis', 'postgres', 'mongodb']);
      const cloudTypes = new Set(['cloud', 'load-balancer']);
      const nodeType = node.type || 'service';
      let rfType = 'service';
      if (nodeType === 'group') rfType = 'group';
      else if (dbTypes.has(nodeType)) rfType = 'database';
      else if (cloudTypes.has(nodeType)) rfType = 'cloud';

      const rfNode: RFNode = {
        id: node.id,
        type: rfType,
        position: node.position,
        data: { ...nodeData.data, label: nodeData.label, icon: nodeData.icon || node.type },
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
      animated: edge.animated,
      style: { stroke: '#475569', strokeWidth: 1.5 },
      ...(edge.label ? {
        label: edge.label,
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: 'rgba(15,23,42,0.8)', stroke: 'rgba(71,85,105,0.3)', strokeWidth: 1 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
      } : {}),
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
        animated: true,
        style: { stroke: '#475569', strokeWidth: 1.5 },
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
        style: { stroke: '#475569', strokeWidth: 1.5 },
        type: 'smart',
      }}
      connectionLineStyle={{ stroke: '#64748b', strokeWidth: 1.5 }}
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Background color="rgba(71,85,105,0.3)" variant={BackgroundVariant.Dots} gap={24} size={0.8} />
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
