import type { Project } from '@/types/project';
import { buildClientBriefContext } from '@/lib/documents/briefContext';

/**
 * Builds a compact, grounded "PROJECT CONTEXT" block from the real BA artifacts
 * already in the project, so the SOW generator writes from THIS project instead
 * of inventing generic content. Kept summary-only (titles/key fields) to stay
 * within token limits. Returns '' when the project has no usable data.
 *
 * The client's uploaded-document brief (if any) is placed FIRST as the
 * authoritative source of truth for the engagement.
 */
export function buildSowContext(project: Project): string {
  const out: string[] = [];
  const t = (s: any, n = 600) => (s ? String(s).trim().slice(0, n) : '');
  const push = (s: string) => out.push(s);

  // ── Client source brief (uploaded RFP/documents) — highest priority ──
  const briefContext = buildClientBriefContext(project);
  if (briefContext) push(briefContext);

  // ── BRD ──────────────────────────────────────────────────────────────
  const brd = project.brd;
  if (brd && (brd.projectOverview || brd.objectives || brd.scopeIn || brd.scopeOut)) {
    push('\nBUSINESS REQUIREMENTS (BRD) — use for Executive Summary / Scope:');
    if (brd.projectOverview) push(`- Overview: ${t(brd.projectOverview)}`);
    if (brd.objectives) push(`- Objectives: ${t(brd.objectives)}`);
    if (brd.scopeIn) push(`- In scope: ${t(brd.scopeIn)}`);
    if (brd.scopeOut) push(`- Out of scope: ${t(brd.scopeOut)}`);
    if (brd.assumptions) push(`- Assumptions: ${t(brd.assumptions, 400)}`);
    if (brd.constraints) push(`- Constraints: ${t(brd.constraints, 400)}`);
  }

  // ── Business Case ────────────────────────────────────────────────────
  const bc = project.businessCase;
  if (bc && (bc.problemStatement || bc.proposedSolution || bc.executiveSummary)) {
    push('\nBUSINESS CASE — use for Objectives / ROI:');
    if (bc.executiveSummary) push(`- Summary: ${t(bc.executiveSummary)}`);
    if (bc.problemStatement) push(`- Problem: ${t(bc.problemStatement)}`);
    if (bc.proposedSolution) push(`- Solution: ${t(bc.proposedSolution)}`);
    if (bc.recommendation) push(`- Recommendation: ${t(bc.recommendation, 400)}`);
    (bc.costBenefit || []).slice(0, 15).forEach((c) =>
      push(`- ${c.type}: ${t(c.item, 120)} (Y1 ${c.year1 || '-'}, Y2 ${c.year2 || '-'}, Y3 ${c.year3 || '-'})`)
    );
  }

  // ── Requirements → Scope of Services ─────────────────────────────────
  const reqs = project.requirements || [];
  if (reqs.length) {
    push(`\nREQUIREMENTS (${reqs.length}) — EVERY one becomes a Scope of Services item, marked Included:`);
    reqs.slice(0, 50).forEach((r) =>
      push(
        `- ${r.reqId} [${r.type}/${r.priority}]: ${t(r.description, 240)}` +
          (r.category ? ` {area: ${r.category}}` : '') +
          (r.fitCriterion ? ` {target: ${t(r.fitCriterion, 120)}}` : '')
      )
    );
    if (reqs.length > 50) push(`- …and ${reqs.length - 50} more requirements`);
  }

  // ── User Stories ─────────────────────────────────────────────────────
  const epics = project.userStories?.epics || [];
  const storyCount = epics.reduce((n, e) => n + (e.stories?.length || 0), 0);
  if (storyCount) {
    push(`\nUSER STORIES (${storyCount} across ${epics.length} epics):`);
    epics.slice(0, 10).forEach((e) => {
      push(`- Epic: ${t(e.name, 120)}`);
      (e.stories || []).slice(0, 8).forEach((s) =>
        push(`  • ${s.storyId} [${s.priority}]: As a ${t(s.role, 60)}, I want ${t(s.goal, 120)} so that ${t(s.benefit, 120)}`)
      );
    });
  }

  // ── Gantt → Timeline & payment milestones ───────────────────────────
  const phases = project.ganttPhases || [];
  if (phases.length) {
    const unit = project.timelineUnit === 'weeks' ? 'week' : 'month';
    push(`\nDELIVERY PHASES (timeline in ${unit}s) — use for Project Delivery Timeline AND milestone-based payment schedule:`);
    phases.forEach((p) =>
      push(
        `- ${t(p.name, 100)}: starts ${unit} ${p.startMonth}, duration ${p.duration} ${unit}(s)` +
          (p.deliverables ? `, deliverables: ${t(p.deliverables, 200)}` : '')
      )
    );
  }

  // ── RACI → Governance & Responsibilities ────────────────────────────
  const stake = project.raciStakeholders || [];
  const tasks = project.raciTasks || [];
  if (stake.length || tasks.length) {
    push('\nGOVERNANCE (RACI) — use for Project Team / Governance & Responsibilities:');
    if (stake.length) push(`- Stakeholders: ${stake.map((s) => `${s.name}${s.role ? ` (${s.role})` : ''}`).join('; ')}`);
    if (tasks.length) push(`- Responsibility areas: ${tasks.slice(0, 20).map((x) => t(x.taskName, 60)).join('; ')}`);
  }

  // ── Gap Analysis + Business-case risks → Risks ───────────────────────
  const gaps = project.gapAnalysis?.gaps || [];
  const risks = bc?.risks || [];
  if (gaps.length || risks.length) {
    push('\nRISKS / GAPS — use for Risks & Assumptions:');
    gaps.slice(0, 20).forEach((g) => push(`- ${g.gapId} [${g.impact}]: ${t(g.description, 200)} → ${t(g.recommendation, 160)}`));
    risks.slice(0, 20).forEach((r) => push(`- ${r.riskId} [L:${r.likelihood}/I:${r.impact}]: ${t(r.description, 200)} → ${t(r.mitigation, 160)}`));
  }

  // ── Test Cases → Acceptance / SLAs ───────────────────────────────────
  const tcs = project.testCases || [];
  if (tcs.length) {
    push(`\nACCEPTANCE / TEST CASES (${tcs.length}) — use for Go-Live Acceptance & Success Criteria:`);
    tcs.slice(0, 30).forEach((tc) =>
      push(`- ${tc.testId} (${tc.requirementId}): ${t(tc.description, 160)} → expected: ${t(tc.expectedResult, 160)}`)
    );
  }

  // ── Architecture board → Solution Architecture ──────────────────────
  const board = (project.architectureDiagram as any)?.boards?.infrastructure
    || (project.architectureDiagram as any)?.boards?.cloud
    || project.architectureDiagram; // legacy single-diagram shape
  const nodes: any[] = board?.nodes || [];
  if (nodes.length) {
    const label = (n: any) => String(n.data?.label || n.label || '').trim();
    const groups = nodes.filter((n) => n.type === 'group').map(label).filter(Boolean);
    const services = nodes.filter((n) => n.type !== 'group').map(label).filter(Boolean);
    push('\nSOLUTION ARCHITECTURE — reflect these in the Solution Architecture section:');
    if (groups.length) push(`- Layers/Tiers: ${groups.join(', ')}`);
    if (services.length) push(`- Components: ${services.slice(0, 50).join(', ')}`);
  }

  return out.join('\n').trim();
}
