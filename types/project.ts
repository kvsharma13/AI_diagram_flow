// Core project structure
export type TimelineUnit = 'weeks' | 'months';

export interface TemplateStyle {
  background: string;
  headerBg: string;
  headerText: string;
  rowBg: string;
  rowBorder: string;
  barStyle: 'rounded' | 'flat' | 'gradient' | 'glow' | 'outline';
  barBorder: string;
  monthHeaderBg: string;
  monthHeaderText: string;
  gridLines: string;
  shadow: string;
}

export interface Project {
  id: string;
  name: string;
  ganttPhases: GanttPhase[];
  ganttTemplateStyle?: TemplateStyle; // Visual style for Gantt chart
  raciTasks: RACITask[];
  raciStakeholders?: RACIStakeholder[];
  raciAssignments?: RACIAssignment[];
  architectureComponents: ArchitectureComponent[];
  architectureMermaidCode?: string; // Mermaid code for architecture diagram
  architectureDiagram?: any | null; // React Flow architecture diagram (nodes/edges/mode) from architectureStore
  flowchartSteps: FlowchartStep[];
  bpmnDiagram?: BPMNDiagram;
  proposalDocument?: ProposalDocument;
  // ── BA Modules (additive — do not affect existing generators) ──
  brd?: BRDDocument;
  requirements?: Requirement[];
  userStories?: UserStoriesBoard;
  useCaseDiagram?: UseCaseDiagram;
  erd?: ERDiagram;
  asIsToBe?: AsIsToBe;
  traceabilityMatrix?: TraceabilityMatrix;
  testCases?: TestCase[];
  gapAnalysis?: GapAnalysis;
  businessCase?: BusinessCase;
  // ── Client sources — structured brief distilled from uploaded RFP/documents ──
  clientBrief?: ClientBrief;
  timelineMonths?: number; // Total duration for Gantt timeline (default: 12)
  timelineUnit?: TimelineUnit; // Unit for timeline (default: 'months')
  createdAt: Date;
  updatedAt: Date;
}

// Gantt Editor
export type PhaseColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal' | 'red' | 'indigo' | 'yellow' | 'cyan';

export interface MonthlyBreakdown {
  month: number;
  title: string;
  highlights?: string[];
  deliverables?: string[];
  milestones?: string[];
}

export interface GanttPhase {
  id: string;
  name: string;
  barLabel?: string; // Text shown inside the colored bar (independent from name)
  startMonth: number;
  duration: number;
  deliverables: string;
  color?: PhaseColor;
  months?: MonthlyBreakdown[]; // Detailed monthly breakdown
}

// RACI Matrix
// Supports single values ('R', 'A', 'C', 'I') or combined values ('R/A', 'C/I', etc.)
export type RACIValue = string | null;

export interface RACIStakeholder {
  id: string;
  name: string;
  role?: string;
}

export interface RACITask {
  id: string;
  taskName: string;
  description?: string;
}

export interface RACIAssignment {
  taskId: string;
  stakeholderId: string;
  value: RACIValue;
}

// Architecture Diagram
export type ComponentType = 'frontend' | 'backend' | 'database' | 'service';

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: ComponentType;
  position: { x: number; y: number };
}

// Flowchart
export type FlowchartStepType = 'start' | 'process' | 'decision' | 'end';

export interface FlowchartStep {
  id: string;
  label: string;
  type: FlowchartStepType;
  position: { x: number; y: number };
}

// BPMN Process Flow
export type BPMNNodeType =
  | 'startEvent'
  | 'endEvent'
  | 'task'
  | 'userTask'
  | 'serviceTask'
  | 'scriptTask'
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'inclusiveGateway'
  | 'subProcess'
  | 'intermediateEvent'
  | 'dataObject'
  | 'dataStore'
  | 'textAnnotation';

export type BPMNEdgeType = 'sequenceFlow' | 'messageFlow' | 'association';

export interface BPMNNode {
  id: string;
  type: BPMNNodeType;
  label: string;
  description?: string;
  assignee?: string;
  swimlaneId?: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
}

export interface BPMNSwimlane {
  id: string;
  label: string;
  role: string;
  color?: string;
  order: number;
}

export interface BPMNEdge {
  id: string;
  type: BPMNEdgeType;
  source: string;
  target: string;
  label?: string;
  conditionExpression?: string;
  animated?: boolean;
}

