// Unified Architecture Types

export type ArchitectureMode = 'application' | 'infrastructure' | 'ai';

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
  style?: any;
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
