// Empty/default factories for BA modules.
// Shared by store.createProject and the project load mapping so a brand-new
// project and a project loaded before the DB migration both get safe defaults.

import type {
  BRDDocument, Requirement, UserStoriesBoard, UseCaseDiagram, ERDiagram,
  AsIsToBe, TraceabilityMatrix, TestCase, GapAnalysis, BusinessCase,
} from '@/types/project';

export const EMPTY_BRD = (): BRDDocument => ({
  projectOverview: '',
  objectives: '',
  scopeIn: '',
  scopeOut: '',
  assumptions: '',
  constraints: '',
  stakeholders: '',
});

export const EMPTY_REQUIREMENTS = (): Requirement[] => [];

export const EMPTY_USER_STORIES = (): UserStoriesBoard => ({ epics: [] });

export const EMPTY_USECASE = (): UseCaseDiagram => ({ nodes: [], edges: [] });

export const EMPTY_ERD = (): ERDiagram => ({ nodes: [], edges: [] });

export const EMPTY_AS_IS_TO_BE = (): AsIsToBe => ({
  asIs: { nodes: [], edges: [], swimlanes: [] },
  toBe: { nodes: [], edges: [], swimlanes: [] },
  comparison: [],
});

export const DEFAULT_TRACEABILITY_COLUMNS = [
  { id: 'col-process', name: 'BPMN Process Step' },
  { id: 'col-test', name: 'Test Case ID' },
  { id: 'col-status', name: 'Status' },
];

export const EMPTY_TRACEABILITY = (): TraceabilityMatrix => ({
  columns: DEFAULT_TRACEABILITY_COLUMNS.map((c) => ({ ...c })),
  cells: {},
});

export const EMPTY_TEST_CASES = (): TestCase[] => [];

export const EMPTY_GAP_ANALYSIS = (): GapAnalysis => ({
  currentState: '',
  futureState: '',
  gaps: [],
  impactAssessment: '',
  recommendations: '',
});

export const EMPTY_BUSINESS_CASE = (): BusinessCase => ({
  executiveSummary: '',
  problemStatement: '',
  proposedSolution: '',
  stakeholders: '',
  costBenefit: [],
  risks: [],
  recommendation: '',
});

/** Next sequential display id like REQ-001 given existing ids with the same prefix. */
export function nextSeqId(prefix: string, existing: string[]): string {
  let max = 0;
  for (const id of existing) {
    const m = id?.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
