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

export const DEFAULT_INFRASTRUCTURE_CODE = `# Clean Architecture - Horizontal Swimlanes
# Professional diagram like Eraser.io

groups:
  # Horizontal swimlanes
  - id: client-layer
    name: CLIENT LAYER
    color: "#3b82f6"
    position: { x: 50, y: 50 }
    size: { width: 1400, height: 100 }

  - id: api-layer
    name: API GATEWAY LAYER
    color: "#8b5cf6"
    position: { x: 50, y: 180 }
    size: { width: 1400, height: 100 }

  - id: service-layer
    name: SERVICE LAYER
    color: "#ec4899"
    position: { x: 50, y: 310 }
    size: { width: 1400, height: 100 }

  - id: data-layer
    name: DATA LAYER
    color: "#10b981"
    position: { x: 50, y: 440 }
    size: { width: 1400, height: 100 }

nodes:
  # Client Layer
  - id: web-app
    label: Web App
    type: server
    icon: globe
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 200, y: 75 }

  - id: mobile-app
    label: Mobile App
    type: server
    icon: globe
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 450, y: 75 }

  - id: admin-panel
    label: Admin Panel
    type: server
    icon: globe
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 700, y: 75 }

  # API Layer
  - id: load-balancer
    label: Load Balancer
    type: load-balancer
    icon: cloud
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 200, y: 205 }

  - id: api-gateway
    label: API Gateway
    type: api-gateway
    icon: globe
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 500, y: 205 }

  - id: auth-service
    label: Auth Service
    type: server
    icon: server
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 800, y: 205 }

  # Service Layer
  - id: user-service
    label: User Service
    type: server
    icon: server
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 150, y: 335 }

  - id: product-service
    label: Product Service
    type: server
    icon: server
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 400, y: 335 }

  - id: order-service
    label: Order Service
    type: server
    icon: server
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 650, y: 335 }

  - id: payment-service
    label: Payment Service
    type: server
    icon: server
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 900, y: 335 }

  - id: notification
    label: Notification
    type: server
    icon: server
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 1150, y: 335 }

  # Data Layer
  - id: postgres
    label: PostgreSQL
    type: database
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 200, y: 465 }

  - id: mongodb
    label: MongoDB
    type: database
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 500, y: 465 }

  - id: redis
    label: Redis Cache
    type: redis
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 800, y: 465 }

  - id: s3
    label: S3 Storage
    type: s3
    icon: s3
    iconColor: "#34d399"
    group: data-layer
    position: { x: 1100, y: 465 }

connections:
  # Client to API
  - from: web-app
    to: load-balancer
  - from: mobile-app
    to: load-balancer
  - from: admin-panel
    to: api-gateway

  # API to Services
  - from: load-balancer
    to: api-gateway
  - from: api-gateway
    to: auth-service
  - from: api-gateway
    to: user-service
  - from: api-gateway
    to: product-service
  - from: api-gateway
    to: order-service

  # Services to Data
  - from: user-service
    to: postgres
  - from: product-service
    to: mongodb
  - from: order-service
    to: postgres
  - from: payment-service
    to: postgres
  - from: user-service
    to: redis
  - from: product-service
    to: redis
  - from: notification
    to: s3
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

  // Create a map of group positions for calculating relative positions
  const groupPositions = new Map<string, { x: number; y: number }>();

  // Create group nodes
  infraCode.groups.forEach((group) => {
    groupPositions.set(group.id, group.position);

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
    let position = node.position || { x: 0, y: 0 };

    // If node belongs to a group, calculate relative position
    if (node.group && groupPositions.has(node.group)) {
      const groupPos = groupPositions.get(node.group)!;
      position = {
        x: position.x - groupPos.x,
        y: position.y - groupPos.y,
      };
    }

    const reactFlowNode: Node = {
      id: node.id,
      label: node.label,
      type: 'service',
      position: position,
      data: {
        label: node.label,
        icon: node.icon,
        iconColor: node.iconColor || '#60a5fa',
        borderColor: '#4b5563',
        bgColor: '#374151',
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
