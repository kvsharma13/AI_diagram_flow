import type { Project } from '@/types/project';

/**
 * Renders project diagrams to PNG **from stored data** (no live DOM, no mounted
 * editor) so the SOW reliably embeds them. Architecture + Gantt are drawn as
 * self-contained SVG → PNG; RACI/BPMN return null (RACI is rendered as a table
 * in the SOW content; BPMN embedding is a later phase).
 */

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

// Rasterise an SVG string to a PNG data URL on a white background (browser only).
function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

const FONT = "font-family='Inter, system-ui, -apple-system, Segoe UI, sans-serif'";
const PHASE_COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444'];

// ── Gantt → horizontal bar chart ──────────────────────────────────────────
function renderGanttSvg(phases: any[], unit: 'months' | 'weeks') {
  const u = unit === 'weeks' ? 'Week' : 'Month';
  const total = Math.max(1, ...phases.map((p) => (p.startMonth || 1) + (p.duration || 1) - 1));
  const padLeft = 210, padTop = 46, padRight = 24, rowH = 38, barH = 20;
  const chartW = 700;
  const width = padLeft + chartW + padRight;
  const height = padTop + phases.length * rowH + 16;
  const unitW = chartW / total;

  let grid = '';
  for (let i = 0; i <= total; i++) {
    const x = padLeft + i * unitW;
    grid += `<line x1='${x}' y1='${padTop - 8}' x2='${x}' y2='${height - 8}' stroke='#E2E8F0' stroke-width='1'/>`;
    if (i < total) grid += `<text x='${x + 4}' y='${padTop - 14}' ${FONT} font-size='10' fill='#94A3B8'>${u} ${i + 1}</text>`;
  }

  let rows = '';
  phases.forEach((p, i) => {
    const y = padTop + i * rowH;
    const x = padLeft + ((p.startMonth || 1) - 1) * unitW;
    const w = Math.max((p.duration || 1) * unitW - 4, 10);
    const color = PHASE_COLORS[i % PHASE_COLORS.length];
    rows +=
      `<text x='16' y='${y + barH / 2 + 4}' ${FONT} font-size='12' fill='#1E293B'>${esc(truncate(p.name || `Phase ${i + 1}`, 28))}</text>` +
      `<rect x='${x}' y='${y}' width='${w}' height='${barH}' rx='5' fill='${color}'/>` +
      `<text x='${x + 8}' y='${y + barH / 2 + 4}' ${FONT} font-size='10' fill='#fff'>${esc(truncate(p.barLabel || `${p.duration || 1} ${u.toLowerCase()}(s)`, Math.max(3, Math.floor(w / 6))))}</text>`;
  });

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' fill='#ffffff'/>${grid}${rows}</svg>`;
  return { svg, width, height };
}

// ── Architecture board → tiered box diagram ────────────────────────────────
function renderArchitectureSvg(board: any) {
  const nodes: any[] = board?.nodes || [];
  if (!nodes.length) return null;
  const byId = new Map<string, any>(nodes.map((n) => [n.id, n]));

  const labelOf = (n: any) => String(n.data?.label || n.label || '');
  const sizeOf = (n: any) =>
    n.type === 'group'
      ? { w: parseInt(n.data?.width) || 320, h: parseInt(n.data?.height) || 160 }
      : { w: Math.min(300, Math.max(190, 78 + labelOf(n).length * 7.2)), h: 56 };
  const absOf = (n: any) => {
    let x = n.position?.x || 0, y = n.position?.y || 0, pid = n.layerId;
    while (pid && byId.has(pid)) {
      const p = byId.get(pid);
      x += p.position?.x || 0;
      y += p.position?.y || 0;
      pid = p.layerId;
    }
    return { x, y };
  };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    const a = absOf(n), s = sizeOf(n);
    minX = Math.min(minX, a.x); minY = Math.min(minY, a.y);
    maxX = Math.max(maxX, a.x + s.w); maxY = Math.max(maxY, a.y + s.h);
  });
  if (!isFinite(minX)) return null;

  const pad = 36;
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const tx = (x: number) => x - minX + pad;
  const ty = (y: number) => y - minY + pad;
  const center = (n: any) => {
    const a = absOf(n), s = sizeOf(n);
    return { x: tx(a.x) + s.w / 2, y: ty(a.y) + s.h / 2 };
  };

  let groupSvg = '';
  nodes.filter((n) => n.type === 'group').forEach((n) => {
    const a = absOf(n), s = sizeOf(n);
    const col = n.data?.borderColor || '#64748B';
    groupSvg +=
      `<rect x='${tx(a.x)}' y='${ty(a.y)}' width='${s.w}' height='${s.h}' rx='14' fill='${col}14' stroke='${col}55' stroke-width='1.5'/>` +
      (labelOf(n)
        ? `<text x='${tx(a.x) + 12}' y='${ty(a.y) + 18}' ${FONT} font-size='11' font-weight='700' fill='${col}'>${esc(truncate(labelOf(n), 40)).toUpperCase()}</text>`
        : '');
  });

  let edgeSvg = '';
  (board.edges || []).forEach((e: any) => {
    const s = byId.get(e.source), t = byId.get(e.target);
    if (s && t) {
      const c1 = center(s), c2 = center(t);
      edgeSvg += `<line x1='${c1.x}' y1='${c1.y}' x2='${c2.x}' y2='${c2.y}' stroke='#94A3B8' stroke-width='1.4' opacity='0.7'/>`;
    }
  });

  let svcSvg = '';
  nodes.filter((n) => n.type !== 'group').forEach((n) => {
    const a = absOf(n), s = sizeOf(n);
    const col = n.data?.iconColor || '#93C5FD';
    svcSvg +=
      `<rect x='${tx(a.x)}' y='${ty(a.y)}' width='${s.w}' height='${s.h}' rx='10' fill='#0F1626' stroke='${col}55' stroke-width='1.5'/>` +
      `<rect x='${tx(a.x)}' y='${ty(a.y)}' width='4' height='${s.h}' rx='2' fill='${col}'/>` +
      `<text x='${tx(a.x) + 16}' y='${ty(a.y) + s.h / 2 + 4}' ${FONT} font-size='12' font-weight='600' fill='#E2E8F0'>${esc(truncate(labelOf(n), 30))}</text>`;
  });

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='${width}' height='${height}' fill='#ffffff'/>${groupSvg}${edgeSvg}${svcSvg}</svg>`;
  return { svg, width, height };
}

/** Returns a PNG data URL for the given diagram type, or null if no data. */
export async function renderProjectDiagram(type: string, project: Project): Promise<string | null> {
  try {
    if (type === 'gantt') {
      const phases = project.ganttPhases || [];
      if (!phases.length) return null;
      const { svg, width, height } = renderGanttSvg(phases, project.timelineUnit === 'weeks' ? 'weeks' : 'months');
      return await svgToPng(svg, width, height);
    }
    if (type === 'architecture') {
      const ad: any = project.architectureDiagram;
      const board = ad?.boards?.infrastructure || ad?.boards?.cloud || ad; // new boards or legacy
      const res = renderArchitectureSvg(board);
      if (!res) return null;
      // Cap very large diagrams so the PNG stays reasonable.
      const scale = res.width > 1600 ? 1 : 2;
      return await svgToPng(res.svg, res.width, res.height, scale);
    }
    return null; // raci → table in content; bpmn → later phase
  } catch (e) {
    console.error('renderProjectDiagram failed:', type, e);
    return null;
  }
}
