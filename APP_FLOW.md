# ProjectFlow AI — Complete App Flow

## 1. Entry Points

```
/ (Landing Page)  →  app/page.tsx
```
- Hero section, features, pricing teaser, FAQ
- CTAs: "Get Started" → /sign-up | "Sign In" → /sign-in
- Navbar: ModernNavbar.tsx (links to Pricing, Sign In, Get Started)

---

## 2. Auth Flow

```
/sign-up  →  app/sign-up/[[...sign-up]]/page.tsx
/sign-in  →  app/sign-in/[[...sign-in]]/page.tsx
```
- Powered by Clerk
- After sign-up/sign-in → redirected to /dashboard (via middleware.ts)
- middleware.ts protects all /dashboard/* routes — unauthenticated users bounce to /sign-in

---

## 3. Subscription / Paywall Flow

```
/pricing  →  app/pricing/page.tsx
```
- Shows Basic (₹900/mo) and Pro (₹2000/mo) plans
- "Subscribe" → POST /api/create-subscription → Razorpay checkout modal
- On payment success → /payment/success  (app/payment/success/page.tsx)
- On payment cancel → /payment/cancelled  (app/payment/cancelled/page.tsx)
- Razorpay webhooks → POST /api/razorpay-webhook → activates subscription in Supabase

### Subscription Check (runs on every editor & AI call)
```
lib/checkSubscription.ts
  ↓
GET /api/check-subscription
  ↓
Checks Supabase users table:
  - Whitelisted email?     → Full access, no payment needed
  - Test user?             → Plan-based limits, no payment needed
  - Active subscription?   → Access granted
  - No subscription?       → Redirect to /pricing
```

---

## 4. Dashboard

```
/dashboard  →  app/dashboard/page.tsx
             + app/dashboard/layout.tsx
```

### Layout (app/dashboard/layout.tsx)
- Sidebar.tsx — navigation across all tools
- Persistent across all /dashboard/* routes

### Dashboard Home (app/dashboard/page.tsx)
- Stats cards: total projects, AI credits remaining, diagrams created
- Quick action buttons → links to each tool
- Feature overview cards

### Sidebar Navigation Links
```
/dashboard              → Home / Stats
/dashboard/projects     → All Projects (saved)
/dashboard/gantt        → Gantt Chart Editor (standalone)
/dashboard/raci         → RACI Matrix Editor (standalone)
/dashboard/architecture → Architecture Editor (standalone)
/dashboard/subscription → Subscription management
```

---

## 5. Projects (Saved Work)

### Projects List
```
/dashboard/projects  →  app/dashboard/projects/page.tsx
```
- Grid of all saved projects (fetched via GET /api/projects)
- Each card: project name, type badge, last updated, delete button
- "New Project" button → /dashboard/projects/new

### New Project
```
/dashboard/projects/new  →  app/dashboard/projects/new/page.tsx
```
- Form: project name input
- On submit → POST /api/projects → creates record in Supabase
- Redirects to /dashboard/projects/[id]

### Project Editor (Individual Project)
```
/dashboard/projects/[id]  →  app/dashboard/projects/[id]/page.tsx
                            + components/ProjectEditor.tsx
```
- Loads project data via GET /api/projects/[id]
- Auto-save with 3-second debounce via PUT /api/projects/[id]
- Save status indicator (Saving... / Saved)
- Editable project name
- Tab switcher: Gantt | RACI | (future tabs)
- Embeds the relevant editor based on active tab

---

## 6. Editors (Tools)

All editors are in editors/ and embedded in dashboard pages or the project editor.

### 6a. Gantt Chart Editor
```
Route:     /dashboard/gantt
File:      editors/GanttEditor.tsx
Template:  lib/ganttTemplates.ts
           components/gantt/GanttTemplateSelector.tsx
```
Flow:
1. Load or start blank / pick a template
2. Add phases → add tasks per phase (name, start, end, assignee)
3. Drag-and-drop to reorder tasks
4. "AI Generate" button → POST /api/ai-generate (type: gantt)
   - Consumes 1 AI credit
   - Returns structured phases/tasks JSON
5. Export → PNG via html-to-image

### 6b. RACI Matrix Editor
```
Route:  /dashboard/raci
File:   editors/RACIMatrixEditor.tsx
```
Flow:
1. Add tasks (rows) and team members (columns)
2. Assign R / A / C / I marks per cell (dual marks supported)
3. "AI Generate" → POST /api/ai-generate (type: raci)
   - Consumes 1 AI credit
4. Export → Word (.docx) via docx library

### 6c. Architecture Editor (3 modes)
```
Route:      /dashboard/architecture
File:       editors/ArchitectureEditor.tsx
            components/architecture/ArchitectureEditor.tsx
Store:      store/architectureStore.ts
```
Mode selector → components/architecture/ModeSelector.tsx

**Application Mode** (Mermaid-based):
- components/architecture/application-mode/ApplicationEditor.tsx
- Text editor for Mermaid code
- Live preview via MermaidPreview.tsx
- AI import → AIImportModal.tsx → POST /api/ai-generate
- Code import → CodeImportModal.tsx → lib/architecture/mermaidGenerator.ts

**Infrastructure Mode** (ReactFlow canvas):
- components/architecture/infrastructure-mode/InfrastructureEditor.tsx
- Drag nodes from NodeSidebar onto ReactFlowCanvas
- Auto-layout via elkjs (lib/architecture/elkLayout.ts)
- Code import → lib/architecture/infrastructureCodeGenerator.ts
- AI generation → lib/architecture/aiArchitectureGenerator.ts

**AI Mode**:
- components/architecture/ai-mode/AIGenerator.tsx
- Describe architecture in plain text → AI generates full diagram
- POST /api/track-architecture-usage (tracks separately from main AI credits)

Export → components/architecture/ExportModal.tsx → PNG / SVG

### 6d. BPMN Editor
```
Route:  (accessed via editor/page.tsx or embedded)
File:   editors/BPMNEditor.tsx
        components/bpmn/*
```
Flow:
1. BPMNCanvas.tsx — ReactFlow-based canvas
2. BPMNToolbar.tsx — add nodes: Start/End Events, Tasks, Gateways, Swimlanes, etc.
3. Node types: StartEventNode, EndEventNode, TaskNode, GatewayNode,
               IntermediateEventNode, SubProcessNode, SwimlaneNode, DataObjectNode
4. Edge types: SequenceFlowEdge, MessageFlowEdge
5. Click node → BPMNPropertiesPanel.tsx (edit label, type)
6. AI Import → BPMNAIImportModal.tsx → POST /api/ai-generate (type: bpmn)
7. Import XML → BPMNImportModal.tsx → lib/bpmn/bpmnXmlParser.ts
8. Export → BPMNExportModal.tsx → PNG / BPMN XML

### 6e. Proposal / SOW Builder
```
Route:  (embedded in project editor or standalone)
File:   editors/ProposalEditor.tsx
        components/proposal/*
```
Flow:
1. Pick or create a template → ProposalTemplateSelector.tsx (lib/proposalTemplates.ts)
2. Cover page → CoverPageEditor.tsx (title, client name, date, logo)
3. Branding → BrandingSettings.tsx (colors, fonts)
4. Sections list → SectionList.tsx + SectionEditor.tsx
   - Add / reorder / delete sections
   - Each section: rich text editor
   - "AI Generate Section" → SectionAIModal.tsx → POST /api/ai-generate (type: proposal_section)
5. "Generate Full SOW" → GenerateSOWModal.tsx
   - Prompt describes project in plain text
   - AI generates all sections in one call
6. Diagram slots → DiagramSlotModal.tsx
   - Embed Gantt/RACI/BPMN snapshots inline in the proposal
   - lib/proposal/diagramSnapshot.ts + diagramTokens.ts
7. Export:
   - PDF → lib/proposal/pdfExport.ts (jsPDF + html2canvas)
   - DOCX → lib/proposal/docxExport.ts

### 6f. Other Editors (lighter weight)
```
editors/FlowchartEditor.tsx         — general flowchart
editors/CodeDiagramEditor.tsx       — code-to-diagram
editors/VisualDiagramEditor.tsx     — visual diagram builder
editors/VisualArchitectureEditor.tsx — visual architecture
```

---

## 7. AI Generation Flow

Every "AI Generate" action in any editor follows this path:

```
User clicks "AI Generate"
  ↓
lib/checkSubscription.ts — verify active subscription
  ↓
GET /api/ai-usage — check credits remaining (Basic: 5/mo, Pro: 10/mo)
  ↓
If credits available:
  POST /api/ai-generate
    body: { type, prompt, context }
    type: "gantt" | "raci" | "bpmn" | "proposal_section" | "architecture"
  ↓
  OpenAI GPT-4 call (server-side)
  ↓
  Returns structured JSON
  ↓
  Supabase: increment ai_usage count for this user/month
  ↓
  Editor parses response → updates diagram state
  ↓
Else: show "No credits remaining" message → upsell to higher plan
```

---

## 8. API Routes Reference

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/ai-generate | GPT-4 generation for all diagram types |
| GET | /api/ai-usage | Remaining AI credits this month |
| GET | /api/check-subscription | Plan/access status for current user |
| POST | /api/create-subscription | Create Razorpay subscription |
| POST | /api/razorpay-webhook | Handle payment events (activate/cancel) |
| POST | /api/activate-subscription | Manual subscription activation |
| GET/POST | /api/projects | List all projects / create new project |
| GET/PUT/DELETE | /api/projects/[id] | Get / update / delete a project |
| POST | /api/track-architecture-usage | Track architecture AI usage separately |
| GET | /api/setup-check | Dev/debug: verify env + DB connectivity |

---

## 9. Data Flow (Supabase)

```
users
  clerk_user_id (PK)
  email
  subscription_status     (active | cancelled | null)
  subscription_plan_type  (basic | pro)
  razorpay_subscription_id

ai_usage
  user_id (FK → users)
  month_year              (e.g. "2026-05")
  generations_count
  generation_type

projects
  id (UUID)
  user_id (FK → users)
  name
  gantt_phases            (JSONB)
  raci_tasks              (JSONB)
  raci_members            (JSONB)
  bpmn_diagram            (JSONB)
  proposal_data           (JSONB)
  architecture_data       (JSONB)
  created_at
  updated_at
```

---

## 10. State Management

```
store/useProjectStore.ts
  - current project data (gantt, raci, bpmn)
  - project metadata (name, id)
  - save status

store/architectureStore.ts
  - nodes, edges for ReactFlow canvas
  - selected mode (application | infrastructure | ai)
  - mermaid code string
```

---

## 11. Access Control Matrix

| User Type | Gantt/RACI/BPMN | AI Generation | Proposal | Architecture |
|-----------|----------------|---------------|----------|--------------|
| Whitelisted email | Unlimited | Unlimited | Unlimited | Unlimited |
| Test user (Basic) | Yes | 5/month | Yes | Yes |
| Test user (Pro) | Yes | 10/month | Yes | Yes |
| Paid Basic subscriber | Yes | 5/month | Yes | Yes |
| Paid Pro subscriber | Yes | 10/month | Yes | Yes |
| Unauthenticated | No (redirect to sign-in) | No | No | No |
| Authenticated, no plan | No (redirect to pricing) | No | No | No |

---

## 12. Complete User Journey (Happy Path)

```
1. Lands on /           → reads landing page
2. Clicks "Get Started" → /sign-up → creates Clerk account
3. Redirected to /dashboard
4. No subscription yet  → prompted to /pricing
5. Picks Pro plan       → Razorpay checkout → payment success
6. Back to /dashboard   → sees AI credits = 10
7. Creates new project  → /dashboard/projects/new → names it
8. Opens project editor → /dashboard/projects/[id]
9. Gantt tab            → adds phases/tasks OR clicks AI Generate
10. RACI tab            → assigns responsibilities
11. Goes to /dashboard/architecture → builds system diagram
12. Goes to Proposal editor → generates full SOW with AI
13. Embeds Gantt snapshot into proposal
14. Exports to PDF      → sends to client
15. Next month          → AI credits reset automatically
```
