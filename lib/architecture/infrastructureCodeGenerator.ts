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
  label?: string;
}

export const DEFAULT_INFRASTRUCTURE_CODE = `# Clean Architecture
# Groups, nodes, connections with edge labels

groups:
  - id: client-layer
    name: Clients
    color: "#3b82f6"
    position: { x: 50, y: 50 }
    size: { width: 900, height: 120 }

  - id: api-layer
    name: API Layer
    color: "#8b5cf6"
    position: { x: 50, y: 200 }
    size: { width: 900, height: 120 }

  - id: service-layer
    name: Services
    color: "#ec4899"
    position: { x: 50, y: 360 }
    size: { width: 1100, height: 120 }

  - id: data-layer
    name: Data
    color: "#10b981"
    position: { x: 50, y: 520 }
    size: { width: 1100, height: 120 }

nodes:
  - id: web-app
    label: Web App
    type: server
    icon: globe
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 150, y: 80 }

  - id: mobile-app
    label: Mobile App
    type: server
    icon: smartphone
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 450, y: 80 }

  - id: admin-panel
    label: Admin Panel
    type: server
    icon: monitor
    iconColor: "#60a5fa"
    group: client-layer
    position: { x: 700, y: 80 }

  - id: load-balancer
    label: Load Balancer
    type: cloud
    icon: cloud
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 150, y: 230 }

  - id: api-gateway
    label: API Gateway
    type: api-gateway
    icon: globe
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 450, y: 230 }

  - id: auth-service
    label: Auth Service
    type: server
    icon: lock
    iconColor: "#a78bfa"
    group: api-layer
    position: { x: 700, y: 230 }

  - id: user-service
    label: User Service
    type: server
    icon: users
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 100, y: 390 }

  - id: product-service
    label: Product Service
    type: server
    icon: box
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 330, y: 390 }

  - id: order-service
    label: Order Service
    type: server
    icon: clipboard
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 560, y: 390 }

  - id: payment-service
    label: Payment Service
    type: server
    icon: credit-card
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 790, y: 390 }

  - id: notification
    label: Notifications
    type: server
    icon: bell
    iconColor: "#f472b6"
    group: service-layer
    position: { x: 1020, y: 390 }

  - id: postgres
    label: PostgreSQL
    type: database
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 150, y: 555 }

  - id: mongodb
    label: MongoDB
    type: database
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 420, y: 555 }

  - id: redis
    label: Redis Cache
    type: redis
    icon: database
    iconColor: "#34d399"
    group: data-layer
    position: { x: 700, y: 555 }

  - id: s3
    label: S3 Storage
    type: s3
    icon: s3
    iconColor: "#34d399"
    group: data-layer
    position: { x: 960, y: 555 }

connections:
  - from: web-app
    to: load-balancer
    label: HTTPS
  - from: mobile-app
    to: load-balancer
    label: HTTPS
  - from: admin-panel
    to: api-gateway
    label: REST

  - from: load-balancer
    to: api-gateway
  - from: api-gateway
    to: auth-service
    label: JWT
  - from: api-gateway
    to: user-service
  - from: api-gateway
    to: product-service
  - from: api-gateway
    to: order-service

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
    label: cache
  - from: product-service
    to: redis
    label: cache
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

  // Create group nodes — parent groups first, then child groups
  const parentGroups = infraCode.groups.filter((g) => !g.parentGroup);
  const childGroups = infraCode.groups.filter((g) => g.parentGroup);

  for (const group of [...parentGroups, ...childGroups]) {
    groupPositions.set(group.id, group.position);

    let position = group.position;
    const groupNode: Node = {
      id: group.id,
      label: group.name,
      type: 'group',
      position,
      data: {
        label: group.name,
        borderColor: group.color,
        bgColor: 'transparent',
        width: group.size.width + 'px',
        height: group.size.height + 'px',
      },
    };

    // Nested group — set parent and calculate relative position
    if (group.parentGroup && groupPositions.has(group.parentGroup)) {
      const parentPos = groupPositions.get(group.parentGroup)!;
      groupNode.position = {
        x: position.x - parentPos.x,
        y: position.y - parentPos.y,
      };
      groupNode.layerId = group.parentGroup;
    }

    nodes.push(groupNode);
  }

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
    const edge: Edge = {
      id: `e${index + 1}`,
      source: conn.from,
      target: conn.to,
      animated: conn.animated || false,
    };
    if (conn.label) {
      edge.label = conn.label;
    }
    edges.push(edge);
  });

  return { nodes, edges };
}
