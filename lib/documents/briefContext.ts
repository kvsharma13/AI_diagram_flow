import type { Project, ClientBrief } from '@/types/project';

/**
 * Builds a compact grounding block from the project's distilled ClientBrief so
 * generators (SOW, requirements, architecture…) write from the CLIENT'S actual
 * documents. Returns '' when there is no brief. Kept summary-only for token cost.
 */
export function buildClientBriefContext(project: Project): string {
  const b = project.clientBrief;
  if (!b || !hasContent(b)) return '';

  const out: string[] = [];
  const t = (s?: string, n = 800) => (s ? String(s).trim().slice(0, n) : '');
  const list = (label: string, a?: string[], n = 25) => {
    if (a && a.length) out.push(`- ${label}: ${a.slice(0, n).join('; ')}`);
  };

  out.push("CLIENT SOURCE BRIEF (distilled from the client's uploaded documents — treat as the authoritative source of truth for this engagement):");
  if (b.clientName) out.push(`- Client: ${t(b.clientName, 160)}`);
  if (b.projectName) out.push(`- Project: ${t(b.projectName, 200)}`);
  if (b.summary) out.push(`- Summary: ${t(b.summary)}`);
  if (b.background) out.push(`- Background: ${t(b.background)}`);
  list('Objectives', b.objectives);
  list('In scope', b.scopeIn);
  list('Out of scope', b.scopeOut);
  list('Deliverables', b.deliverables);
  list('Constraints', b.constraints);
  list('Assumptions', b.assumptions);
  list('Compliance', b.compliance);
  list('Risks', b.risks);
  if (b.budget) out.push(`- Budget: ${t(b.budget, 240)}`);
  if (b.timeline) out.push(`- Timeline: ${t(b.timeline, 240)}`);
  if (b.stakeholders?.length) {
    out.push(`- Stakeholders: ${b.stakeholders.slice(0, 20).map((s) => `${s.name}${s.role ? ` (${s.role})` : ''}`).join('; ')}`);
  }
  if (b.requirements?.length) {
    out.push(`- Requirements from documents (${b.requirements.length}):`);
    b.requirements.slice(0, 40).forEach((r) =>
      out.push(`  • [${r.type || '—'}/${r.priority || '—'}] ${t(r.description, 220)}${r.category ? ` {${r.category}}` : ''}`)
    );
  }

  return out.join('\n').trim();
}

function hasContent(b: ClientBrief): boolean {
  return Boolean(
    b.summary || b.background || b.clientName ||
    (b.objectives?.length) || (b.requirements?.length) ||
    (b.scopeIn?.length) || (b.deliverables?.length)
  );
}
