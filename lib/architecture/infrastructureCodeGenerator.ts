import { Node, Edge } from '@/types/architecture';

export interface InfrastructureCode {
  groups: InfrastructureGroup[];
  nodes: InfrastructureNode[];
  connections: InfrastructureConnection[];
}

export interface InfrastructureGroup {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  parentGroup?: string;
}

export interface InfrastructureNode {
  id: string;
  label: string;
  type: string;
  icon: string;
  iconColor: string;
  group?: string;
  position?: { x: number; y: number };
}

export interface InfrastructureConnection {
  from: string;
  to: string;
  animated?: boolean;
}

export const DEFAULT_INFRASTRUCTURE_CODE = `# AWS Infrastructure Architecture
# Define groups, nodes, and connections

groups:
  - id: vpc
    name: VPC SUBNET
    color: "#eab308"
    position: { x: 250, y: 0 }
    size: { width: 900, height: 500 }

  - id: main-server
    name: MAIN SERVER
    color: "#3b82f6"
    position: { x: 420, y: 100 }
    size: { width: 250, height: 280 }
    parentGroup: vpc

  - id: compute-nodes
    name: COMPUTE NODES
    color: "#ef4444"
    position: { x: 900, y: 50 }
    size: { width: 200, height: 420 }
    parentGroup: vpc

nodes:
  - id: api-gateway
    label: API gateway
    type: api-gateway
    icon: globe
    iconColor: "#ec4899"
    position: { x: 50, y: 200 }

  - id: lambda
    label: Lambda
    type: lambda
    icon: zap
    iconColor: "#f97316"
    position: { x: 220, y: 200 }

  - id: s3
    label: S3
    type: s3
    icon: s3
    iconColor: "#22c55e"
    position: { x: 220, y: 350 }

  - id: server
    label: Server
    type: server
    icon: server
    iconColor: "#f97316"
    group: main-server
    position: { x: 65, y: 60 }

  - id: data
    label: Data
    type: database
    icon: database
    iconColor: "#3b82f6"
    group: main-server
    position: { x: 65, y: 180 }

  - id: queue
    label: Queue
    type: queue
    icon: queue
    iconColor: "#ec4899"
    group: vpc
    position: { x: 720, y: 210 }

  - id: worker1
    label: Worker1
    type: worker
    icon: worker
    iconColor: "#f97316"
    group: compute-nodes
    position: { x: 40, y: 60 }

  - id: worker2
    label: Worker2
    type: worker
    icon: worker
    iconColor: "#f97316"
    group: compute-nodes
    position: { x: 40, y: 160 }

  - id: worker3
    label: Worker3
    type: worker
    icon: worker
    iconColor: "#f97316"
    group: compute-nodes
    position: { x: 40, y: 280 }

  - id: analytics
    label: Analytics
    type: analytics
    icon: analytics
    iconColor: "#8b5cf6"
    position: { x: 1200, y: 230 }

connections:
  - from: api-gateway
    to: lambda
    animated: true
  - from: lambda
    to: server
    animated: true
  - from: lambda
    to: s3
  - from: server
    to: data
  - from: server
    to: queue
    animated: true
  - from: queue
    to: worker1
    animated: true
  - from: queue
    to: worker2
    animated: true
  - from: queue
    to: worker3
    animated: true
  - from: worker2
    to: analytics
    animated: true
`;

export function parseInfrastructureCode(code: string): InfrastructureCode {
  const result: InfrastructureCode = {
    groups: [],
    nodes: [],
    connections: [],
  };

  try {
    const lines = code.split('\n');
    let currentSection: 'groups' | 'nodes' | 'connections' | null = null;
    let currentItem: any = null;
    let indent = 0;

    for (let line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || line.trim() === '') continue;

      // Detect sections
      if (line.trim() === 'groups:') {
        currentSection = 'groups';
        continue;
      } else if (line.trim() === 'nodes:') {
        currentSection = 'nodes';
        continue;
      } else if (line.trim() === 'connections:') {
        currentSection = 'connections';
        continue;
      }

      // Parse items
      if (line.trim().startsWith('- ')) {
        // Save previous item
        if (currentItem && currentSection) {
          result[currentSection].push(currentItem);
        }

        // Start new item
        currentItem = {};
        const match = line.match(/- (\w+):\s*(.+)/);
        if (match) {
          const [, key, value] = match;
          currentItem[key] = parseValue(value);
        }
      } else if (line.includes(':') && currentItem) {
        // Parse properties
        const match = line.match(/^\s+(\w+):\s*(.+)/);
        if (match) {
          const [, key, value] = match;
          currentItem[key] = parseValue(value);
        }
      }
    }

    // Save last item
    if (currentItem && currentSection) {
      result[currentSection].push(currentItem);
    }
  } catch (error) {
    console.error('Failed to parse infrastructure code:', error);
  }

  return result;
}

function parseValue(value: string): any {
  value = value.trim();

  // Parse objects like { x: 100, y: 200 }
  if (value.startsWith('{') && value.endsWith('}')) {
    try {
      return JSON.parse(value.replace(/(\w+):/g, '"$1":'));
    } catch {
      return value;
    }
  }

  // Parse strings
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  // Parse numbers
  if (!isNaN(Number(value))) {
    return Number(value);
  }

  // Parse booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  return value;
}

export function generateNodesAndEdges(infraCode: InfrastructureCode): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create group nodes
  infraCode.groups.forEach((group) => {
    nodes.push({
      id: group.id,
      label: group.name,
      type: 'group',
      position: group.position,
      data: {
        label: group.name,
        borderColor: group.color,
        bgColor: 'rgba(30, 41, 59, 0.3)',
        width: group.size.width + 'px',
        height: group.size.height + 'px',
      },
    });
  });

  // Create service nodes
  infraCode.nodes.forEach((node) => {
    const reactFlowNode: Node = {
      id: node.id,
      label: node.label,
      type: 'service',
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.label,
        icon: node.icon,
        iconBg: node.iconColor,
        borderColor: node.iconColor,
        bgColor: '#1e293b',
      },
    };

    if (node.group) {
      reactFlowNode.layerId = node.group;
    }

    nodes.push(reactFlowNode);
  });

  // Create edges
  infraCode.connections.forEach((conn, index) => {
    edges.push({
      id: `e${index + 1}`,
      source: conn.from,
      target: conn.to,
      animated: conn.animated || false,
    });
  });

  return { nodes, edges };
}
