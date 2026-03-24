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
  ConnectionLineType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architectureStore';
import { Server, Database, Workflow, Cpu, HardDrive, Globe, Zap, Activity, Cloud } from 'lucide-react';

// Custom Node Component - Clean Eraser.io style
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
    auth: Server,
  };

  const Icon = iconMap[data.icon] || Server;

  return (
    <div
      className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        backgroundColor: data.bgColor || '#374151',
        borderColor: data.borderColor || '#4b5563',
        minWidth: '140px',
        minHeight: '50px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Connection Handles - Smaller and more subtle */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400 border-none" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400 border-none" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400 border-none" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400 border-none" />

      {/* Compact layout with small icon and text */}
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: data.iconColor || '#60a5fa' }} />
        <div className="text-white font-medium text-sm whitespace-nowrap">{data.label}</div>
      </div>
    </div>
  );
};

// Group Node Component - Swimlane style like Eraser.io
const GroupNode = ({ data }: any) => {
  return (
    <div
      className="rounded-lg border-2 relative"
      style={{
        backgroundColor: data.bgColor || 'rgba(55, 65, 81, 0.15)',
        borderColor: data.borderColor || '#4b5563',
        borderStyle: 'dashed',
        minWidth: data.width || '400px',
        minHeight: data.height || '300px',
        padding: '8px',
      }}
    >
      {/* Label badge in top-left corner */}
      <div
        className="absolute top-2 left-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
        style={{
          backgroundColor: data.borderColor || '#4b5563',
          color: '#ffffff',
        }}
      >
        {data.label}
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
        width: parseInt(nodeData.data.width),
        height: parseInt(nodeData.data.height),
        zIndex: nodeData.layerId ? 1 : 0,
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
        animated: false,
        style: { stroke: '#6b7280', strokeWidth: 2 },
        type: 'smoothstep',
      }}
      connectionLineStyle={{ stroke: '#6b7280', strokeWidth: 2 }}
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Background color="#374151" variant={BackgroundVariant.Dots} gap={16} size={1} />
      <Controls showInteractive={false} className="!bg-gray-800 !border-gray-700" />
      <MiniMap
        nodeColor={(node) => node.type === 'group' ? '#4b5563' : '#60a5fa'}
        maskColor="rgba(17, 24, 39, 0.8)"
        style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
        }}
      />
    </ReactFlow>
  );
}
