import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ArchitectureMode, Node, Edge, Layer, ArchitectureDiagram } from '@/types/architecture';

interface ArchitectureStore {
  // State
  diagram: ArchitectureDiagram | null;
  architectureMode: ArchitectureMode;

  // Actions
  setMode: (mode: ArchitectureMode) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setLayers: (layers: Layer[]) => void;
  setMermaidCode: (code: string) => void;
  addNode: (node: Omit<Node, 'id'>) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<Edge, 'id'>) => void;
  deleteEdge: (id: string) => void;
  createDiagram: (name: string, mode: ArchitectureMode) => void;
  loadDiagram: (diagram: ArchitectureDiagram) => void;
  resetDiagram: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set) => ({
  diagram: null,
  architectureMode: 'application',

  setMode: (mode) =>
    set((state) => ({
      architectureMode: mode,
      diagram: state.diagram ? { ...state.diagram, mode, updatedAt: new Date() } : null,
    })),

  setNodes: (nodes) =>
    set((state) => ({
      diagram: state.diagram
        ? { ...state.diagram, nodes, updatedAt: new Date() }
        : null,
    })),

  setEdges: (edges) =>
    set((state) => ({
      diagram: state.diagram
        ? { ...state.diagram, edges, updatedAt: new Date() }
        : null,
    })),

  setLayers: (layers) =>
    set((state) => ({
      diagram: state.diagram
        ? { ...state.diagram, layers, updatedAt: new Date() }
        : null,
    })),

  setMermaidCode: (mermaidCode) =>
    set((state) => ({
      diagram: state.diagram
        ? { ...state.diagram, mermaidCode, updatedAt: new Date() }
        : null,
    })),

  addNode: (node) =>
    set((state) => {
      if (!state.diagram) return state;
      const newNode = { ...node, id: uuidv4() };
      return {
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, newNode],
          updatedAt: new Date(),
        },
      };
    }),

  updateNode: (id, updates) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deleteNode: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter((node) => node.id !== id),
          edges: state.diagram.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
          updatedAt: new Date(),
        },
      };
    }),

  addEdge: (edge) =>
    set((state) => {
      if (!state.diagram) return state;
      const newEdge = { ...edge, id: uuidv4() };
      return {
        diagram: {
          ...state.diagram,
          edges: [...state.diagram.edges, newEdge],
          updatedAt: new Date(),
        },
      };
    }),

  deleteEdge: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.filter((edge) => edge.id !== id),
          updatedAt: new Date(),
        },
      };
    }),

  createDiagram: (name, mode) =>
    set({
      diagram: {
        id: uuidv4(),
        name,
        mode,
        nodes: [],
        edges: [],
        layers: [],
        mermaidCode: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      architectureMode: mode,
    }),

  loadDiagram: (diagram) =>
    set({
      diagram: { ...diagram, updatedAt: new Date() },
      architectureMode: diagram.mode,
    }),

  resetDiagram: () =>
    set({
      diagram: null,
      architectureMode: 'application',
    }),
}));
