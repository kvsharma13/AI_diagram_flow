# SOW / Proposal Generator — Enhancement Roadmap

> Goal: turn the Proposal/SOW module from "AI writes a generic document" into
> **"one click → a polished, signable SOW built from THIS project"** — high-value,
> futuristic, easy to use, and ahead of PandaDoc / Qwilr / Proposify.

---

## 1. Vision (one sentence)
A business analyst finishes the BA work in a project, clicks **Generate SOW**, and gets a
client-ready, branded, signable Statement of Work — scope, milestones, pricing, SLAs,
governance and diagrams — all derived from the requirements, business case, Gantt, RACI and
architecture already in the project. No competitor generates from project context; that is our moat.

## 2. Benchmark
| Axis | Benchmark | What to take from it |
|------|-----------|----------------------|
| Feature completeness / credibility | **PandaDoc** | templates + content library, pricing tables, e-sign, view analytics, payments |
| Modern interactive design | **Qwilr** | responsive web proposal, embedded live pricing/video, scroll experience |
| Design control | **Proposify** | section design, approval workflow |
| Content reuse + AI fill | **Responsive (RFPIO) / Loopio** | clause/content library, AI answers |
| **Moat (ours)** | — | **AI generation from real project artifacts + auto-embedded BA diagrams** |

Positioning: **PandaDoc = feature bar, Qwilr = design bar, AI-from-project-context = the moat.**

## 3. Current state (honest audit — 2026-06)
- **"Generate Full SOW with AI"** ([editors/ProposalEditor.tsx](../editors/ProposalEditor.tsx) `handleGenerateFullSOW`) sends **only the user's prompt** (`{ textInput, type: 'full_sow' }`). It pulls **nothing** from other modules.
- **Per-section AI** ([components/proposal/SectionAIModal.tsx](../components/proposal/SectionAIModal.tsx)) uses only project name + Gantt phase **names** + RACI stakeholder **names** + an architecture "available" flag — and that flag reads the **deprecated** `architectureMermaidCode`, so it is effectively always empty.
- **Diagram embedding** is wired (`DIAGRAM_INJECTION_MAP` → `captureDiagramSnapshot`) but snapshots the **live DOM**; the source editors aren't mounted when you're on the Proposal tab, so **it never actually fires**.
- Document editor is **light/paper-themed** (intentional — a SOW is a printable document). Keep it light.
- No pricing table, no e-signature, no view tracking, no content library, no version history.

**Conclusion: it is prompt-driven generation with cosmetic hints. The moat is unbuilt — which is the opportunity.**

---

## 4. Phase-wise plan

Effort key: **S** = ~1 day, **M** = ~2–4 days, **L** = ~1 week+. Each phase ships independently.

### PHASE 0 — The Moat (build first)
*Turns the module into the thing nobody else has. Mostly wiring data we already store.*

| # | Feature | Effort | Why |
|---|---------|--------|-----|
| 0.1 | **Project-aware SOW generation** | M | Feed real artifacts into `full_sow`. The core differentiator. |
| 0.2 | **Reliable diagram embedding** | S–M | Embed Architecture/Gantt/BPMN/process diagrams from stored data, not live DOM. |
| 0.3 | **Auto-derived, quantified SLAs + acceptance criteria** | M | Makes the SOW defensible, not generic. |

**0.1 — How:**
- In `handleGenerateFullSOW`, build a structured `projectArtifacts` object and POST it alongside the prompt.
- Extend the `full_sow` branch in [app/api/ai-generate/route.ts](../app/api/ai-generate/route.ts) to accept `artifacts` and weave them into the system/user prompt with the **Section → Artifact mapping** (see §5).
- Source data (all already in `useProjectStore`): `requirements`, `businessCase`, `ganttPhases`, `raciTasks`/`raciStakeholders`/`raciAssignments`, `gapAnalysis`, `testCases`, `userStories`, `useCaseDiagram`, `asIsToBe`, and the architecture board from `architectureStore` (`boards.infrastructure`/`boards.cloud`).
- Keep prompt size sane: send **summaries** (titles, counts, key fields), not full nested objects.

**0.2 — How:**
- Replace live-DOM `captureDiagramSnapshot` reliance with one of:
  - (a) render the target diagram off-screen from stored data, snapshot, embed; or
  - (b) reuse the existing per-module export image builders in [lib/ba/export/builders.ts](../lib/ba/export/builders.ts) which already produce diagram images.
- Map sections to artifacts (architecture → architecture board, timeline → Gantt, process → BPMN, governance → RACI).

**0.3 — How:**
- New `type: 'sow_slas'` (or fold into `full_sow`) that derives measurable SLAs (uptime %, response/resolution times, penalties) and acceptance criteria from `requirements` (esp. NFRs) + `testCases`.

**Definition of done (Phase 0):** generating a SOW on a populated project yields scope/objectives/timeline/governance/risks that visibly reflect that project's data, with at least one real diagram embedded.

---

