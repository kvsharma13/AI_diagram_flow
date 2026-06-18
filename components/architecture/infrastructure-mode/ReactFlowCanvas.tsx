'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node as RFNode,
  Edge as RFEdge,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  Position,
  MarkerType,
  NodeResizer,
  EdgeLabelRenderer,
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useArchitectureStore } from '@/store/architectureStore';
import { SmartEdge, orthogonalRoute, bundledRoute, bestLabelPos, Rect } from '@/lib/architecture/smartEdge';
import { resolveIcon } from '@/lib/architecture/iconMap';
import ServiceIcon from '@/components/architecture/ServiceIcon';

const handleStyle = {
  opacity: 0,
  width: 7,
  height: 7,
  background: '#94a3b8',
  border: 'none',
  transition: 'opacity 0.15s',
};

// Unified Service Node — icon-forward, eraser-style card with brand logo,
// left accent bar, type badge and bold service name.
// Normalize a group colour to a mid-lightness tone that stays legible on BOTH
// the dark and the light canvas (avoids invisible dark navies and neon brights).
function normalizeEdgeColor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#64748B';
  const int = parseInt(m[1], 16);
  let r = ((int >> 16) & 255) / 255;
  let g = ((int >> 8) & 255) / 255;
  let b = (int & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const S = Math.min(Math.max(s, 0.4), 0.62);
  const L = 0.62;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(hue2rgb(p, q, h + 1 / 3))}${toHex(hue2rgb(p, q, h))}${toHex(hue2rgb(p, q, h - 1 / 3))}`;
}

// Renders ALL edge labels in one overlay, using React Flow's REAL node geometry
// (positions + measured sizes). Because every label is placed here together, we
// can de-collide them globally so they never stack — and because it uses the
// same geometry the edges are drawn from, each label sits on its own line.
function EdgeLabels() {
  const edges = useStore((s: any) => s.edges);
  const nodeInternals = useStore((s: any) => s.nodeInternals);

  const rectOf = (id: string) => {
    const n: any = nodeInternals.get(id);
    if (!n || !n.positionAbsolute) return null;
    return { x: n.positionAbsolute.x, y: n.positionAbsolute.y, w: n.width || 180, h: n.height || 60, type: n.type };
  };
  const sideOf = (hid?: string | null) => (hid ? hid.split('-')[1] : undefined);
  const handlePt = (r: any, side?: string) => {
    if (side === 'right') return { x: r.x + r.w, y: r.y + r.h / 2 };
    if (side === 'left') return { x: r.x, y: r.y + r.h / 2 };
    if (side === 'top') return { x: r.x + r.w / 2, y: r.y };
    if (side === 'bottom') return { x: r.x + r.w / 2, y: r.y + r.h };
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  };

  const obstacles: Rect[] = [];
  nodeInternals.forEach((n: any) => {
    if (!n.positionAbsolute) return;
    const w = n.width || 180;
    const h = n.height || 60;
    obstacles.push(
      n.type === 'group'
        ? { x: n.positionAbsolute.x, y: n.positionAbsolute.y, width: w, height: 34 }
        : { x: n.positionAbsolute.x, y: n.positionAbsolute.y, width: w, height: h }
    );
  });

  const items = edges
    .filter((e: any) => e.label && e.sourceHandle && e.targetHandle)
    .map((e: any) => {
      const sr = rectOf(e.source);
      const tr = rectOf(e.target);
      if (!sr || !tr) return null;
      const ss = sideOf(e.sourceHandle);
      const ts = sideOf(e.targetHandle);
      const hs = handlePt(sr, ss);
      const ht = handlePt(tr, ts);
      const route = e.data?.bundle
        ? bundledRoute(hs.x, hs.y, ht.x, ht.y, e.data.bundle)
        : orthogonalRoute(hs.x, hs.y, ss, ht.x, ht.y, ts);
      const [x, y] = bestLabelPos(route, obstacles);
      const label = String(e.label);
      return { id: e.id, label, x, y, w: label.length * 6 + 18, h: 20 };
    })
    .filter(Boolean) as Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;

  // De-collide: push overlapping labels apart along the smaller penetration axis.
  for (let iter = 0; iter < 16; iter++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const ox = (a.w + b.w) / 2 + 6 - Math.abs(a.x - b.x);
        const oy = (a.h + b.h) / 2 + 4 - Math.abs(a.y - b.y);
        if (ox > 0 && oy > 0) {
          if (oy <= ox) {
            const p = oy / 2 + 0.5;
            if (a.y <= b.y) { a.y -= p; b.y += p; } else { a.y += p; b.y -= p; }
          } else {
            const p = ox / 2 + 0.5;
            if (a.x <= b.x) { a.x -= p; b.x += p; } else { a.x += p; b.x -= p; }
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return (
    <EdgeLabelRenderer>
      {items.map((l) => (
        <div
          key={l.id}
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px)`,
            background: 'rgba(15, 23, 42, 0.94)',
            color: '#E2E8F0',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.04em',
            padding: '3px 8px',
            borderRadius: 8,
            border: '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {l.label}
        </div>
      ))}
    </EdgeLabelRenderer>
  );
}

