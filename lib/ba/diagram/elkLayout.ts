import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import type { DiagramNode, DiagramEdge } from '@/types/project';

const elk = new ELK();

/* Generic ELK auto-layout for the shared DiagramNode/DiagramEdge shape
   (Use-Case, ERD). Mirrors lib/bpmn/elkLayout.ts but without swimlanes. */
export async function applyDiagramLayout(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  getSize: (n: DiagramNode) => { width: number; height: number },
  direction: 'RIGHT' | 'DOWN' = 'RIGHT',
): Promise<DiagramNode[]> {
  const ids = new Set(nodes.map((n) => n.id));
  const children: ElkNode[] = nodes.map((n) => {
    const s = getSize(n);
    return { id: n.id, width: s.width, height: s.height };
  });
  const elkEdges: ElkExtendedEdge[] = edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children,
    edges: elkEdges,
  };

  const res = await elk.layout(graph);
  const pos = new Map<string, { x: number; y: number }>();
  (res.children || []).forEach((c) => pos.set(c.id, { x: c.x || 0, y: c.y || 0 }));
  return nodes.map((n) => {
    const p = pos.get(n.id);
    return p ? { ...n, position: p } : n;
  });
}
