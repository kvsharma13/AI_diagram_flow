// Unified Architecture Types

export type ArchitectureMode = 'infrastructure' | 'ai';

export interface Node {
  id: string;
  label: string;
  type: string;
  icon?: string;
  layerId?: string;
  position: { x: number; y: number };
  data?: any;
}

export interface Layer {
  id: string;
  name: string;
  color?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
  style?: any;
  /** Orthogonal route computed by the layout engine (absolute flow coords). */
  points?: Array<{ x: number; y: number }>;
}

export interface ArchitectureDiagram {
  id: string;
  name: string;
  mode: ArchitectureMode;
  nodes: Node[];
  edges: Edge[];
  layers: Layer[];
  mermaidCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
