import type { ClientBrief, ClientBriefRequirement, ClientBriefStakeholder } from '@/types/project';

// Distils an uploaded client document (RFP etc.) into a structured ClientBrief in
// ONE OpenAI pass, then merges it into the project's existing brief. The brief —
// not the raw document — is what grounds every downstream generator.

const MODEL = 'gpt-4o';
const MAX_INPUT_CHARS = 340_000; // ~85k tokens; leaves room for the ~4k output

const SYSTEM_PROMPT = `You are a senior business analyst. Read the client document below (an RFP, brief, or client information pack) and extract a STRUCTURED CLIENT BRIEF as JSON.

Return ONLY this JSON object (no prose, no code fences):
{
  "clientName": "<client / organisation name, or ''>",
  "projectName": "<project / engagement name, or ''>",
  "background": "<2-4 sentences on the current situation and why this project exists>",
  "objectives": ["<goal>"],
  "scopeIn": ["<in-scope item>"],
  "scopeOut": ["<explicitly out-of-scope item>"],
  "requirements": [{ "description": "<atomic, testable requirement>", "type": "Functional|Non-Functional", "priority": "Must Have|Should Have|Could Have|Won't Have", "category": "<functional area>" }],
  "stakeholders": [{ "name": "<name or role>", "role": "<role>" }],
  "constraints": ["<constraint>"],
  "assumptions": ["<assumption>"],
  "deliverables": ["<expected deliverable>"],
  "budget": "<budget info if stated, else ''>",
  "timeline": "<timeline / deadline info if stated, else ''>",
  "compliance": ["<regulation / standard mentioned>"],
  "risks": ["<risk mentioned or clearly implied>"],
  "summary": "<3-5 sentence executive overview>"
}

Rules:
- Extract ONLY what the document supports. Use '' or [] when information is absent. NEVER invent facts, numbers, names, or dates.
- requirements: 8-30 atomic, testable items covering functional AND non-functional aspects, where the document implies them.
- Keep each array item to one concise statement.
- Output valid JSON only — no markdown, no comments, no trailing commas.`;

const PRIORITIES = ['Must Have', 'Should Have', 'Could Have', "Won't Have"];

function str(v: any): string {
  return typeof v === 'string' ? v.trim() : '';
}

function arr(v: any): string[] {
  if (Array.isArray(v)) {
    return v
      .map((x) => (typeof x === 'string' ? x : str(x?.description) || str(x?.name) || String(x ?? '')))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

function normalizeBrief(b: any): ClientBrief {
  const requirements: ClientBriefRequirement[] = Array.isArray(b?.requirements)
    ? b.requirements
        .map((r: any): ClientBriefRequirement =>
          typeof r === 'string'
            ? { description: r.trim() }
            : {
                description: str(r?.description),
                type: r?.type === 'Non-Functional' ? 'Non-Functional' : r?.type === 'Functional' ? 'Functional' : undefined,
                priority: PRIORITIES.includes(r?.priority) ? r.priority : undefined,
                category: str(r?.category) || undefined,
              }
        )
        .filter((r: ClientBriefRequirement) => r.description)
    : [];

  const stakeholders: ClientBriefStakeholder[] = Array.isArray(b?.stakeholders)
    ? b.stakeholders
        .map((s: any): ClientBriefStakeholder =>
          typeof s === 'string' ? { name: s.trim() } : { name: str(s?.name), role: str(s?.role) || undefined }
        )
        .filter((s: ClientBriefStakeholder) => s.name)
    : [];

  return {
    clientName: str(b?.clientName) || undefined,
    projectName: str(b?.projectName) || undefined,
    background: str(b?.background) || undefined,
    objectives: arr(b?.objectives),
    scopeIn: arr(b?.scopeIn),
    scopeOut: arr(b?.scopeOut),
    requirements,
    stakeholders,
    constraints: arr(b?.constraints),
    assumptions: arr(b?.assumptions),
    deliverables: arr(b?.deliverables),
    budget: str(b?.budget) || undefined,
    timeline: str(b?.timeline) || undefined,
    compliance: arr(b?.compliance),
    risks: arr(b?.risks),
    summary: str(b?.summary) || undefined,
  };
}

export async function analyzeTextToBrief(text: string): Promise<ClientBrief> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const input = text.slice(0, MAX_INPUT_CHARS);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: input },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || '{}';
  let parsed: any = {};
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = {};
  }
  return normalizeBrief(parsed);
}

const dedupe = (a?: string[], b?: string[]): string[] =>
  Array.from(new Set([...(a || []), ...(b || [])].map((s) => s.trim()).filter(Boolean)));

/** Merge a newly analysed brief into the project's existing brief (union, no dup). */
export function mergeBriefs(existing: ClientBrief | null | undefined, incoming: ClientBrief, sourceDoc?: string): ClientBrief {
  const e = existing || {};

  const reqKey = (r: ClientBriefRequirement) => r.description.toLowerCase().trim();
  const requirements: ClientBriefRequirement[] = [...(e.requirements || [])];
  const seenReq = new Set(requirements.map(reqKey));
  for (const r of incoming.requirements || []) {
    if (!seenReq.has(reqKey(r))) {
      requirements.push(r);
      seenReq.add(reqKey(r));
    }
  }

  const stakeKey = (s: ClientBriefStakeholder) => s.name.toLowerCase().trim();
  const stakeholders: ClientBriefStakeholder[] = [...(e.stakeholders || [])];
  const seenStake = new Set(stakeholders.map(stakeKey));
  for (const s of incoming.stakeholders || []) {
    if (!seenStake.has(stakeKey(s))) {
      stakeholders.push(s);
      seenStake.add(stakeKey(s));
    }
  }

  return {
    clientName: e.clientName || incoming.clientName,
    projectName: e.projectName || incoming.projectName,
    background: incoming.background || e.background,
    objectives: dedupe(e.objectives, incoming.objectives),
    scopeIn: dedupe(e.scopeIn, incoming.scopeIn),
    scopeOut: dedupe(e.scopeOut, incoming.scopeOut),
    requirements,
    stakeholders,
    constraints: dedupe(e.constraints, incoming.constraints),
    assumptions: dedupe(e.assumptions, incoming.assumptions),
    deliverables: dedupe(e.deliverables, incoming.deliverables),
    budget: e.budget || incoming.budget,
    timeline: e.timeline || incoming.timeline,
    compliance: dedupe(e.compliance, incoming.compliance),
    risks: dedupe(e.risks, incoming.risks),
    summary: incoming.summary || e.summary,
    sourceDocuments: dedupe(e.sourceDocuments, sourceDoc ? [sourceDoc] : []),
  };
}
