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

// Custom Node Component - Eraser.io aesthetic
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
  const accentColor = data.iconColor || '#60a5fa';
  const useLeftAccent = data.type === 'database' || data.type === 'redis' || data.type === 's3';

  return (
    <div
      className={`relative bg-white rounded border transition-all font-mono ${
        selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
      style={{
        borderColor: '#d1d5db',
        width: '110px',
        height: '110px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Thin colored accent bar - top OR left */}
      {useLeftAccent ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l"
          style={{ backgroundColor: accentColor }}
        />
      ) : (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Connection Handles - Minimal */}
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 !bg-gray-300 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 !bg-gray-300 border-none opacity-0 hover:opacity-100" />
      <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 !bg-gray-300 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 !bg-gray-300 border-none opacity-0 hover:opacity-100" />

      {/* Content - square layout with icon and text */}
      <div className={`flex flex-col items-center justify-center h-full gap-2 ${useLeftAccent ? 'pl-2' : 'pt-2'}`}>
        <Icon className="w-6 h-6 flex-shrink-0 text-gray-600" />
        <div className="text-gray-900 font-medium text-xs text-center px-2 leading-tight">{data.label}</div>
      </div>
    </div>
  );
};

// Group Node Component - Eraser.io dashed container style
const GroupNode = ({ data }: any) => {
  return (
    <div
      className="rounded border-2 relative font-mono"
      style={{
        backgroundColor: 'transparent',
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        minWidth: data.width || '400px',
        minHeight: data.height || '300px',
        padding: '8px',
      }}
    >
      {/* Small mono label in top-left corner - no background */}
      <div
        className="absolute top-2 left-2 text-xs font-semibold uppercase tracking-wide"
        style={{
          color: '#9ca3af',
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
      style: {
        stroke: edge.style?.stroke || '#d1d5db',
        strokeWidth: 1,
        strokeDasharray: edge.style?.strokeDasharray || undefined,
      },
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
        animated: false,
        style: { stroke: '#d1d5db', strokeWidth: 1 },
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
            animated: false,
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
        style: { stroke: '#d1d5db', strokeWidth: 1 },
        type: 'smoothstep',
      }}
      connectionLineStyle={{ stroke: '#d1d5db', strokeWidth: 1 }}
      connectionLineType={ConnectionLineType.SmoothStep}
    >
      <Background color="#f3f4f6" variant={BackgroundVariant.Dots} gap={20} size={0.5} />
      <Controls showInteractive={false} className="!bg-white !border-gray-300" />
      <MiniMap
        nodeColor={(node) => node.type === 'group' ? '#e5e7eb' : '#ffffff'}
        maskColor="rgba(249, 250, 251, 0.9)"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
        }}
      />
    </ReactFlow>
  );
}
