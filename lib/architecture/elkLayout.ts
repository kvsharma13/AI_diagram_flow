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
  const groupNodes = nodes.filter((n) => n.type === 'group');
  const serviceNodes = nodes.filter((n) => n.type !== 'group');

  // Build parent → children map
  const childrenByGroup = new Map<string, Node[]>();
  const topLevelServices: Node[] = [];

  for (const node of serviceNodes) {
    if (node.layerId) {
      if (!childrenByGroup.has(node.layerId)) {
        childrenByGroup.set(node.layerId, []);
      }
      childrenByGroup.get(node.layerId)!.push(node);
    } else {
      topLevelServices.push(node);
    }
  }

  // Also handle nested groups
  const childGroupsByParent = new Map<string, Node[]>();
  const topLevelGroups: Node[] = [];

  for (const group of groupNodes) {
    if (group.layerId) {
      if (!childGroupsByParent.has(group.layerId)) {
        childGroupsByParent.set(group.layerId, []);
      }
      childGroupsByParent.get(group.layerId)!.push(group);
    } else {
      topLevelGroups.push(group);
    }
  }

  // Size each node to its label so groups are sized to actually contain their
  // children (the rendered cards are wider/taller than a fixed 160×56).
  const sizeFor = (n: Node) => {
    const label = String((n as any).data?.label || n.label || '');
    const width = Math.min(300, Math.max(190, 78 + label.length * 7.2));
    return { width, height: 64 };
  };

  // Recursively build ELK children for a group
  function buildGroupElkNode(group: Node): ElkNode {
    const children: ElkNode[] = [];

    // Add service nodes that belong to this group
    const groupServices = childrenByGroup.get(group.id) || [];
    for (const svc of groupServices) {
      const sz = sizeFor(svc);
      children.push({ id: svc.id, width: sz.width, height: sz.height });
    }

    // Add nested groups
    const nestedGroups = childGroupsByParent.get(group.id) || [];
    for (const nested of nestedGroups) {
      children.push(buildGroupElkNode(nested));
    }

    return {
      id: group.id,
      layoutOptions: {
        'elk.padding': '[top=48,left=24,bottom=24,right=24]',
        'elk.spacing.nodeNode': '30',
        // Keep a group's members compact and balanced rather than a long line.
        'elk.layered.spacing.nodeNodeBetweenLayers': '60',
      },
      children: children.length > 0 ? children : undefined,
      width: children.length === 0 ? 360 : undefined,
      height: children.length === 0 ? 180 : undefined,
    };
  }

  // Build root graph
  const rootChildren: ElkNode[] = [];

  // Add top-level groups (with their children)
  for (const group of topLevelGroups) {
    rootChildren.push(buildGroupElkNode(group));
  }

  // Add top-level service nodes
  for (const svc of topLevelServices) {
    const sz = sizeFor(svc);
    rootChildren.push({ id: svc.id, width: sz.width, height: sz.height });
  }

  // Build ELK edges (only between nodes that exist)
  const allNodeIds = new Set(nodes.map((n) => n.id));
  const elkEdges: ElkExtendedEdge[] = edges
    .filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target))
    .map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction === 'horizontal' ? 'RIGHT' : 'DOWN',
      // Route edges across group boundaries and lay the whole hierarchy out as
      // one layered flow — this is what produces clean tiers + orthogonal routes
      // (without it, cross-group edges are not routed and bend points are wrong).
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '48',
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.layered.spacing.edgeNodeBetweenLayers': '40',
      'elk.spacing.edgeNode': '24',
      'elk.spacing.edgeEdge': '16',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: rootChildren,
    edges: elkEdges,
  };

  const layoutResult = await elk.layout(graph);

  // Extract positions from layout result
  const positionMap = new Map<string, { x: number; y: number }>();
  const sizeMap = new Map<string, { width: number; height: number }>();

  function extractPositions(elkNode: ElkNode, offsetX = 0, offsetY = 0) {
    if (elkNode.id !== 'root') {
      positionMap.set(elkNode.id, {
        x: (elkNode.x || 0) + offsetX,
        y: (elkNode.y || 0) + offsetY,
      });
      if (elkNode.width && elkNode.height) {
        sizeMap.set(elkNode.id, {
          width: elkNode.width,
          height: elkNode.height,
        });
      }
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

  // Extract edge bend points
  const edgeBendPoints = new Map<string, Array<{ x: number; y: number }>>();
  if (layoutResult.edges) {
    for (const edge of layoutResult.edges) {
      const elkEdge = edge as ElkExtendedEdge;
      if (elkEdge.sections) {
        const points: Array<{ x: number; y: number }> = [];
        for (const section of elkEdge.sections) {
          points.push(section.startPoint);
          if (section.bendPoints) {
            points.push(...section.bendPoints);
          }
          points.push(section.endPoint);
        }
        edgeBendPoints.set(elkEdge.id, points);
      }
    }
  }

  // Apply positions back to nodes
  const updatedNodes = nodes.map((node) => {
    const isGroup = node.type === 'group';
    const hasParent = !!node.layerId;

    // For nodes with parents, use the position relative to parent
    // (ELK already computes relative positions for children)
    if (hasParent) {
      const parentAbsPos = positionMap.get(node.layerId!);
      const absPos = positionMap.get(node.id);
      if (parentAbsPos && absPos) {
        return {
          ...node,
          position: {
            x: absPos.x - parentAbsPos.x,
            y: absPos.y - parentAbsPos.y,
          },
          ...(isGroup && sizeMap.has(node.id) ? {
            data: {
              ...node.data,
              width: sizeMap.get(node.id)!.width + 'px',
              height: sizeMap.get(node.id)!.height + 'px',
            },
          } : {}),
        };
      }
    }

    const pos = positionMap.get(node.id);
    if (pos) {
      return {
        ...node,
        position: pos,
        ...(isGroup && sizeMap.has(node.id) ? {
          data: {
            ...node.data,
            width: sizeMap.get(node.id)!.width + 'px',
            height: sizeMap.get(node.id)!.height + 'px',
          },
        } : {}),
      };
    }
    return node;
  });

  // Attach each edge's orthogonal route so renderers can draw the real path
  // instead of guessing (this is what makes the diagram look industry-grade).
  const updatedEdges: Edge[] = edges.map((e) => {
    const pts = edgeBendPoints.get(e.id);
    return pts && pts.length >= 2 ? { ...e, points: pts } : { ...e, points: undefined };
  });

  return { nodes: updatedNodes, edges: updatedEdges, edgeBendPoints };
}