const ServiceNode = ({ data, selected }: any) => {
  const spec = resolveIcon({
    service: data.service || data.icon,
    type: data.type,
    label: data.label,
  });

  return (
    <div
      className="group transition-transform duration-200 hover:-translate-y-[2px]"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #18243C 0%, #0E1626 100%)',
        border: `1px solid ${selected ? spec.accent + 'CC' : spec.accent + '33'}`,
        borderRadius: '11px',
        minWidth: '172px',
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 1px ${spec.accent}66, 0 0 22px ${spec.accent}22, 0 10px 28px rgba(0,0,0,0.5)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 3px 12px rgba(0,0,0,0.45)',
      }}
    >
      {/* Left accent strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: spec.accent,
          borderRadius: '10px 0 0 10px',
        }}
      />

      {/* Handles on every side (source + target) so edges can attach to the face
          that points at the other node — this is what keeps fan-outs tidy. */}
      <Handle id="t-top" type="target" position={Position.Top} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="s-top" type="source" position={Position.Top} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="t-bottom" type="target" position={Position.Bottom} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="s-bottom" type="source" position={Position.Bottom} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="t-left" type="target" position={Position.Left} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="s-left" type="source" position={Position.Left} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="t-right" type="target" position={Position.Right} style={handleStyle} className="group-hover:!opacity-70" />
      <Handle id="s-right" type="source" position={Position.Right} style={handleStyle} className="group-hover:!opacity-70" />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 14px 10px 17px' }}>
        {/* Icon tile */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: spec.brand ? 'rgba(255,255,255,0.06)' : spec.accent + '1A',
            border: `1px solid ${spec.accent}22`,
            flexShrink: 0,
          }}
        >
          <ServiceIcon spec={spec} size={21} />
        </div>
        {/* Text column */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '8.5px',
              fontWeight: 700,
              letterSpacing: '0.09em',
              color: spec.accent,
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            {spec.label}
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#E2E8F0',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Node — subtle dashed border, downward tag badge from top
const GroupNode = ({ data, selected }: any) => {
  const borderColor = data.borderColor || '#6b7280';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `${borderColor}0D`,
        border: `1px solid ${borderColor}30`,
        borderRadius: '14px',
        boxShadow: `inset 0 0 40px ${borderColor}08`,
      }}
    >
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={220}
        minHeight={130}
        handleStyle={{ width: 9, height: 9, borderRadius: 2 }}
        lineStyle={{ borderColor: `${borderColor}66` }}
      />
      {/* Downward tag badge from top */}
      <div
        style={{
          position: 'absolute',
          top: '-1px',
          left: '16px',
          background: borderColor,
          borderRadius: '0 0 6px 6px',
          padding: '2px 10px 3px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#fff',
            textTransform: 'uppercase',
          }}
        >
          {data.label}
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
  group: GroupNode,
};

