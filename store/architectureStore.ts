import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ArchitectureMode, Node, Edge, Layer, ArchitectureDiagram } from '@/types/architecture';

// Flowchart and Cloud Architecture are INDEPENDENT boards. The store keeps one
// diagram per board and `diagram` always mirrors the board for the active mode,
// so editing/generating in one never affects the other. (AI Generate feeds the
// Flowchart board.)
type BoardKey = 'infrastructure' | 'cloud';
type Boards = { infrastructure: ArchitectureDiagram | null; cloud: ArchitectureDiagram | null };

const boardKey = (mode: ArchitectureMode): BoardKey => (mode === 'cloud' ? 'cloud' : 'infrastructure');

const blankDiagram = (name: string, mode: BoardKey): ArchitectureDiagram => ({
  id: uuidv4(),
  name,
  mode,
  nodes: [],
  edges: [],
  layers: [],
  mermaidCode: '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

interface ArchitectureStore {
  // State
  boards: Boards;
  diagram: ArchitectureDiagram | null; // mirror of the active board
  architectureMode: ArchitectureMode;

  // Actions
  setMode: (mode: ArchitectureMode) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setLayers: (layers: Layer[]) => void;
  addNode: (node: Omit<Node, 'id'>) => void;
  createDiagram: (name: string, mode: ArchitectureMode) => void;
  loadDiagram: (diagram: ArchitectureDiagram) => void;
  loadBoards: (boards: Partial<Boards>, mode: ArchitectureMode) => void;
  resetDiagram: () => void;
}

// Apply a change to the active board and keep `diagram` in sync.
function patchActive(
  state: ArchitectureStore,
  fn: (cur: ArchitectureDiagram) => Partial<ArchitectureDiagram>
): Partial<ArchitectureStore> {
  const key = boardKey(state.architectureMode);
  const cur = state.boards[key];
  if (!cur) return {};
  const updated = { ...cur, ...fn(cur), updatedAt: new Date() };
  return { boards: { ...state.boards, [key]: updated }, diagram: updated };
}

export const useArchitectureStore = create<ArchitectureStore>((set) => ({
  boards: { infrastructure: null, cloud: null },
  diagram: null,
  architectureMode: 'ai',

  setMode: (mode) =>
    set((state) => {
      const key = boardKey(mode);
      let boards = state.boards;
      let d = boards[key];
      if (!d) {
        d = blankDiagram('Architecture', key);
        boards = { ...boards, [key]: d };
      }
      return { architectureMode: mode, boards, diagram: d };
    }),

  setNodes: (nodes) => set((state) => patchActive(state, () => ({ nodes }))),
  setEdges: (edges) => set((state) => patchActive(state, () => ({ edges }))),
  setLayers: (layers) => set((state) => patchActive(state, () => ({ layers }))),

  addNode: (node) =>
    set((state) => patchActive(state, (cur) => ({ nodes: [...cur.nodes, { ...node, id: uuidv4() }] }))),

  createDiagram: (name, mode) =>
    set((state) => {
      const key = boardKey(mode);
      const d = blankDiagram(name, key);
      return { architectureMode: mode, boards: { ...state.boards, [key]: d }, diagram: d };
    }),

  // Back-compat: load a single diagram into the board matching its mode.
  loadDiagram: (diagram) =>
    set((state) => {
      const key = boardKey(diagram.mode);
      const dd = { ...diagram, mode: key, updatedAt: new Date() };
      return {
        architectureMode: diagram.mode,
        boards: { ...state.boards, [key]: dd },
        diagram: dd,
      };
    }),

  loadBoards: (boards, mode) =>
    set(() => {
      const safe: Boards = {
        infrastructure: boards?.infrastructure || null,
        cloud: boards?.cloud || null,
      };
      return { boards: safe, architectureMode: mode, diagram: safe[boardKey(mode)] };
    }),

  resetDiagram: () =>
    set({ boards: { infrastructure: null, cloud: null }, diagram: null, architectureMode: 'ai' }),
}));
