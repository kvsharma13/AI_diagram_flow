'use client';

import React from 'react';
import { EdgeProps, getBezierPath, useNodes } from 'reactflow';

interface Point {
  x: number;
  y: number;
}

interface Rect {
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

export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) {
  const nodes = useNodes();
  const obstacles = getNodeBounds(
    nodes,
    // Extract source/target IDs from edge - we use position-based detection
    '',
    ''
  ).filter((rect) => {
    // Filter out obstacles that are near source or target
    const nearSource =
      Math.abs(rect.x + rect.width / 2 - sourceX) < rect.width &&
      Math.abs(rect.y + rect.height / 2 - sourceY) < rect.height;
    const nearTarget =
      Math.abs(rect.x + rect.width / 2 - targetX) < rect.width &&
      Math.abs(rect.y + rect.height / 2 - targetY) < rect.height;
    return !nearSource && !nearTarget;
  });

  const start: Point = { x: sourceX, y: sourceY };
  const end: Point = { x: targetX, y: targetY };

  // Check if direct path is clear — use bezier in that case for aesthetics
  const hasobstacles = lineIntersectsRects(
    sourceX, sourceY, targetX, targetY,
    obstacles, PADDING / 2
  );

  if (!hasobstacles) {
    // Use default bezier path when no obstacles
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return (
      <>
        <path
          id={id}
          style={style}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
          fill="none"
        />
        {label && (
          <>
            <rect
              x={labelX - 20}
              y={labelY - 8}
              width={40}
              height={16}
              rx={labelBgBorderRadius || 4}
              style={labelBgStyle as React.CSSProperties || { fill: 'rgba(15,23,42,0.8)' }}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              style={labelStyle as React.CSSProperties || { fill: '#94a3b8', fontSize: 10 }}
            >
              {label as string}
            </text>
          </>
        )}
      </>
    );
  }

  // A* pathfinding for obstacle avoidance
  const pathPoints = findSmartPath(start, end, obstacles);
  const pathD = buildSmoothPath(pathPoints);

  // Calculate label position at midpoint of path
  const midIdx = Math.floor(pathPoints.length / 2);
  const labelX = pathPoints.length > 1
    ? (pathPoints[midIdx - 1]?.x + pathPoints[midIdx]?.x) / 2 || sourceX
    : sourceX;
  const labelY = pathPoints.length > 1
    ? (pathPoints[midIdx - 1]?.y + pathPoints[midIdx]?.y) / 2 || sourceY
    : sourceY;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={pathD}
        markerEnd={markerEnd}
        fill="none"
      />
      {label && (
        <>
          <rect
            x={labelX - 20}
            y={labelY - 8}
            width={40}
            height={16}
            rx={labelBgBorderRadius || 4}
            style={labelBgStyle as React.CSSProperties || { fill: 'rgba(15,23,42,0.8)' }}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            style={labelStyle as React.CSSProperties || { fill: '#94a3b8', fontSize: 10 }}
          >
            {label as string}
          </text>
        </>
      )}
    </>
  );
}
