import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@/types/architecture';

const elk = new ELK();

export interface ElkLayoutResult {
  nodes: Node[];
  edges: Edge[];
  edgeBendPoints: Map<string, Array<{ x: number; y: number }>>;
}

export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'horizontal' | 'vertical'
): Promise<ElkLayoutResult> {
  const ROOT = '__root__';
  const dir = direction === 'horizontal' ? 'RIGHT' : 'DOWN';

  const groupNodes = nodes.filter((n) => n.type === 'group');
  const serviceNodes = nodes.filter((n) => n.type !== 'group');
  const groupIds = new Set(groupNodes.map((g) => g.id));

  // Immediate parent of every node (only when the parent is a real group).
  const parentOf = new Map<string, string>();
  for (const n of nodes) {
    if (n.layerId && groupIds.has(n.layerId)) parentOf.set(n.id, n.layerId);
  }

  // Size each node to its label so groups are sized to contain the rendered card.
  const sizeFor = (n: Node) => {
    const label = String((n as any).data?.label || n.label || '');
    const width = Math.min(300, Math.max(190, 78 + label.length * 7.2));
    return { width, height: 64 };
  };

  // The direct child of `container` that contains `nodeId` (used to map an edge
  // between deep nodes to an edge between this level's direct children).
  const ancestorChildOf = (container: string, nodeId: string): string | null => {
    let cur = nodeId;
    let parent = parentOf.get(cur);
    if (container === ROOT) {
      while (parent !== undefined) { cur = parent; parent = parentOf.get(cur); }
      return cur;
    }
    while (parent !== undefined) {
      if (parent === container) return cur;
      cur = parent;
      parent = parentOf.get(cur);
    }
    return null;
  };

  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter(
    (e) => e.source !== e.target && nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  const relPos = new Map<string, { x: number; y: number }>();
  const contentSize = new Map<string, { width: number; height: number }>();

  // Two-phase layout: lay out each container's direct children INDEPENDENTLY so
  // every group stays a tight, self-contained box, then arrange those boxes as
  // tiers. (A single flat pass with INCLUDE_CHILDREN lets group members scatter,
  // ballooning and overlapping the group boxes — exactly the bug we're fixing.)
  async function layoutContainer(container: string): Promise<{ width: number; height: number }> {
    const directServices = serviceNodes.filter((n) => (parentOf.get(n.id) ?? ROOT) === container);
    const directGroups = groupNodes.filter((n) => (parentOf.get(n.id) ?? ROOT) === container);

    // Lay out nested groups first so their measured size is used at this level.
    for (const g of directGroups) {
      contentSize.set(g.id, await layoutContainer(g.id));
    }

    const elkChildren: ElkNode[] = [
      ...directServices.map((n) => ({ id: n.id, ...sizeFor(n) })),
      ...directGroups.map((g) => ({ id: g.id, ...contentSize.get(g.id)! })),
    ];

    if (elkChildren.length === 0) return { width: 360, height: 180 };

    // Edges between this level's direct children (drives layering / ordering).
    const seen = new Set<string>();
    const elkEdges: ElkExtendedEdge[] = [];
    for (const e of validEdges) {
      const a = ancestorChildOf(container, e.source);
      const b = ancestorChildOf(container, e.target);
      if (a && b && a !== b && !seen.has(`${a}->${b}`)) {
        seen.add(`${a}->${b}`);
        elkEdges.push({ id: `${container}:${a}->${b}`, sources: [a], targets: [b] });
      }
    }

    const isRoot = container === ROOT;
    const layoutOptions: Record<string, string> = isRoot
      ? {
          'elk.algorithm': 'layered',
          'elk.direction': dir,
          'elk.edgeRouting': 'ORTHOGONAL',
          'elk.spacing.nodeNode': '70',
          'elk.layered.spacing.nodeNodeBetweenLayers': '130',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        }
      : elkEdges.length === 0
      ? {
          // No internal edges → pack tiles into a compact, balanced grid.
          'elk.algorithm': 'rectpacking',
          'elk.aspectRatio': '1.7',
          'elk.spacing.nodeNode': '24',
          'elk.padding': '[top=46,left=20,bottom=20,right=20]',
        }
      : {
          'elk.algorithm': 'layered',
          'elk.direction': dir,
          'elk.spacing.nodeNode': '34',
          // Wider gap between layers so edge labels fit between adjacent nodes.
          'elk.layered.spacing.nodeNodeBetweenLayers': '120',
          'elk.padding': '[top=46,left=20,bottom=20,right=20]',
        };

    const graph: ElkNode = {
      id: isRoot ? 'root' : `inner-${container}`,
      layoutOptions,
      children: elkChildren,
      edges: elkEdges,
    };
    const res = await elk.layout(graph);

    for (const c of res.children || []) {
      relPos.set(c.id, { x: c.x || 0, y: c.y || 0 });
    }
    return { width: Math.round(res.width || 360), height: Math.round(res.height || 180) };
  }

  await layoutContainer(ROOT);

  const updatedNodes = nodes.map((node) => {
    const pos = relPos.get(node.id);
    const placed = pos ? { ...node, position: pos } : node;
    if (node.type === 'group' && contentSize.has(node.id)) {
      const sz = contentSize.get(node.id)!;
      return { ...placed, data: { ...node.data, width: sz.width + 'px', height: sz.height + 'px' } };
    }
    return placed;
  });

  // On this clean tiered layout the renderer draws orthogonal (smoothstep) edges;
  // the two-phase pass intentionally does not carry ELK bend points.
  const updatedEdges: Edge[] = edges.map((e) => ({ ...e, points: undefined }));

  return { nodes: updatedNodes, edges: updatedEdges, edgeBendPoints: new Map() };
}
