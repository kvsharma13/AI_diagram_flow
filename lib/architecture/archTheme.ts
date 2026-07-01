'use client';
import { createContext } from 'react';

// Clean, calm palette for the architecture diagram — flat cards, neutral frames,
// muted edges — that reads professionally in BOTH light and dark. The canvas
// light/dark toggle swaps the whole theme (nodes + groups + edges + labels),
// not just the background.
export type ArchThemeName = 'light' | 'dark';

export const ARCH_THEME = {
  light: {
    canvas: '#F7F8FA',
    dot: 'rgba(15,23,42,0.10)',
    nodeBg: '#FFFFFF',
    nodeBorder: '#E4E7EC',
    nodeBorderSel: '#6366F1',
    nodeText: '#1F2937',
    nodeSub: '#98A2B3',
    iconBg: '#F2F4F7',
    groupBg: 'rgba(100,116,139,0.045)',
    groupBorder: 'rgba(100,116,139,0.30)',
    groupLabel: '#667085',
    edge: '#98A2B3',
    edgeSel: '#6366F1',
    shadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.05)',
    shadowSel: '0 0 0 2px rgba(99,102,241,0.22), 0 4px 10px rgba(16,24,40,0.10)',
    labelBg: 'rgba(255,255,255,0.97)',
    labelText: '#475467',
    labelBorder: 'rgba(148,163,184,0.45)',
  },
  dark: {
    canvas: '#0E1116',
    dot: 'rgba(148,163,184,0.14)',
    nodeBg: '#171B22',
    nodeBorder: 'rgba(148,163,184,0.15)',
    nodeBorderSel: '#818CF8',
    nodeText: '#E5E9F0',
    nodeSub: '#8A93A3',
    iconBg: 'rgba(148,163,184,0.09)',
    groupBg: 'rgba(148,163,184,0.035)',
    groupBorder: 'rgba(148,163,184,0.16)',
    groupLabel: '#98A2B3',
    edge: '#4A5568',
    edgeSel: '#818CF8',
    shadow: '0 1px 2px rgba(0,0,0,0.35)',
    shadowSel: '0 0 0 2px rgba(129,140,248,0.40), 0 4px 10px rgba(0,0,0,0.45)',
    labelBg: 'rgba(23,27,34,0.97)',
    labelText: '#CBD5E1',
    labelBorder: 'rgba(148,163,184,0.22)',
  },
} as const;

export const ArchTheme = createContext<ArchThemeName>('dark');