const edgeTypes = {
  smart: SmartEdge,
};

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  showCodePanel: boolean;
  onDeleteNode?: () => void;
  lightBg?: boolean;
}

export default function ReactFlowCanvas({
  selectedNodeId,
  onSelectNode,
  showCodePanel,
  onDeleteNode,
  lightBg = false,
}: Props) {
  const { diagram, setNodes: storeSetNodes, setEdges: storeSetEdges } = useArchitectureStore();

  // Convert store nodes/edges to ReactFlow format
  const rfNodes = (diagram?.nodes || []) as RFNode[];

  // First, get all valid parent node IDs
  const validParentIds = new Set(
    rfNodes.filter((n) => n.type === 'group').map((n) => n.id)
  );

  // Bounding box of each group's children, so a group is always sized to contain
  // them (prevents nodes spilling out, regardless of layout or imported sizes).
  const groupBounds = new Map<string, { w: number; h: number }>();
  rfNodes.forEach((n: any) => {
    const pid = n.layerId;
    if (pid && validParentIds.has(pid) && n.type !== 'group') {
      const label = String(n.data?.label || n.label || '');
      const w = Math.min(300, Math.max(190, 78 + label.length * 7.2));
      const right = (n.position?.x || 0) + w;
      const bottom = (n.position?.y || 0) + 72;
      const cur = groupBounds.get(pid) || { w: 0, h: 0 };
      groupBounds.set(pid, { w: Math.max(cur.w, right), h: Math.max(cur.h, bottom) });
    }
  });

  // Convert nodes, validating parent relationships
  const convertedNodes: RFNode[] = rfNodes
    .map((node) => {
      const nodeData = node as any;
      // All non-group nodes map to 'service'
      const nodeType = node.type || 'service';
      let rfType = 'service';
      if (nodeType === 'group') rfType = 'group';

      const rfNode: RFNode = {
        id: node.id,
        type: rfType,
        position: node.position,
        data: {
          ...nodeData.data,
          label: nodeData.label,
          icon: nodeData.icon || node.type,
          type: nodeData.type,
          service: nodeData.data?.service ?? nodeData.service,
        },
      };

      // Handle parent-child relationships - only if parent exists
      if (nodeData.layerId && validParentIds.has(nodeData.layerId)) {
        rfNode.parentNode = nodeData.layerId;
        rfNode.extent = 'parent' as const;
      }

      // Size group nodes to at least bound their children — so contents can
      // never overflow the box — while still allowing a larger manual/code size.
      if (node.type === 'group') {
        const b = groupBounds.get(node.id);
        const dataW = nodeData.data?.width ? parseInt(nodeData.data.width) : 0;
        const dataH = nodeData.data?.height ? parseInt(nodeData.data.height) : 0;
        rfNode.style = {
          width: Math.max(b ? b.w + 30 : 0, dataW) || 400,
          height: Math.max(b ? b.h + 30 : 0, dataH) || 200,
          zIndex: nodeData.layerId ? -1 : -2,
        };
      }

      return rfNode;
    })
    // Sort: parent groups first, then child groups, then service nodes
    .sort((a, b) => {
      const order = (n: RFNode) => {
        if (n.type === 'group' && !n.parentNode) return 0;
        if (n.type === 'group' && n.parentNode) return 1;
        return 2;
      };
      return order(a) - order(b);
    });

  // Absolute centre of any node (accounting for parent-group offset).
  const nodeById = new Map(rfNodes.map((n) => [n.id, n]));
  const absCenter = (id: string): { x: number; y: number } | null => {
    const n = nodeById.get(id) as any;
    if (!n) return null;
    let x = n.position?.x || 0;
    let y = n.position?.y || 0;
    let pid = n.layerId;
    while (pid && nodeById.has(pid)) {
      const p = nodeById.get(pid) as any;
      x += p.position?.x || 0;
      y += p.position?.y || 0;
      pid = p.layerId;
    }
    const w = n.type === 'group' ? parseInt(n.data?.width) || 320 : 210;
    const h = n.type === 'group' ? parseInt(n.data?.height) || 160 : 64;
    return { x: x + w / 2, y: y + h / 2 };
  };

  // Edge colour = the (normalised) colour of the group the edge originates in,
  // so each tier's flows are visually distinct. Falls back to neutral slate.
  const edgeColorFor = (sourceId: string): string => {
    const n = nodeById.get(sourceId) as any;
    const g = n?.layerId ? (nodeById.get(n.layerId) as any) : null;
    return g?.data?.borderColor ? normalizeEdgeColor(g.data.borderColor) : '#64748B';
  };

  // Estimated edge-of-node handle point (only used to position a shared trunk;
  // the actual line endpoints come from React Flow's real geometry).
  const estSize = (n: any) =>
    n?.type === 'group'
      ? { w: parseInt(n.data?.width) || 320, h: parseInt(n.data?.height) || 160 }
      : { w: Math.min(300, Math.max(190, 78 + String(n?.data?.label || n?.label || '').length * 7.2)), h: 64 };
  const handleEst = (id: string, side: string) => {
    const c = absCenter(id);
    const n = nodeById.get(id) as any;
    if (!c || !n) return null;
    const { w, h } = estSize(n);
    if (side === 'right') return { x: c.x + w / 2, y: c.y };
    if (side === 'left') return { x: c.x - w / 2, y: c.y };
    if (side === 'top') return { x: c.x, y: c.y - h / 2 };
    return { x: c.x, y: c.y + h / 2 };
  };

  // First, choose each edge's attachment faces.
  const sided = (diagram?.edges || []).map((edge) => {
    const s = absCenter(edge.source);
    const t = absCenter(edge.target);
    const bothServices =
      (nodeById.get(edge.source) as any)?.type !== 'group' &&
      (nodeById.get(edge.target) as any)?.type !== 'group';
    let sSide: string | undefined;
    let tSide: string | undefined;
    if (s && t && bothServices) {
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      if (Math.abs(dx) >= Math.abs(dy)) {
        sSide = dx >= 0 ? 'right' : 'left';
        tSide = dx >= 0 ? 'left' : 'right';
      } else {
        sSide = dy >= 0 ? 'bottom' : 'top';
        tSide = dy >= 0 ? 'top' : 'bottom';
      }
    }
    return { edge, sSide, tSide };
  });

  // Count fan-out (per source face) and fan-in (per target face) so we can bundle
  // hubs through a shared trunk instead of spraying N parallel lines.
  const outDeg = new Map<string, number>();
  const inDeg = new Map<string, number>();
  sided.forEach(({ edge, sSide, tSide }) => {
    if (sSide) outDeg.set(`${edge.source}|${sSide}`, (outDeg.get(`${edge.source}|${sSide}`) || 0) + 1);
    if (tSide) inDeg.set(`${edge.target}|${tSide}`, (inDeg.get(`${edge.target}|${tSide}`) || 0) + 1);
  });

  const BUNDLE = 46;
  const rfEdges: RFEdge[] = sided.map(({ edge, sSide, tSide }) => {
    let bundle: { axis: 'x' | 'y'; at: number } | undefined;
    if (sSide && tSide) {
      const od = outDeg.get(`${edge.source}|${sSide}`) || 0;
      const id_ = inDeg.get(`${edge.target}|${tSide}`) || 0;
      const horiz = sSide === 'left' || sSide === 'right';
      if (od >= 3 && od >= id_) {
        // Fan-out: trunk just past the source.
        const h = handleEst(edge.source, sSide);
        if (h) bundle = horiz
          ? { axis: 'x', at: h.x + (sSide === 'right' ? BUNDLE : -BUNDLE) }
          : { axis: 'y', at: h.y + (sSide === 'bottom' ? BUNDLE : -BUNDLE) };
      } else if (id_ >= 3) {
        // Fan-in: trunk just before the target.
        const h = handleEst(edge.target, tSide);
        if (h) bundle = horiz
          ? { axis: 'x', at: h.x + (tSide === 'left' ? -BUNDLE : BUNDLE) }
          : { axis: 'y', at: h.y + (tSide === 'top' ? -BUNDLE : BUNDLE) };
      }
    }
    const color = edgeColorFor(edge.source);
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: sSide ? `s-${sSide}` : undefined,
      targetHandle: tSide ? `t-${tSide}` : undefined,
      type: 'smart',
      animated: edge.animated,
      style: { stroke: color, strokeWidth: 2.2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color },
      // Labels render globally in <EdgeLabels/>; `bundle` is the shared trunk.
      data: { color, bundle },
      ...(edge.label ? { label: edge.label } : {}),
    };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(convertedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);
  const isInitialMount = useRef(true);
  const prevNodeIdsRef = useRef<string>('');

  // Sync when:
  // 1. Initial mount
  // 2. Node IDs completely change (new diagram generated from code)
  useEffect(() => {
    // Re-sync when structure OR positions/sizes change — so auto-layout and the
    // direction toggle actually move the nodes (not just on a new diagram). The
    // store only updates on drag-end, so this never fights an in-progress drag.
    // Position-only signature: re-sync on layout/structure changes, but NOT on a
    // group resize (size-only), so NodeResizer is not reset mid-drag.
    const syncSig = (diagram?.nodes || [])
      .map((n: any) => `${n.id}:${Math.round(n.position?.x ?? 0)},${Math.round(n.position?.y ?? 0)}`)
      .join('|');

    if (isInitialMount.current || prevNodeIdsRef.current !== syncSig) {
      setNodes(convertedNodes);
      prevNodeIdsRef.current = syncSig;
      if (isInitialMount.current) isInitialMount.current = false;
    }
  }, [diagram?.nodes, setNodes]);

  // Sync edges when they change
  useEffect(() => {
    setEdges(rfEdges);
  }, [diagram?.edges, setEdges]);

  // Handle node changes and sync to store
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);

      // A dragged node invalidates its pre-computed routes — drop them so the
      // connected edges fall back to a clean direct path until the next layout.
      const movedIds = changes
        .filter((c) => c.type === 'position' && c.position)
        .map((c) => c.id);
      if (movedIds.length) {
        const moved = new Set(movedIds);
        setEdges((eds) =>
          eds.map((e) =>
            (moved.has(e.source) || moved.has(e.target)) && (e.data as any)?.points
              ? { ...e, data: { ...e.data, points: undefined } }
              : e
          )
        );
      }

      if (!diagram) return;

      // Check for node removals
      const removeChanges = changes.filter((change) => change.type === 'remove');
      if (removeChanges.length > 0) {
        const removedIds = new Set(removeChanges.map((change) => change.id));

        // Get current positions from React Flow nodes before filtering
        setNodes((currentNodes) => {
          const currentPositions = new Map(
            currentNodes.map((n) => [n.id, n.position])
          );

          // Update store with current positions and filter removed nodes
          const newNodes = diagram.nodes
            .filter((node) => !removedIds.has(node.id))
            .map((node) => ({
              ...node,
              position: currentPositions.get(node.id) || node.position,
            }));

          const newEdges = diagram.edges.filter(
            (edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target)
          );

          storeSetNodes(newNodes);
          storeSetEdges(newEdges);

          return currentNodes; // Return unchanged, onNodesChange already handled the removal
        });
      }

      // Check for position changes (when dragging ends)
      const positionChanges = changes.filter(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (positionChanges.length > 0) {
        setNodes((currentNodes) => {
          const updatedNodes = diagram.nodes.map((node) => {
            const currentNode = currentNodes.find((n) => n.id === node.id);
            if (currentNode) {
              return { ...node, position: currentNode.position };
            }
            return node;
          });
          storeSetNodes(updatedNodes);
          return currentNodes; // Return unchanged, onNodesChange already handled the position update
        });
      }

      // Persist group container resizes (NodeResizer). Excludes mount auto-measure
      // (which has no `resizing` flag). Safe to run live — the sync is position-only.
      const dimChanges = changes.filter(
        (change: any) => change.type === 'dimensions' && change.dimensions && change.resizing !== undefined
      );
      if (dimChanges.length > 0) {
        const updated = diagram.nodes.map((node) => {
          const ch = dimChanges.find((c: any) => c.id === node.id);
          if (ch && node.type === 'group') {
            return {
              ...node,
              data: {
                ...(node as any).data,
                width: Math.round(ch.dimensions.width) + 'px',
                height: Math.round(ch.dimensions.height) + 'px',
              },
            };
          }
          return node;
        });
        storeSetNodes(updated);
      }
    },
    [onNodesChange, diagram, storeSetNodes, storeSetEdges, setNodes]
  );

  // Handle edge changes and sync deletions to store
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);

      // Check for edge removals
      const removeChanges = changes.filter((change) => change.type === 'remove');
      if (removeChanges.length > 0 && diagram) {
        const removedIds = new Set(removeChanges.map((change) => change.id));
        const newEdges = diagram.edges.filter((edge) => !removedIds.has(edge.id));
        storeSetEdges(newEdges);
      }
    },
    [onEdgesChange, diagram, storeSetEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smart',
        animated: false,
        style: { stroke: '#3F4E63', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#8593AD' },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Update store
      if (diagram) {
        storeSetEdges([
          ...diagram.edges,
          {
            id: `${connection.source}-${connection.target}`,
            source: connection.source!,
            target: connection.target!,
            animated: true,
          },
        ]);
      }
    },
    [setEdges, diagram, storeSetEdges]
  );

  const handleNodeClick = useCallback(
    (_: any, node: RFNode) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  // Handle edge click to allow deletion
  const handleEdgeClick = useCallback(
    (_: any, edge: RFEdge) => {
      if (window.confirm('Delete this connection?')) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Update store
        if (diagram) {
          storeSetEdges(diagram.edges.filter((e) => e.id !== edge.id));
        }
      }
    },
    [diagram, storeSetEdges, setEdges]
  );

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        onDeleteNode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onDeleteNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      className={lightBg ? 'arch-light' : undefined}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      elementsSelectable={true}
      nodesDraggable={true}
      nodesConnectable={true}
      defaultEdgeOptions={{
        animated: false,
        style: { stroke: '#3F4E63', strokeWidth: 1.5 },
        type: 'smart',
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: '#8593AD' },
      }}
      connectionLineStyle={{ stroke: '#64748b', strokeWidth: 1.5 }}
      connectionLineType={ConnectionLineType.SmoothStep}
      minZoom={0.15}
      maxZoom={2.5}
      style={{ background: lightBg ? '#F1F5F9' : '#0B0F1A', transition: 'background 0.2s' }}
    >
      <Background color={lightBg ? 'rgba(15,23,42,0.16)' : 'rgba(71,85,105,0.3)'} variant={BackgroundVariant.Dots} gap={20} size={0.6} />
      <EdgeLabels />
      <Controls showInteractive={false} className="!bg-slate-900/80 !border-slate-700/50 !rounded-lg !shadow-lg [&_button]:!border-slate-700/30 [&_button]:!bg-transparent [&_button:hover]:!bg-slate-700/50 [&_button_svg]:!fill-slate-400" />
      <MiniMap
        nodeColor={(node) => node.type === 'group' ? 'rgba(71,85,105,0.4)' : 'rgba(148,163,184,0.6)'}
        maskColor="rgba(15,23,42,0.85)"
        style={{
          backgroundColor: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(51,65,85,0.4)',
          borderRadius: '8px',
        }}
      />
    </ReactFlow>
  );
}