export interface BPMNDiagram {
  nodes: BPMNNode[];
  edges: BPMNEdge[];
  swimlanes: BPMNSwimlane[];
}

// Proposal Builder
export type ProposalSectionType =
  | 'cover'
  | 'executive_summary'
  | 'scope'
  | 'timeline'
  | 'stakeholders'
  | 'architecture'
  | 'bpmn_process'
  | 'risks'
  | 'budget'
  | 'assumptions'
  | 'deliverables'
  | 'terms'
  | 'appendix'
  | 'custom';

export interface ProposalSection {
  id: string;
  type: ProposalSectionType;
  title: string;
  content: string;
  order: number;
  diagramSnapshot?: string;
  isVisible: boolean;
  metadata?: Record<string, any>;
}

export interface ProposalBranding {
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: string;
}

export type ProposalTemplateId =
  | 'sow'
  | 'brd'
  | 'project_charter'
  | 'technical_proposal'
  | 'rfp_response'
  | 'blank';

export interface ProposalDocument {
  sections: ProposalSection[];
  branding: ProposalBranding;
  templateId: ProposalTemplateId;
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  version?: string;
}

/* ════════════════════════════════════════════════════════════
   BA MODULES — additive data model (Modules 1–6)
   Diagram modules (Use-Case, ERD, As-Is/To-Be) reuse the existing
   React Flow node/edge shape so they ride on the same infra.
   ════════════════════════════════════════════════════════════ */

// Module 1A — BRD (fixed-section document; each field is Markdown text)
export interface BRDDocument {
  projectOverview: string;
  objectives: string;
  scopeIn: string;
  scopeOut: string;
  assumptions: string;
  constraints: string;
  stakeholders: string;
}

// Module 1B — Requirements
export type RequirementType = 'Functional' | 'Non-Functional';
export type MoSCoW = 'Must Have' | 'Should Have' | 'Could Have' | "Won't Have";
export type RequirementStatus = 'Draft' | 'Approved' | 'Rejected';
// Volere/IEEE-29148-aligned attributes
export type NFRCategory =
  | 'Performance' | 'Security' | 'Usability' | 'Scalability'
  | 'Reliability' | 'Maintainability' | 'Compliance' | 'Other';
export type VerificationMethod = 'Test' | 'Demonstration' | 'Inspection' | 'Analysis';

export interface Requirement {
  id: string;          // internal uuid
  reqId: string;       // display id, e.g. REQ-001
  description: string;
  type: RequirementType;
  priority: MoSCoW;
  status: RequirementStatus;
  source: string;
  // ── deepened attributes (Volere/Jama-aligned) — all optional for back-compat ──
  rationale?: string;                       // why this requirement exists
  category?: string;                        // functional area, e.g. Authentication
  nfrCategory?: NFRCategory;                 // only meaningful when type === 'Non-Functional'
  verification?: VerificationMethod;        // how it will be verified
  fitCriterion?: string;                    // measurable target (esp. for NFRs)
  estimate?: string;                        // T-shirt / points
  acceptanceCriteria?: AcceptanceCriterion[];
  parentId?: string;                        // decomposition: references another Requirement.id
}

// Module 1C — User Stories
export type StoryStatus = 'Draft' | 'Ready' | 'Done';

export interface AcceptanceCriterion {
  id: string;
  text: string;
  done: boolean;
}

export interface UserStory {
  id: string;
  storyId: string;     // e.g. US-001
  role: string;        // As a [role]
  goal: string;        // I want [goal]
  benefit: string;     // So that [benefit]
  acceptanceCriteria: AcceptanceCriterion[];
  priority: MoSCoW;
  status: StoryStatus;
}

export interface Epic {
  id: string;
  name: string;
  stories: UserStory[];
}

export interface UserStoriesBoard {
  epics: Epic[];
}

// Shared React-Flow diagram shape (reused by Use-Case & ERD)
export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
  parentNode?: string;
  width?: number;
  height?: number;
}

export interface DiagramEdge {
  id: string;
  type: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, any>;
}

// Module 2A — Use-Case Diagram
export type UseCaseNodeType = 'actor' | 'useCase' | 'boundary';
export type UseCaseEdgeType = 'association' | 'include' | 'extend' | 'generalization';

