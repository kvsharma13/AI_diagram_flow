import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { BPMNNode, BPMNEdge, BPMNSwimlane } from '@/types/project';

const elk = new ELK();

export async function applyBPMNLayout(
  nodes: BPMNNode[],
  edges: BPMNEdge[],
  swimlanes: BPMNSwimlane[]
): Promise<BPMNNode[]> {
  const swimlaneMap = new Map(swimlanes.map((s) => [s.id, s]));

  // Group nodes by swimlane
  const nodesBySwimlane = new Map<string, BPMNNode[]>();
  const topLevelNodes: BPMNNode[] = [];

  for (const node of nodes) {
    if (node.swimlaneId && swimlaneMap.has(node.swimlaneId)) {
      if (!nodesBySwimlane.has(node.swimlaneId)) {
        nodesBySwimlane.set(node.swimlaneId, []);
      }
      nodesBySwimlane.get(node.swimlaneId)!.push(node);
    } else {
      topLevelNodes.push(node);
    }
  }

  const getNodeSize = (type: string) => {
    if (type === 'startEvent' || type === 'endEvent' || type === 'intermediateEvent') return { width: 48, height: 48 };
    if (type.includes('Gateway')) return { width: 48, height: 48 };
    if (type === 'subProcess') return { width: 200, height: 80 };
    if (type === 'dataObject' || type === 'dataStore') return { width: 60, height: 70 };
    return { width: 160, height: 56 };
  };

  const rootChildren: ElkNode[] = [];

  // Add swimlane groups
  const sortedSwimlanes = [...swimlanes].sort((a, b) => a.order - b.order);
  for (const swimlane of sortedSwimlanes) {
    const laneNodes = nodesBySwimlane.get(swimlane.id) || [];
    const children: ElkNode[] = laneNodes.map((n) => {
      const size = getNodeSize(n.type);
      return { id: n.id, width: size.width, height: size.height };
    });

    rootChildren.push({
      id: swimlane.id,
      layoutOptions: { 'elk.padding': '[top=40,left=50,bottom=20,right=20]' },
      children: children.length > 0 ? children : [{ id: `${swimlane.id}-placeholder`, width: 100, height: 40 }],
    });
  }

  // Add top-level nodes
  for (const node of topLevelNodes) {
    const size = getNodeSize(node.type);
    rootChildren.push({ id: node.id, width: size.width, height: size.height });
  }

  // Build ELK edges
  const allNodeIds = new Set(nodes.map((n) => n.id));
  const elkEdges: ElkExtendedEdge[] = edges
    .filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target))
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '70',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children: rootChildren,
    edges: elkEdges,
  };

  const layoutResult = await elk.layout(graph);

  // Extract positions
  const positionMap = new Map<string, { x: number; y: number }>();

  function extractPositions(elkNode: ElkNode, offsetX = 0, offsetY = 0) {
    if (elkNode.id !== 'root') {
      positionMap.set(elkNode.id, { x: (elkNode.x || 0) + offsetX, y: (elkNode.y || 0) + offsetY });
    }
    if (elkNode.children) {
      const childOffsetX = elkNode.id === 'root' ? 0 : (elkNode.x || 0) + offsetX;
      const childOffsetY = elkNode.id === 'root' ? 0 : (elkNode.y || 0) + offsetY;
      for (const child of elkNode.children) {
        extractPositions(child, childOffsetX, childOffsetY);
      }
    }
  }

  extractPositions(layoutResult);

  return nodes.map((node) => {
    const pos = positionMap.get(node.id);
    if (pos) return { ...node, position: pos };
    return node;
  });
}
