// Colour-mode layer for architecture nodes and group containers.
//
// This sits ON TOP of the light/dark surface theme in archTheme.ts: the canvas,
// edges, labels and shadows come from ARCH_THEME, while THIS module decides how a
// node/group uses its accent colour — pastel tint, bold fill, or outline. Default
// is pastel (the eraser.io look). Everything is light/dark aware so the modes
// read correctly on either canvas.

export type ColorMode = 'pastel' | 'bold' | 'outline';

// Base card colours, kept in sync with ARCH_THEME (archTheme.ts).
const LIGHT = { card: '#FFFFFF', ink: '#1F2937', sub: '#98A2B3' };
const DARK = { card: '#171B22', ink: '#E5E9F0', sub: '#8A93A3' };

/** Append an alpha (0–1) to a #RRGGBB hex → #RRGGBBAA. */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return hex;
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${m[1]}${a}`;
}

/** Lighten (amount > 0) or darken (amount < 0) a hex colour by a 0–1 fraction. */
export function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return hex;
  const int = parseInt(m[1], 16);
  let r = (int >> 16) & 255;
  let g = (int >> 8) & 255;
  let b = int & 255;
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  r = Math.round((target - r) * p) + r;
  g = Math.round((target - g) * p) + g;
  b = Math.round((target - b) * p) + b;
  const hx = (v: number) => v.toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

/** True when a colour is light enough that it needs dark text on top of it. */
export function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return false;
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/**
 * Clamp any colour to a legible mid-tone (used for group accents that may arrive
 * as a very dark or very neon hex) so pastel group fills stay soft and readable.
 */
export function normalizeAccent(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#7B8595';
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  const S = Math.min(Math.max(s, 0.4), 0.62);
  const L = 0.6;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const hx = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${hx(hue2rgb(p, q, h + 1 / 3))}${hx(hue2rgb(p, q, h))}${hx(hue2rgb(p, q, h - 1 / 3))}`;
}

export interface NodeStyle {
  background: string;
  border: string;
  text: string;
  subtext: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string; // tint for monochrome glyphs (brand logos ignore it)
}

/** Solid-fill card — used for bold mode and for any emphasised node. */
function boldCard(c: string): NodeStyle {
  const darkFill = !isLight(c);
  return {
    background: c,
    border: shade(c, -0.14),
    text: darkFill ? '#FFFFFF' : '#1F2937',
    subtext: darkFill ? 'rgba(255,255,255,0.80)' : 'rgba(31,41,55,0.66)',
    iconBg: 'rgba(255,255,255,0.20)',
    iconBorder: 'rgba(255,255,255,0.30)',
    iconColor: darkFill ? '#FFFFFF' : '#1F2937',
  };
}

/**
 * Resolve a node card's fill/border/text from its accent, the active colour mode,
 * the light/dark canvas, and an optional per-node `emphasis` colour. Emphasised
 * nodes always render solid so a highlight (red "Bug" / green "Feature") stands
 * out even inside an otherwise-pastel diagram.
 */
export function nodeStyle(accent: string, mode: ColorMode, isDark: boolean, emphasis?: string): NodeStyle {
  if (emphasis) return boldCard(emphasis);
  if (mode === 'bold') return boldCard(accent);

  const base = isDark ? DARK : LIGHT;

  if (mode === 'outline') {
    return {
      background: base.card,
      border: accent,
      text: base.ink,
      subtext: base.sub,
      iconBg: withAlpha(accent, isDark ? 0.14 : 0.1),
      iconBorder: withAlpha(accent, 0.22),
      iconColor: accent,
    };
  }

  // pastel (default) — soft accent tint on the canvas
  return {
    background: withAlpha(accent, isDark ? 0.16 : 0.11),
    border: withAlpha(accent, isDark ? 0.42 : 0.36),
    text: base.ink,
    subtext: isDark ? shade(accent, 0.28) : shade(accent, -0.28),
    iconBg: isDark ? withAlpha(accent, 0.2) : '#FFFFFF',
    iconBorder: withAlpha(accent, 0.28),
    iconColor: accent,
  };
}

export interface GroupStyle {
  background: string;
  border: string;
  chipBg: string;
  chipText: string;
}

/** Colored pastel domain container + a labelled chip (the eraser group look). */
export function groupStyle(accent: string, _mode: ColorMode, isDark: boolean): GroupStyle {
  return {
    background: withAlpha(accent, isDark ? 0.1 : 0.07),
    border: withAlpha(accent, 0.3),
    chipBg: accent,
    chipText: isLight(accent) ? '#1F2937' : '#FFFFFF',
  };
}