### PHASE 1 — Table-stakes (don't lose "but does it do X?")
*Match PandaDoc's expected feature set.*

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 1.1 | **Pricing / quote table** | M | Line items, optional/multi-select, qty, tax, totals. Auto-seed from Gantt phases. |
| 1.2 | **E-signature + approval / sign-off** | M | Client signs in-doc → locked, dated baseline. |
| 1.3 | **Shareable web link + view analytics** | M | Send a link; track opened / time-per-section ("the wow"). |
| 1.4 | **Content / clause library + template gallery** | S–M | Reusable sections (payment terms, legal, bio) + starter templates. |
| 1.5 | **Branding kit** | S | Logo, colors, fonts, cover, header/footer — set once. (Partly exists in `proposalDocument.branding`.) |

**How (high level):**
- 1.1: new `pricing` block type in `ProposalSection`/`ProposalDocument`; renders a table; totals computed client-side.
- 1.2/1.3: needs a **public share route** (`app/p/[token]/page.tsx`) that renders a read-only doc by signed token; e-sign captures name + timestamp + IP; analytics writes view events to a `proposal_views` table.
- 1.4: store reusable blocks per user (new table or JSONB on user); insert into a doc.

**Definition of done (Phase 1):** a user can price, send a link, see it was viewed, and get it signed.

---

### PHASE 2 — Futuristic / "10x" differentiators
*Where it pulls clearly ahead.*

| # | Feature | Effort | Notes |
|---|---------|--------|-------|
| 2.1 | **Conversational AI editing** | M | "make it more formal", "add a security section", "cut to 2 pages", "rewrite for a non-technical buyer" — inline, per-section or whole-doc. |
| 2.2 | **Interactive web proposal (Qwilr-style)** | L | Responsive scroll experience with live pricing + embedded diagrams instead of flat PDF. |
| 2.3 | **Client portal: comments + accept / request changes** | M–L | Client comments per section; you see it live. |
| 2.4 | **Version history + redlining** | M | Track changes, compare, restore. CLM-grade trust. |
| 2.5 | **Collect deposit on acceptance** | M | Payment link on sign — reuse the existing **Razorpay** integration. |
| 2.6 | **Multi-language + currency** | S–M | Generate in the client's language/currency (India + global). |

**Definition of done (Phase 2):** a client can open an interactive link, comment, accept, sign, and pay a deposit — in their language.

---

### PHASE 3 — Ease-of-use polish
*Make it feel effortless.*
- One-click **Generate from project** with smart defaults (never a blank page).
- Drag-reorder / show-hide / duplicate sections (some exists).
- Live **word count / read-time / completeness meter**.
- Export parity: pixel-perfect **PDF + DOCX + web link** from one source.
- Dashboard card shows **last sent / last viewed / signed** status.

---

## 5. Section → Artifact mapping (the key spec for Phase 0.1)

| SOW Section | Pulled from | How it's used |
|-------------|-------------|---------------|
| Executive Summary / Objectives | `businessCase` (problem, objectives, expected benefits/ROI) | Frame the why + value |
| Scope of Work | `requirements` (functional) + `userStories` | In-scope features/deliverables |
| Out of Scope | `requirements` flagged out / gaps | Explicit exclusions |
| Solution / Technical Approach | architecture board + `useCaseDiagram` | Narrative + **embedded architecture diagram** |
| Process / Ways of Working | `asIsToBe` / BPMN | **Embedded process diagram** |
| Timeline & Milestones | `ganttPhases` (name, start, duration) | Phase table + **embedded Gantt** + payment milestones |
| Pricing & Payment Schedule | `ganttPhases` + pricing block (Phase 1.1) | Milestone-based payments |
| Governance & Responsibilities | `raciTasks` / `raciStakeholders` / `raciAssignments` | **Embedded RACI** + roles narrative |
| SLAs & Acceptance Criteria | `requirements` (NFRs) + `testCases` | Quantified SLAs + acceptance |
| Risks & Assumptions | `gapAnalysis` | Risk register narrative |
| Terms / Legal | content library (Phase 1.4) | Reusable clauses |

> Keep payloads as **summaries** (counts + key fields), not full objects, to stay within token limits.

---

## 6. Data-model changes (incremental, best-effort like existing pattern)
- `ProposalSection`: add optional `kind` (`'text' | 'pricing' | 'diagram'`) and `pricing?` (line items).
- `ProposalDocument`: add `signature?`, `sharedToken?`, `views?` summary.
- New tables (when reached): `proposal_views` (analytics), optional `proposal_shares` (tokens). Use **separate best-effort updates** in the API so a missing column never breaks core saves (same pattern as `architecture_diagram` migration 0002).
- Reuse existing **Razorpay** for 2.5; existing **export builders** (`lib/ba/export/builders.ts`) for diagram images.

## 7. Recommended build order
1. **Phase 0.1 → 0.2 → 0.3** (the moat — highest leverage, data already exists).
2. **1.2 e-sign + 1.1 pricing + 1.3 tracking** (the three buyers expect).
3. **2.1 conversational AI editing** (ease-of-use wow).
4. Everything else as upside.

## 8. Risks / decisions
- **Token limits** on `full_sow` — send summaries, not full artifacts; chunk if needed.
- **Keep the document editor light** (a SOW is printable paper) — confirmed decision.
- **Public share route** introduces unauthenticated rendering — scope read-only, token-gated, no project data leakage.
- **Diagram snapshot** must move off live-DOM to be reliable (Phase 0.2).

---

*Owner: single-operator BA tool (ProjectFlow AI). Target buyer: SMB BA/PM teams. This doc is the source of truth for the SOW/Proposal module; update it as phases ship.*
