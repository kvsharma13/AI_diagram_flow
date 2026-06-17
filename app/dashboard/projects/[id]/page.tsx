'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Check } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import GanttEditor from '@/editors/GanttEditor';
import RACIMatrixEditor from '@/editors/RACIMatrixEditor';
import ArchitectureEditor from '@/editors/ArchitectureEditor';
import BPMNEditor from '@/editors/BPMNEditor';
import ProposalEditor from '@/editors/ProposalEditor';
import { EditorType } from '@/types/project';
import {
  EMPTY_BRD, EMPTY_REQUIREMENTS, EMPTY_USER_STORIES, EMPTY_USECASE, EMPTY_ERD,
  EMPTY_AS_IS_TO_BE, EMPTY_TRACEABILITY, EMPTY_TEST_CASES, EMPTY_GAP_ANALYSIS, EMPTY_BUSINESS_CASE,
} from '@/lib/ba/defaults';
import BAModuleNav from '@/components/ba/BAModuleNav';
import ComingSoon from '@/components/ba/ComingSoon';
import { isBAModule } from '@/lib/ba/modules';
import BRDEditor from '@/editors/BRDEditor';
import RequirementsEditor from '@/editors/RequirementsEditor';
import UserStoriesEditor from '@/editors/UserStoriesEditor';
import UseCaseEditor from '@/editors/UseCaseEditor';
import ERDEditor from '@/editors/ERDEditor';
import AsIsToBeEditor from '@/editors/AsIsToBeEditor';
import TraceabilityEditor from '@/editors/TraceabilityEditor';
import TestCaseEditor from '@/editors/TestCaseEditor';
import GapAnalysisEditor from '@/editors/GapAnalysisEditor';
import BusinessCaseEditor from '@/editors/BusinessCaseEditor';
import BADashboardEditor from '@/editors/BADashboardEditor';

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { project, setProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeEditor, setActiveEditor] = useState<EditorType>('baDashboard');
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Load project from database
  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Auto-save when project changes (debounced)
  useEffect(() => {
    if (!project || isLoading) return;

    const timeout = setTimeout(() => {
      saveProject();
    }, 3000); // Save 3 seconds after last change

    return () => clearTimeout(timeout);
  }, [project]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        router.push('/dashboard/projects');
        return;
      }

      const { project: dbProject } = await response.json();

      // Convert database format to store format
      setProject({
        id: dbProject.id,
        name: dbProject.name,
        ganttPhases: dbProject.gantt_phases || [],
        ganttTemplateStyle: dbProject.gantt_template_style,
        raciTasks: dbProject.raci_tasks || [],
        raciStakeholders: dbProject.raci_stakeholders || [],
        raciAssignments: dbProject.raci_assignments || [],
        architectureComponents: dbProject.architecture_components || [],
        architectureMermaidCode: dbProject.architecture_mermaid_code,
        flowchartSteps: dbProject.flowchart_steps || [],
        bpmnDiagram: {
          nodes: dbProject.bpmn_nodes || [],
          edges: dbProject.bpmn_edges || [],
          swimlanes: dbProject.bpmn_swimlanes || [],
        },
        proposalDocument: {
          sections: dbProject.proposal_sections || [],
          branding: dbProject.proposal_branding || { companyName: '', primaryColor: '#6366f1', secondaryColor: '#ec4899', fontFamily: 'Inter', headerStyle: 'modern' },
          templateId: dbProject.proposal_template_id || 'blank',
          title: dbProject.proposal_title || '',
          subtitle: dbProject.proposal_subtitle,
          author: dbProject.proposal_author,
          version: dbProject.proposal_version,
        },
        // BA modules. The DB defaults object columns to '{}', which is truthy
        // but lacks the expected nested fields — so MERGE onto the full empty
        // shape rather than `|| EMPTY()` (arrays stay `|| []`).
        brd: { ...EMPTY_BRD(), ...(dbProject.brd || {}) },
        requirements: dbProject.requirements || EMPTY_REQUIREMENTS(),
        userStories: { ...EMPTY_USER_STORIES(), ...(dbProject.user_stories || {}) },
        useCaseDiagram: { ...EMPTY_USECASE(), ...(dbProject.use_case_diagram || {}) },
        erd: { ...EMPTY_ERD(), ...(dbProject.erd || {}) },
        asIsToBe: { ...EMPTY_AS_IS_TO_BE(), ...(dbProject.as_is_to_be || {}) },
        traceabilityMatrix: { ...EMPTY_TRACEABILITY(), ...(dbProject.traceability_matrix || {}) },
        testCases: dbProject.test_cases || EMPTY_TEST_CASES(),
        gapAnalysis: { ...EMPTY_GAP_ANALYSIS(), ...(dbProject.gap_analysis || {}) },
        businessCase: { ...EMPTY_BUSINESS_CASE(), ...(dbProject.business_case || {}) },
        timelineMonths: dbProject.timeline_months || 12,
        timelineUnit: dbProject.timeline_unit || 'months',
        createdAt: new Date(dbProject.created_at),
        updatedAt: new Date(dbProject.updated_at),
      });

      setProjectName(dbProject.name);
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = useCallback(async () => {
    if (!project || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          ganttPhases: project.ganttPhases,
          ganttTemplateStyle: project.ganttTemplateStyle,
          raciTasks: project.raciTasks,
          raciStakeholders: project.raciStakeholders,
          raciAssignments: project.raciAssignments,
          architectureComponents: project.architectureComponents,
          architectureMermaidCode: project.architectureMermaidCode,
          bpmnNodes: project.bpmnDiagram?.nodes || [],
          bpmnEdges: project.bpmnDiagram?.edges || [],
          bpmnSwimlanes: project.bpmnDiagram?.swimlanes || [],
          proposalSections: project.proposalDocument?.sections || [],
          proposalBranding: project.proposalDocument?.branding,
          proposalTemplateId: project.proposalDocument?.templateId,
          proposalTitle: project.proposalDocument?.title,
          proposalSubtitle: project.proposalDocument?.subtitle,
          proposalAuthor: project.proposalDocument?.author,
          proposalVersion: project.proposalDocument?.version,
          // BA modules
          brd: project.brd,
          requirements: project.requirements,
          userStories: project.userStories,
          useCaseDiagram: project.useCaseDiagram,
          erd: project.erd,
          asIsToBe: project.asIsToBe,
          traceabilityMatrix: project.traceabilityMatrix,
          testCases: project.testCases,
          gapAnalysis: project.gapAnalysis,
          businessCase: project.businessCase,
          timelineMonths: project.timelineMonths,
          timelineUnit: project.timelineUnit,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  }, [project, projectId, isSaving]);

  const handleNameUpdate = async () => {
    if (!projectName.trim() || !project) return;

    const updatedProject = { ...project, name: projectName };
    setProject(updatedProject);
    setIsEditingName(false);
    await saveProject();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-2.5">
            {activeEditor === 'baDashboard' ? (
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Link>
            ) : (
              <button
                onClick={() => setActiveEditor('baDashboard')}
                className="flex items-center gap-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            )}

            {/* Save Status */}
            <div className="flex items-center gap-3">
              {isSaving ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}

              <button
                onClick={saveProject}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-40"
                style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <Save className="w-4 h-4" />
                Save Now
              </button>
            </div>
          </div>

          {/* Project Name & Navigation - Single Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Project Name */}
            <div>
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={handleNameUpdate}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameUpdate();
                    if (e.key === 'Escape') {
                      setProjectName(project?.name || '');
                      setIsEditingName(false);
                    }
                  }}
                  className="text-2xl font-bold px-3 py-1 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-2xl font-bold cursor-pointer transition-colors px-3 py-1 rounded-lg hover:bg-[rgba(37,99,235,0.08)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {project?.name}
                </h1>
              )}
            </div>

            {/* Navigation — all views (dashboard, BA modules, generators) open from here / the dashboard grid */}
            <div className="flex items-center gap-2">
              <BAModuleNav active={activeEditor} onSelect={setActiveEditor} />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {activeEditor === 'gantt' && <GanttEditor />}
        {activeEditor === 'raci' && <RACIMatrixEditor />}
        {activeEditor === 'architecture' && <ArchitectureEditor />}
        {activeEditor === 'bpmn' && <BPMNEditor />}
        {activeEditor === 'proposal' && <ProposalEditor />}
        {/* BA modules */}
        {activeEditor === 'brd' && <BRDEditor />}
        {activeEditor === 'requirements' && <RequirementsEditor />}
        {activeEditor === 'userStories' && <UserStoriesEditor />}
        {activeEditor === 'useCase' && <UseCaseEditor />}
        {activeEditor === 'erd' && <ERDEditor />}
        {activeEditor === 'asIsToBe' && <AsIsToBeEditor />}
        {activeEditor === 'traceability' && <TraceabilityEditor />}
        {activeEditor === 'testCases' && <TestCaseEditor />}
        {activeEditor === 'gapAnalysis' && <GapAnalysisEditor />}
        {activeEditor === 'businessCase' && <BusinessCaseEditor />}
        {activeEditor === 'baDashboard' && <BADashboardEditor onOpen={setActiveEditor} />}
        {isBAModule(activeEditor) && !['baDashboard', 'brd', 'requirements', 'userStories', 'useCase', 'erd', 'asIsToBe', 'traceability', 'testCases', 'gapAnalysis', 'businessCase'].includes(activeEditor) && <ComingSoon module={activeEditor} />}
      </div>
    </div>
  );
}
