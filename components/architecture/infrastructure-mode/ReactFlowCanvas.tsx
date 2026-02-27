'use client';

import { useCallback, useEffect } from 'react';
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
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architectureStore';
import { Server, Database, Workflow, Cpu, HardDrive, Globe, Zap, Activity, Cloud } from 'lucide-react';

// Custom Node Component
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
  };

  const Icon = iconMap[data.icon] || Server;

  return (
    <div
      className={`px-6 py-4 rounded-lg border-2 shadow-lg bg-gradient-to-br transition-all ${
        selected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
      }`}
      style={{
        backgroundColor: data.bgColor || '#1e293b',
        borderColor: data.borderColor || '#3b82f6',
        minWidth: '120px',
      }}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500" />

      <div className="flex flex-col items-center gap-2">
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: data.iconBg || '#f97316',
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="text-white font-semibold text-sm text-center">{data.label}</div>
      </div>
    </div>
  );
};

// Group Node Component
const GroupNode = ({ data }: any) => {
  return (
    <div
      className="rounded-xl border-2 p-6"
      style={{
        backgroundColor: data.bgColor || 'rgba(30, 41, 59, 0.3)',
        borderColor: data.borderColor || '#eab308',
        minWidth: data.width || '400px',
        minHeight: data.height || '300px',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="px-3 py-1 rounded text-white font-semibold text-sm uppercase tracking-wide"
          style={{ backgroundColor: data.borderColor || '#eab308' }}
        >
          {data.label}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
  group: GroupNode,
};

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  showCodePanel: boolean;
  layoutDirection?: 'horizontal' | 'vertical';
  onDeleteNode?: () => void;
}

export default function ReactFlowCanvas({
  selectedNodeId,
  onSelectNode,
  showCodePanel,
  layoutDirection = 'horizontal',
  onDeleteNode,
}: Props) {
  const { diagram, setNodes: storeSetNodes, setEdges: storeSetEdges } = useArchitectureStore();

  // Convert store nodes/edges to ReactFlow format
  const rfNodes = (diagram?.nodes || []) as RFNode[];

  // First, get all valid parent node IDs
  const validParentIds = new Set(
    rfNodes.filter((n) => n.type === 'group').map((n) => n.id)
  );

  // Then convert nodes, validating parent relationships
  const convertedNodes: RFNode[] = rfNodes.map((node) => {
    const nodeData = node as any;
    const rfNode: RFNode = {
      id: node.id,
      type: node.type === 'group' ? 'group' : 'service',
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
        width: parseInt(node.data.width),
        height: parseInt(node.data.height),
        zIndex: node.layerId ? 1 : 0,
      };
    }

    return rfNode;
  });

  const rfEdges: RFEdge[] =
    diagram?.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
    })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(convertedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync nodes and edges when diagram changes
  useEffect(() => {
    setNodes(convertedNodes);
  }, [diagram?.nodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [diagram?.edges, setEdges]);

  // Handle node changes and sync deletions to store
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);

      // Check for node removals
      const removeChanges = changes.filter((change) => change.type === 'remove');
      if (removeChanges.length > 0 && diagram) {
        const removedIds = new Set(removeChanges.map((change) => change.id));
        const newNodes = diagram.nodes.filter((node) => !removedIds.has(node.id));
        const newEdges = diagram.edges.filter(
          (edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target)
        );
        storeSetNodes(newNodes);
        storeSetEdges(newEdges);
      }
    },
    [onNodesChange, diagram, storeSetNodes, storeSetEdges]
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
        style: { stroke: '#60a5fa', strokeWidth: 2 },
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
      fitView
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      elementsSelectable={true}
      nodesDraggable={true}
      nodesConnectable={true}
      defaultEdgeOptions={{
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 },
        type: 'smoothstep',
      }}
      connectionLineStyle={{ stroke: '#60a5fa', strokeWidth: 2 }}
      connectionLineType="smoothstep"
    >
      <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) => '#3b82f6'}
        style={{
          backgroundColor: '#1e293b',
        }}
      />
    </ReactFlow>
  );
}
