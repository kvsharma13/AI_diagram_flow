import {
  type LucideIcon, LayoutDashboard, BookOpen, ListChecks, ScrollText,
  SquareUser, Database, GitCompare, Table, ClipboardCheck, Scale, Briefcase,
} from 'lucide-react';
import { EditorType } from '@/types/project';

export type BAGroup = 'Overview' | 'Requirements' | 'Modeling' | 'Analysis';

export interface BAModuleDef {
  id: EditorType;
  label: string;
  icon: LucideIcon;
  group: BAGroup;
}

// Order follows the spec's sidebar order, with the Project Dashboard as the
// overview entry up top.
export const BA_MODULES: BAModuleDef[] = [
  { id: 'baDashboard',  label: 'Project Dashboard',   icon: LayoutDashboard, group: 'Overview' },
  { id: 'brd',          label: 'BRD',                 icon: BookOpen,        group: 'Requirements' },
  { id: 'requirements', label: 'Requirements',        icon: ListChecks,      group: 'Requirements' },
  { id: 'userStories',  label: 'User Stories',        icon: ScrollText,      group: 'Requirements' },
  { id: 'useCase',      label: 'Use-Case Diagram',    icon: SquareUser,      group: 'Modeling' },
  { id: 'erd',          label: 'ERD / Data Model',    icon: Database,        group: 'Modeling' },
  { id: 'asIsToBe',     label: 'As-Is / To-Be',       icon: GitCompare,      group: 'Modeling' },
  { id: 'traceability', label: 'Traceability Matrix', icon: Table,           group: 'Analysis' },
  { id: 'testCases',    label: 'Test Cases',          icon: ClipboardCheck,  group: 'Analysis' },
  { id: 'gapAnalysis',  label: 'Gap Analysis',        icon: Scale,           group: 'Analysis' },
  { id: 'businessCase', label: 'Business Case',       icon: Briefcase,       group: 'Analysis' },
];

const BA_MODULE_IDS = new Set<string>(BA_MODULES.map((m) => m.id));
export function isBAModule(id: string): boolean {
  return BA_MODULE_IDS.has(id);
}
