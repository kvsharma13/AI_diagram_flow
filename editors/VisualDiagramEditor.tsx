'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Server,
  Database,
  Cloud,
  Workflow,
  Cpu,
  HardDrive,
  Globe,
  Lock,
  Zap,
  Activity,
  Code,
  Download,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';

// Custom Node Component
const ServiceNode = ({ data, selected }: any) => {
  const iconMap: Record<string, any> = {
    'api-gateway': Globe,
    lambda: Zap,
    s3: HardDrive,
    server: Server,
    database: Database,
    queue: Workflow,
    worker: Cpu,
    analytics: Activity,
    cloud: Cloud,
    auth: Lock,
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
        backgroundColor: data.bgColor || 'rgba(30, 41, 59, 0.5)',
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

const nodeTypes: NodeTypes = {
  service: ServiceNode,
  group: GroupNode,
};

export default function VisualDiagramEditor() {
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeInput, setCodeInput] = useState('');

  // Initial AWS-style architecture
  const initialNodes: Node[] = [
    {
      id: 'vpc',
      type: 'group',
      position: { x: 250, y: 0 },
      data: {
        label: 'VPC SUBNET',
        borderColor: '#eab308',
        bgColor: 'rgba(30, 41, 59, 0.3)',
        width: '900px',
        height: '500px',
      },
      style: { width: 900, height: 500, zIndex: 0 },
    },
    {
      id: 'api-gateway',
      type: 'service',
      position: { x: 50, y: 200 },
      data: {
        label: 'API gateway',
        icon: 'api-gateway',
        iconBg: '#ec4899',
        borderColor: '#ec4899',
      },
    },
    {
      id: 'lambda',
      type: 'service',
      position: { x: 220, y: 200 },
      data: {
        label: 'Lambda',
        icon: 'lambda',
        iconBg: '#f97316',
        borderColor: '#3b82f6',
      },
    },
    {
      id: 's3',
      type: 'service',
      position: { x: 220, y: 350 },
      data: {
        label: 'S3',
        icon: 's3',
        iconBg: '#22c55e',
        borderColor: '#22c55e',
      },
    },
    {
      id: 'main-server',
      type: 'group',
      position: { x: 420, y: 100 },
      data: {
        label: 'MAIN SERVER',
        borderColor: '#3b82f6',
        bgColor: 'rgba(30, 41, 59, 0.5)',
        width: '250px',
        height: '280px',
      },
      parentNode: 'vpc',
      extent: 'parent',
      style: { width: 250, height: 280, zIndex: 1 },
    },
    {
      id: 'server',
      type: 'service',
      position: { x: 65, y: 60 },
      data: {
        label: 'Server',
        icon: 'server',
        iconBg: '#f97316',
        borderColor: '#3b82f6',
      },
      parentNode: 'main-server',
      extent: 'parent',
    },
    {
      id: 'data',
      type: 'service',
      position: { x: 65, y: 180 },
      data: {
        label: 'Data',
        icon: 'database',
        iconBg: '#3b82f6',
        borderColor: '#3b82f6',
      },
      parentNode: 'main-server',
      extent: 'parent',
    },
    {
      id: 'queue',
      type: 'service',
      position: { x: 720, y: 210 },
      data: {
        label: 'Queue',
        icon: 'queue',
        iconBg: '#ec4899',
        borderColor: '#ec4899',
      },
      parentNode: 'vpc',
      extent: 'parent',
    },
    {
      id: 'compute-nodes',
      type: 'group',
      position: { x: 900, y: 50 },
      data: {
        label: 'COMPUTE NODES',
        borderColor: '#ef4444',
        bgColor: 'rgba(30, 41, 59, 0.5)',
        width: '200px',
        height: '420px',
      },
      parentNode: 'vpc',
      extent: 'parent',
      style: { width: 200, height: 420, zIndex: 1 },
    },
    {
      id: 'worker1',
      type: 'service',
      position: { x: 40, y: 60 },
      data: {
        label: 'Worker1',
        icon: 'worker',
        iconBg: '#f97316',
        borderColor: '#ef4444',
      },
      parentNode: 'compute-nodes',
      extent: 'parent',
    },
    {
      id: 'worker2',
      type: 'service',
      position: { x: 40, y: 160 },
      data: {
        label: 'Worker2',
        icon: 'worker',
        iconBg: '#f97316',
        borderColor: '#ef4444',
      },
      parentNode: 'compute-nodes',
      extent: 'parent',
    },
    {
      id: 'worker3',
      type: 'service',
      position: { x: 40, y: 280 },
      data: {
        label: 'Worker3',
        icon: 'worker',
        iconBg: '#f97316',
        borderColor: '#ef4444',
      },
      parentNode: 'compute-nodes',
      extent: 'parent',
    },
    {
      id: 'analytics',
      type: 'service',
      position: { x: 1200, y: 230 },
      data: {
        label: 'Analytics',
        icon: 'analytics',
        iconBg: '#8b5cf6',
        borderColor: '#8b5cf6',
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'api-gateway', target: 'lambda', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e2', source: 'lambda', target: 'server', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e3', source: 'lambda', target: 's3', animated: false, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e4', source: 'server', target: 'data', animated: false, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e5', source: 'server', target: 'queue', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e6', source: 'queue', target: 'worker1', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e7', source: 'queue', target: 'worker2', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e8', source: 'queue', target: 'worker3', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
    { id: 'e9', source: 'worker2', target: 'analytics', animated: true, style: { stroke: '#60a5fa', strokeWidth: 2 } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = (type: string, icon: string, color: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'service',
      position: { x: 400, y: 200 },
      data: {
        label: type,
        icon: icon,
        iconBg: color,
        borderColor: color,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
      setSelectedNode(null);
    }
  };

  const generateCodeFromDiagram = () => {
    const code = JSON.stringify({ nodes, edges }, null, 2);
    setGeneratedCode(code);
    setShowCodePanel(true);
  };

  const loadFromCode = () => {
    try {
      const data = JSON.parse(codeInput);
      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
        alert('Diagram loaded successfully!');
      }
    } catch (err) {
      alert('Invalid JSON format!');
    }
  };

  const exportDiagram = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex">
      {/* Main Canvas */}
      <div className={`${showCodePanel ? 'w-2/3' : 'w-full'} flex flex-col bg-gray-950`}>
        {/* Toolbar */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Add Components:</span>
              <button
                onClick={() => addNode('Server', 'server', '#f97316')}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium"
              >
                + Server
              </button>
              <button
                onClick={() => addNode('Database', 'database', '#3b82f6')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                + Database
              </button>
              <button
                onClick={() => addNode('Lambda', 'lambda', '#f97316')}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium"
              >
                + Lambda
              </button>
              <button
                onClick={() => addNode('Queue', 'queue', '#ec4899')}
                className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-medium"
              >
                + Queue
              </button>
              <button
                onClick={() => addNode('Analytics', 'analytics', '#8b5cf6')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
              >
                + Analytics
              </button>
            </div>
            <div className="flex items-center gap-2">
              {selectedNode && (
                <button
                  onClick={deleteSelectedNode}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
              <button
                onClick={generateCodeFromDiagram}
                className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium"
              >
                <Code className="w-3 h-3" />
                Generate Code
              </button>
              <button
                onClick={exportDiagram}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            💡 Drag components to move • Click and drag between nodes to connect • Select and delete
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            fitView
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#60a5fa', strokeWidth: 2 },
            }}
          >
            <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'group') return '#374151';
                return '#3b82f6';
              }}
              style={{
                backgroundColor: '#1e293b',
              }}
            />
          </ReactFlow>
        </div>
      </div>

      {/* Code Panel */}
      {showCodePanel && (
        <div className="w-1/3 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <span className="text-white font-semibold">Code Generator</span>
            <button
              onClick={() => setShowCodePanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Generated Code */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 bg-gray-800 border-b border-gray-700">
              <span className="text-xs text-gray-400">Generated JSON (Copy & Save):</span>
            </div>
            <textarea
              value={generatedCode}
              readOnly
              className="flex-1 p-4 bg-gray-900 text-gray-100 font-mono text-xs resize-none focus:outline-none"
            />
          </div>

          {/* Load from Code */}
          <div className="border-t border-gray-700">
            <div className="p-3 bg-gray-800 border-b border-gray-700">
              <span className="text-xs text-gray-400">Load from Code (Paste JSON):</span>
            </div>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full h-32 p-4 bg-gray-900 text-gray-100 font-mono text-xs resize-none focus:outline-none"
            />
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <button
                onClick={loadFromCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Load Diagram
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