export interface UseCaseDiagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// Module 2B — ERD / Data Model
export type ERDKey = 'PK' | 'FK' | 'regular' | 'derived';
export type ERDCardinality = '1:1' | '1:N' | 'M:N';

export interface ERDAttribute {
  id: string;
  name: string;
  dataType: string;
  key: ERDKey;
}
// Entity node stores attributes on node.data.attributes and node.data.weak
export interface ERDiagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[]; // edge.data.cardinality: ERDCardinality
}

// Module 2C — As-Is / To-Be
export type ChangeType = 'Added' | 'Removed' | 'Modified' | 'Unchanged';

export interface ComparisonRow {
  id: string;
  area: string;
  asIsState: string;
  toBeState: string;
  changeType: ChangeType;
}

export interface AsIsToBe {
  asIs: BPMNDiagram;
  toBe: BPMNDiagram;
  comparison: ComparisonRow[];
}

// Module 3 — Requirements Traceability Matrix
export interface TraceabilityColumn {
  id: string;
  name: string;
}

export interface TraceabilityMatrix {
  columns: TraceabilityColumn[];                  // user-defined; 3 defaults
  cells: Record<string, Record<string, string>>; // cells[reqId][columnId] = value
}

// Module 4 — Test Cases
export type TestStatus = 'Pending' | 'Pass' | 'Fail';

export interface TestCase {
  id: string;
  testId: string;        // TC-001
  requirementId: string; // links Requirement.reqId
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  assignedTo: string;
}

// Module 5 — Gap Analysis
export type ImpactLevel = 'High' | 'Medium' | 'Low';

export interface GapRow {
  id: string;
  gapId: string;         // GAP-001
  description: string;
  areaAffected: string;
  impact: ImpactLevel;
  recommendation: string;
}

export interface GapAnalysis {
  currentState: string;
  futureState: string;
  gaps: GapRow[];
  impactAssessment: string;
  recommendations: string;
}

// Module 6 — Business Case
export type CostBenefitType = 'Cost' | 'Benefit';
export type HML = 'H' | 'M' | 'L';

export interface CostBenefitRow {
  id: string;
  item: string;
  type: CostBenefitType;
  year1: string;
  year2: string;
  year3: string;
  notes: string;
}

export interface RiskRow {
  id: string;
  riskId: string;        // RISK-001
  description: string;
  likelihood: HML;
  impact: HML;
  mitigation: string;
}

export interface BusinessCase {
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  stakeholders: string;
  costBenefit: CostBenefitRow[];
  risks: RiskRow[];
  recommendation: string;
}

// Editor types
export type EditorType =
  | 'gantt' | 'raci' | 'architecture' | 'flowchart' | 'bpmn' | 'proposal' | 'templates'
  // BA modules
  | 'baDashboard'
  | 'sources'
  | 'brd' | 'requirements' | 'userStories'
  | 'useCase' | 'erd' | 'asIsToBe'
  | 'traceability' | 'testCases' | 'gapAnalysis' | 'businessCase';

// ── Client sources (uploaded RFP / client documents) ──────────────────────
// One structured brief per project, distilled ONCE from the uploaded documents
// and then reused to ground every generator (SOW, requirements, architecture…).
export type DocumentStatus = 'uploaded' | 'extracting' | 'analyzing' | 'ready' | 'error';

export interface ProjectDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  error?: string;
  createdAt: string;
}

export interface ClientBriefRequirement {
  description: string;
  type?: 'Functional' | 'Non-Functional';
  priority?: 'Must Have' | 'Should Have' | 'Could Have' | "Won't Have";
  category?: string;
}

export interface ClientBriefStakeholder {
  name: string;
  role?: string;
}

export interface ClientBrief {
  clientName?: string;
  projectName?: string;
  background?: string;          // current situation / context
  objectives?: string[];        // goals the client wants to achieve
  scopeIn?: string[];
  scopeOut?: string[];
  requirements?: ClientBriefRequirement[];
  stakeholders?: ClientBriefStakeholder[];
  constraints?: string[];
  assumptions?: string[];
  deliverables?: string[];
  budget?: string;
  timeline?: string;
  compliance?: string[];        // regulatory / standards mentioned
  risks?: string[];
  summary?: string;             // short narrative overview
  sourceDocuments?: string[];   // file names this brief was distilled from
  updatedAt?: string;
}