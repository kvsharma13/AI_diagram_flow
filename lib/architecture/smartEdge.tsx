'use client';

import React from 'react';
import { EdgeProps, useNodes } from 'reactflow';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GRID_SIZE = 20;
const PADDING = 30;

function getNodeBounds(nodes: any[], sourceId: string, targetId: string): Rect[] {
  return nodes
    .filter((n) => n.id !== sourceId && n.id !== targetId && n.type !== 'group')
    .map((n) => ({
      x: n.positionAbsolute?.x ?? n.position.x,
      y: n.positionAbsolute?.y ?? n.position.y,
      width: n.width || 160,
      height: n.height || 56,
    }));
}

function pointInRect(px: number, py: number, rect: Rect, pad: number): boolean {
  return (
    px >= rect.x - pad &&
    px <= rect.x + rect.width + pad &&
    py >= rect.y - pad &&
    py <= rect.y + rect.height + pad
  );
}

function lineIntersectsRects(
  x1: number, y1: number,
  x2: number, y2: number,
  rects: Rect[],
  pad: number
): boolean {
  // Sample along the line to check for intersections
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / (GRID_SIZE / 2);
  const numSteps = Math.max(Math.ceil(steps), 4);

  for (let i = 1; i < numSteps; i++) {
    const t = i / numSteps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;

    for (const rect of rects) {
      if (pointInRect(px, py, rect, pad)) {
        return true;
      }
    }
  }
  return false;
}

// A* pathfinding with proper path reconstruction
function findSmartPath(
  start: Point,
  end: Point,
  obstacles: Rect[]
): Point[] {
  const sx = Math.round(start.x / GRID_SIZE) * GRID_SIZE;
  const sy = Math.round(start.y / GRID_SIZE) * GRID_SIZE;
  const ex = Math.round(end.x / GRID_SIZE) * GRID_SIZE;
  const ey = Math.round(end.y / GRID_SIZE) * GRID_SIZE;

  if (sx === ex && sy === ey) return [start, end];

  // Check if direct line is clear
  if (!lineIntersectsRects(start.x, start.y, end.x, end.y, obstacles, PADDING / 2)) {
    return [start, end];
  }

  const keyFn = (x: number, y: number) => `${x},${y}`;
  const heuristic = (x: number, y: number) =>
    Math.abs(x - ex) + Math.abs(y - ey);

  interface AStarNode {
    x: number;
    y: number;
    g: number;
    f: number;
    parent: string | null;
  }

  const openSet = new Map<string, AStarNode>();
  const closedSet = new Map<string, AStarNode>();

  const startKey = keyFn(sx, sy);
  openSet.set(startKey, { x: sx, y: sy, g: 0, f: heuristic(sx, sy), parent: null });

  const directions = [
    [GRID_SIZE, 0],
    [-GRID_SIZE, 0],
    [0, GRID_SIZE],
    [0, -GRID_SIZE],
  ];

  let iterations = 0;
  const maxIterations = 3000;

  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;

    let bestKey = '';
    let bestF = Infinity;
    for (const [k, node] of openSet) {
      if (node.f < bestF) {
        bestF = node.f;
        bestKey = k;
      }
    }

    const current = openSet.get(bestKey)!;
    openSet.delete(bestKey);
    closedSet.set(bestKey, current);

    if (current.x === ex && current.y === ey) {
      // Reconstruct path
      const path: Point[] = [];
      let node: AStarNode | undefined = current;
      let nodeKey: string | null = bestKey;

      while (node) {
        path.unshift({ x: node.x, y: node.y });
        nodeKey = node.parent;
        node = nodeKey ? closedSet.get(nodeKey) : undefined;
      }

      // Simplify path - remove collinear points
      const simplified: Point[] = [start];
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];
        // Keep point if direction changes
        if (
          (curr.x - prev.x !== next.x - curr.x) ||
          (curr.y - prev.y !== next.y - curr.y)
        ) {
          simplified.push(curr);
        }
      }
      simplified.push(end);
      return simplified;
    }

    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nk = keyFn(nx, ny);

      if (closedSet.has(nk)) continue;

      let blocked = false;
      for (const rect of obstacles) {
        if (pointInRect(nx, ny, rect, PADDING / 2)) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      const ng = current.g + GRID_SIZE;
      const existing = openSet.get(nk);

      if (!existing || ng < existing.g) {
        openSet.set(nk, {
          x: nx,
          y: ny,
          g: ng,
          f: ng + heuristic(nx, ny),
          parent: keyFn(current.x, current.y),
        });
      }
    }
  }

  // Fallback: return straight line
  return [start, end];
}

// Build SVG path from points with smooth corners
function buildSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const radius = 8;
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Calculate direction vectors
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 === 0 || len2 === 0) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const r = Math.min(radius, len1 / 2, len2 / 2);

    const startX = curr.x - (dx1 / len1) * r;
    const startY = curr.y - (dy1 / len1) * r;
    const endX = curr.x + (dx2 / len2) * r;
    const endY = curr.y + (dy2 / len2) * r;

    d += ` L ${startX} ${startY}`;
    d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

