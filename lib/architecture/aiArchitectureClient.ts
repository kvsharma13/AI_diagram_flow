import { Node, Edge } from '@/types/architecture';
import { applyElkLayout } from './elkLayout';

// Shape returned by the OpenAI `architecture` generation (no coordinates).
interface AIGroup {
  id: string;
  name: string;
  parent?: string;
}
interface AINode {
  id: string;
  label: string;
  service?: string;
  group?: string;
}
interface AIConnection {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}
interface AIArchitectureJSON {
  title?: string;
  groups?: AIGroup[];
  nodes?: AINode[];
  connections?: AIConnection[];
}

export interface GeneratedArchitecture {
  nodes: Node[];
  edges: Edge[];
  title: string;
}

// Palette for group boundaries (cycled by order of appearance).
const GROUP_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#06b6d4', '#6366f1', '#ef4444',
];

/**
 * Calls the AI route, validates the JSON, converts it to store Node/Edge shape
 * and runs ELK auto-layout to compute positions and group sizes.
 * Returns layout-ready nodes/edges for the architecture store.
 */
export async function generateArchitecture(description: string): Promise<GeneratedArchitecture> {
  const response = await fetch('/api/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textInput: description, type: 'architecture' }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(payload?.error || 'Failed to generate architecture') as Error & {
      needsSubscription?: boolean;
      limitReached?: boolean;
    };
    err.needsSubscription = payload?.needsSubscription;
    err.limitReached = payload?.limitReached;
    throw err;
  }

  const ai: AIArchitectureJSON = payload?.data ?? payload;
  const { nodes, edges, title } = aiJsonToGraph(ai);

  // LLM gives no coordinates — ELK computes positions + group sizing.
  try {
    const result = await applyElkLayout(nodes, edges, 'horizontal');
    return { nodes: result.nodes, edges, title };
  } catch (e) {
    console.error('ELK layout failed, falling back to raw nodes:', e);
    return { nodes, edges, title };
  }
}

/** Pure converter: AI JSON → store Node[]/Edge[] (positions are placeholders). */
export function aiJsonToGraph(ai: AIArchitectureJSON): GeneratedArchitecture {
  const aiGroups = Array.isArray(ai.groups) ? ai.groups : [];
  const aiNodes = Array.isArray(ai.nodes) ? ai.nodes : [];
  const aiConnections = Array.isArray(ai.connections) ? ai.connections : [];

  const groupIds = new Set(aiGroups.map((g) => g.id));
  const nodeIds = new Set(aiNodes.map((n) => n.id));
  const allIds = new Set<string>([...groupIds, ...nodeIds]);

  const nodes: Node[] = [];

  // Groups first (parents before children) so layout/parenting is stable.
  const colorByGroup = new Map<string, string>();
  aiGroups.forEach((g, i) => colorByGroup.set(g.id, GROUP_COLORS[i % GROUP_COLORS.length]));

  const parentGroups = aiGroups.filter((g) => !g.parent || !groupIds.has(g.parent));
  const childGroups = aiGroups.filter((g) => g.parent && groupIds.has(g.parent));

  for (const g of [...parentGroups, ...childGroups]) {
    const node: Node = {
      id: g.id,
      label: g.name,
      type: 'group',
      position: { x: 0, y: 0 },
      data: {
        label: g.name,
        borderColor: colorByGroup.get(g.id),
        bgColor: 'transparent',
        width: '420px',
        height: '260px',
      },
    };
    if (g.parent && groupIds.has(g.parent)) {
      node.layerId = g.parent;
    }
    nodes.push(node);
  }

  // Service nodes.
  for (const n of aiNodes) {
    const service = (n.service || 'server').toString();
    const node: Node = {
      id: n.id,
      label: n.label || n.id,
      type: service,
      position: { x: 0, y: 0 },
      data: {
        label: n.label || n.id,
        service,
        type: service,
      },
    };
    if (n.group && groupIds.has(n.group)) {
      node.layerId = n.group;
    }
    nodes.push(node);
  }

  // Edges — keep only those between existing nodes/groups.
  const edges: Edge[] = [];
  aiConnections.forEach((c, i) => {
    if (!allIds.has(c.from) || !allIds.has(c.to) || c.from === c.to) return;
    const edge: Edge = {
      id: `e${i + 1}`,
      source: c.from,
      target: c.to,
      animated: Boolean(c.animated),
    };
    if (c.label) edge.label = c.label;
    edges.push(edge);
  });

  return { nodes, edges, title: (ai.title || 'AI Architecture').toString() };
}
