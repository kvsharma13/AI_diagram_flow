import type { Project } from '@/types/project';
import {
  EMPTY_BRD, EMPTY_GAP_ANALYSIS, EMPTY_BUSINESS_CASE, EMPTY_TRACEABILITY,
} from '@/lib/ba/defaults';

/* A single neutral model every module is reduced to, so the docx/pdf/xlsx
   builders stay generic. Kept dependency-free (no heavy export libs here). */

export type ExportFormat = 'docx' | 'pdf' | 'xlsx' | 'png';

export interface ExportTable {
  title?: string;
  columns: string[];
  rows: string[][];
}
export interface ExportSection {
  heading?: string;
  body?: string;
  table?: ExportTable;
}
export interface ModuleExport {
  moduleId: string;
  moduleName: string;
  title: string;
  sections: ExportSection[];
  diagramElementId?: string;
  formats: ExportFormat[];
}

const s = (v: unknown) => (v == null ? '' : String(v));

export function buildModuleExport(project: Project, moduleId: string): ModuleExport {
  switch (moduleId) {
    case 'brd': {
      const b = project.brd || EMPTY_BRD();
      return {
        moduleId, moduleName: 'BRD', title: 'Business Requirements Document', formats: ['docx', 'pdf'],
        sections: [
          { heading: 'Project Overview', body: b.projectOverview },
          { heading: 'Objectives', body: b.objectives },
          { heading: 'Scope — In', body: b.scopeIn },
          { heading: 'Scope — Out', body: b.scopeOut },
          { heading: 'Assumptions', body: b.assumptions },
          { heading: 'Constraints', body: b.constraints },
          { heading: 'Stakeholders', body: b.stakeholders },
        ],
      };
    }
    case 'requirements': {
      const reqs = project.requirements || [];
      return {
        moduleId, moduleName: 'Requirements', title: 'Requirements', formats: ['xlsx', 'docx', 'pdf'],
        sections: [{
          table: {
            columns: ['ID', 'Description', 'Type', 'Priority', 'Status', 'Source'],
            rows: reqs.map((r) => [r.reqId, r.description, r.type, r.priority, r.status, r.source].map(s)),
          },
        }],
      };
    }
    case 'userStories': {
      const board = project.userStories || { epics: [] };
      return {
        moduleId, moduleName: 'User Stories', title: 'User Stories', formats: ['docx', 'pdf'],
        sections: board.epics.map((e) => ({
          heading: e.name,
          table: {
            columns: ['ID', 'As a', 'I want', 'So that', 'Priority', 'Status', 'Acceptance Criteria'],
            rows: e.stories.map((st) => [
              st.storyId, st.role, st.goal, st.benefit, st.priority, st.status,
              st.acceptanceCriteria.map((c) => `${c.done ? '[x]' : '[ ]'} ${c.text}`).join('  •  '),
            ].map(s)),
          },
        })),
      };
    }
    case 'useCase':
      return { moduleId, moduleName: 'Use-Case Diagram', title: 'Use-Case Diagram', formats: ['png', 'pdf'], sections: [], diagramElementId: 'usecase-export-area' };
    case 'erd':
      return { moduleId, moduleName: 'ERD', title: 'ERD / Data Model', formats: ['png', 'pdf'], sections: [], diagramElementId: 'erd-export-area' };
    case 'asIsToBe': {
      const a = project.asIsToBe;
      const comparison = a?.comparison || [];
      return {
        moduleId, moduleName: 'As-Is To-Be', title: 'As-Is / To-Be Analysis', formats: ['pdf', 'png'],
        diagramElementId: 'asistobe-export-area',
        sections: comparison.length
          ? [{ heading: 'Differences', table: { columns: ['Area', 'As-Is State', 'To-Be State', 'Change Type'], rows: comparison.map((c) => [c.area, c.asIsState, c.toBeState, c.changeType].map(s)) } }]
          : [],
      };
    }
    case 'traceability': {
      const reqs = project.requirements || [];
      const tm = project.traceabilityMatrix && project.traceabilityMatrix.columns?.length ? project.traceabilityMatrix : EMPTY_TRACEABILITY();
      const cols = tm.columns;
      const coverage = (reqId: string) => {
        const row = tm.cells[reqId] || {};
        if (!cols.length) return 'None';
        const filled = cols.filter((c) => (row[c.id] || '').trim()).length;
        return filled === cols.length ? 'Full' : filled > 0 ? 'Partial' : 'None';
      };
      return {
        moduleId, moduleName: 'Traceability Matrix', title: 'Requirements Traceability Matrix', formats: ['xlsx', 'pdf'],
        sections: [{
          table: {
            columns: ['Requirement', ...cols.map((c) => c.name), 'Coverage'],
            rows: reqs.map((r) => [`${r.reqId}: ${r.description}`, ...cols.map((c) => (tm.cells[r.reqId] || {})[c.id] || ''), coverage(r.reqId)].map(s)),
          },
        }],
      };
    }
    case 'testCases': {
      const tcs = project.testCases || [];
      return {
        moduleId, moduleName: 'Test Cases', title: 'Test Cases', formats: ['xlsx', 'docx', 'pdf'],
        sections: [{
          table: {
            columns: ['ID', 'Req', 'Description', 'Pre-conditions', 'Steps', 'Expected', 'Actual', 'Status', 'Assigned'],
            rows: tcs.map((t) => [
              t.testId, t.requirementId, t.description, t.preconditions,
              t.steps.map((st, i) => `${i + 1}. ${st}`).join('  •  '),
              t.expectedResult, t.actualResult, t.status, t.assignedTo,
            ].map(s)),
          },
        }],
      };
    }
    case 'gapAnalysis': {
      const g = project.gapAnalysis || EMPTY_GAP_ANALYSIS();
      return {
        moduleId, moduleName: 'Gap Analysis', title: 'Gap Analysis', formats: ['docx', 'pdf'],
        sections: [
          { heading: 'Current State Summary', body: g.currentState },
          { heading: 'Future State Summary', body: g.futureState },
          { heading: 'Gap Table', table: { columns: ['Gap ID', 'Description', 'Area Affected', 'Impact', 'Recommendation'], rows: g.gaps.map((x) => [x.gapId, x.description, x.areaAffected, x.impact, x.recommendation].map(s)) } },
          { heading: 'Impact Assessment', body: g.impactAssessment },
          { heading: 'Recommendations', body: g.recommendations },
        ],
      };
    }
    case 'businessCase': {
      const bc = project.businessCase || EMPTY_BUSINESS_CASE();
      return {
        moduleId, moduleName: 'Business Case', title: 'Business Case', formats: ['docx', 'pdf'],
        sections: [
          { heading: 'Executive Summary', body: bc.executiveSummary },
          { heading: 'Problem Statement', body: bc.problemStatement },
          { heading: 'Proposed Solution', body: bc.proposedSolution },
          { heading: 'Stakeholders', body: bc.stakeholders },
          { heading: 'Cost-Benefit Analysis', table: { columns: ['Item', 'Type', 'Year 1', 'Year 2', 'Year 3', 'Notes'], rows: bc.costBenefit.map((r) => [r.item, r.type, r.year1, r.year2, r.year3, r.notes].map(s)) } },
          { heading: 'Risks', table: { columns: ['Risk ID', 'Description', 'Likelihood', 'Impact', 'Mitigation'], rows: bc.risks.map((r) => [r.riskId, r.description, r.likelihood, r.impact, r.mitigation].map(s)) } },
          { heading: 'Recommendation', body: bc.recommendation },
        ],
      };
    }
    default:
      return { moduleId, moduleName: moduleId, title: moduleId, formats: ['pdf'], sections: [] };
  }
}

// Modules included in "Export All" (diagram-only modules are attempted but
// skipped at runtime if their canvas isn't mounted to capture).
export const EXPORTABLE_MODULE_IDS = [
  'brd', 'requirements', 'userStories', 'useCase', 'erd', 'asIsToBe',
  'traceability', 'testCases', 'gapAnalysis', 'businessCase',
];