// Clean orthogonal route between two handles: leave the source perpendicular to
// its face, cross the gap on a middle segment, enter the target perpendicular.
export function orthogonalRoute(
  sx: number, sy: number, sPos: any,
  tx: number, ty: number, tPos: any
): Point[] {
  const sH = sPos === 'left' || sPos === 'right';
  const tH = tPos === 'left' || tPos === 'right';
  if (sH && tH) {
    const midX = (sx + tx) / 2;
    return [{ x: sx, y: sy }, { x: midX, y: sy }, { x: midX, y: ty }, { x: tx, y: ty }];
  }
  if (!sH && !tH) {
    const midY = (sy + ty) / 2;
    return [{ x: sx, y: sy }, { x: sx, y: midY }, { x: tx, y: midY }, { x: tx, y: ty }];
  }
  // Mixed faces → single L-bend.
  if (sH) return [{ x: sx, y: sy }, { x: tx, y: sy }, { x: tx, y: ty }];
  return [{ x: sx, y: sy }, { x: sx, y: ty }, { x: tx, y: ty }];
}

// Bundled route through a shared trunk (axis 'x' = a vertical trunk at x=at;
// axis 'y' = a horizontal trunk at y=at). Edges sharing a hub share `at`, so
// they overlap into one trunk and branch near the ends (the eraser "bus" look).
export function bundledRoute(
  sx: number, sy: number, tx: number, ty: number,
  bundle: { axis: 'x' | 'y'; at: number }
): Point[] {
  if (bundle.axis === 'x') {
    return [{ x: sx, y: sy }, { x: bundle.at, y: sy }, { x: bundle.at, y: ty }, { x: tx, y: ty }];
  }
  return [{ x: sx, y: sy }, { x: sx, y: bundle.at }, { x: tx, y: bundle.at }, { x: tx, y: ty }];
}

// Best label spot: the longest segment whose MIDPOINT is clear of boxes (so a
// long cross-tier edge doesn't drop its label on a node or a group header).
// Falls back to the longest segment overall if every midpoint is blocked.
export function bestLabelPos(pts: Point[], obstacles: Rect[]): [number, number] {
  if (pts.length < 2) return [pts[0]?.x || 0, pts[0]?.y || 0];
  let clearLen = -1, cx = 0, cy = 0;
  let anyLen = -1, ax = 0, ay = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    const len = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
    if (len > anyLen) { anyLen = len; ax = mx; ay = my; }
    const blocked = obstacles.some((r) => pointInRect(mx, my, r, 8));
    if (!blocked && len > clearLen) { clearLen = len; cx = mx; cy = my; }
  }
  return clearLen >= 0 ? [cx, cy] : [ax, ay];
}

export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  animated,
  selected,
  markerEnd,
  data,
}: EdgeProps) {
  const nodes = useNodes();

  // Build an orthogonal point list for the edge: a bundled trunk route at a hub,
  // an A* detour when a straight shot is blocked, else a clean orthogonal route.
  let points: Point[];
  const bundle = (data as any)?.bundle as { axis: 'x' | 'y'; at: number } | undefined;
  if (bundle) {
    points = bundledRoute(sourceX, sourceY, targetX, targetY, bundle);
  } else {
    const obstacles = getNodeBounds(nodes, '', '').filter((rect) => {
      const nearSource =
        Math.abs(rect.x + rect.width / 2 - sourceX) < rect.width &&
        Math.abs(rect.y + rect.height / 2 - sourceY) < rect.height;
      const nearTarget =
        Math.abs(rect.x + rect.width / 2 - targetX) < rect.width &&
        Math.abs(rect.y + rect.height / 2 - targetY) < rect.height;
      return !nearSource && !nearTarget;
    });
    const hasObstacles = lineIntersectsRects(sourceX, sourceY, targetX, targetY, obstacles, PADDING / 2);
    points = hasObstacles
      ? findSmartPath({ x: sourceX, y: sourceY }, { x: targetX, y: targetY }, obstacles)
      : orthogonalRoute(sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition);
  }

  const pathD = buildSmoothPath(points);

  // Per-edge colour (tinted by source tier); indigo when selected/animated.
  const baseColor = (data as any)?.color || '#64748B';
  const stroke = selected || animated ? '#6366F1' : baseColor;
  const width = selected ? 3 : 2.2;

  // NB: labels are NOT drawn here — they're rendered together by <EdgeLabels/>
  // so they can be de-collided globally using the real rendered geometry.
  return (
    <>
      {/* soft halo keeps the line legible where it crosses a node/box edge */}
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={width + 5} strokeOpacity={0.14} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }} />
      <path
        id={id}
        className="react-flow__edge-path"
        d={pathD}
        markerEnd={markerEnd}
        fill="none"
        style={{
          stroke,
          strokeWidth: width,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          ...(animated ? { strokeDasharray: '7 7', animation: 'archFlow 0.7s linear infinite' } : {}),
        }}
      />
    </>
  );
}
