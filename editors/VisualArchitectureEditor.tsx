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
  Box,
  Container,
  Code2,
  FileJson,
  Download,
  Upload,
} from 'lucide-react';
import { SiAmazonaws, SiGooglecloud, SiMicrosoftazure, SiDocker, SiKubernetes } from 'react-icons/si';

// Custom Node Component with Icons
const ServiceNode = ({ data }: any) => {
  const iconMap: Record<string, any> = {
    'api-gateway': Globe,
    lambda: Zap,
    s3: HardDrive,
    server: Server,
    database: Database,
    queue: Workflow,
    worker: Cpu,
    analytics: Activity,
    container: Container,
    docker: Box,
    cloud: Cloud,
    auth: Lock,
  };

  const Icon = iconMap[data.icon] || Server;

  return (
    <div
      className="px-6 py-4 rounded-lg border-2 shadow-lg bg-gradient-to-br transition-all hover:scale-105"
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
          className="px-3 py-1 rounded text-white font-semibold text-sm"
          style={{ backgroundColor: data.borderColor || '#eab308' }}
        >
          {data.icon && <span className="mr-2">{data.icon}</span>}
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

export default function VisualArchitectureEditor() {
  const [darkMode, setDarkMode] = useState(true);

  // Initial nodes setup - AWS architecture example
  const initialNodes: Node[] = [
    // VPC Subnet Group
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
      style: { width: 900, height: 500 },
    },

    // API Gateway
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

    // Lambda
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

    // S3
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

    // Main Server Group
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
      style: { width: 250, height: 280 },
    },

    // Server
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
    },

    // Data
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
    },

    // Queue
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
    },

    // Compute Nodes Group
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
      style: { width: 200, height: 420 },
    },

    // Worker 1
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
    },

    // Worker 2
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
    },

    // Worker 3
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
    },

    // Analytics
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
    { id: 'e1', source: 'api-gateway', target: 'lambda', animated: true },
    { id: 'e2', source: 'lambda', target: 'server', animated: true },
    { id: 'e3', source: 'lambda', target: 's3', animated: false },
    { id: 'e4', source: 'server', target: 'data', animated: false },
    { id: 'e5', source: 'server', target: 'queue', animated: true },
    { id: 'e6', source: 'queue', target: 'worker1', animated: true },
    { id: 'e7', source: 'queue', target: 'worker2', animated: true },
    { id: 'e8', source: 'queue', target: 'worker3', animated: true },
    { id: 'e9', source: 'worker2', target: 'analytics', animated: true },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'service',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: type,
        icon: type.toLowerCase().replace(' ', '-'),
        iconBg: '#f97316',
        borderColor: '#3b82f6',
      },
    };
    setNodes((nds) => [...nds, newNode]);
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
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Visual Architecture Editor
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={exportDiagram}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Node Palette */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Add Node:
          </span>
          {['Server', 'Database', 'Lambda', 'Queue', 'Worker', 'Analytics', 'S3', 'API Gateway'].map(
            (type) => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              >
                + {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1" style={{ backgroundColor: darkMode ? '#0f172a' : '#f9fafb' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: darkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 2 },
          }}
        >
          <Background
            color={darkMode ? '#1e293b' : '#e5e7eb'}
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'group') return '#374151';
              return '#3b82f6';
            }}
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#fff',
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
