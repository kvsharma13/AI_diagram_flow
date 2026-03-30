# File Structure and Functions

This document provides a comprehensive breakdown of the **SOW Editor** project - a Next.js application for creating project diagrams, Gantt charts, RACI matrices, and architecture diagrams.

## **Core Configuration Files**

- **`package.json`** - Project dependencies and scripts
- **`next.config.ts`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`middleware.ts`** - Authentication middleware (likely Clerk-based)
- **`.env.local`** - Environment variables (Supabase, Clerk, Razorpay keys)

---

## **App Directory** (`/app`) - Next.js 13+ App Router

### **Main Pages**
- **`page.tsx`** - Landing/home page
- **`layout.tsx`** - Root layout with global styles

### **Authentication** (Clerk)
- **`sign-in/[[...sign-in]]/page.tsx`** - Sign in page
- **`sign-up/[[...sign-up]]/page.tsx`** - Sign up page

### **Dashboard** (`/dashboard`)
- **`page.tsx`** - Dashboard home
- **`layout.tsx`** - Dashboard layout wrapper
- **`projects/page.tsx`** - Projects list
- **`projects/[id]/page.tsx`** - Individual project editor
- **`projects/new/page.tsx`** - Create new project
- **`gantt/page.tsx`** - Gantt chart editor
- **`raci/page.tsx`** - RACI matrix editor
- **`architecture/page.tsx`** - Architecture diagram editor
- **`subscription/page.tsx`** - Subscription management

### **Payment Flow**
- **`pricing/page.tsx`** - Pricing plans
- **`payment/success/page.tsx`** - Payment success page
- **`payment/cancelled/page.tsx`** - Payment cancelled page
- **`debug-payment/page.tsx`** - Payment debugging

### **Utilities**
- **`editor/page.tsx`** - Standalone editor page
- **`setup-check/page.tsx`** - Setup verification
- **`get-my-id/page.tsx`** - User ID retrieval

### **API Routes** (`/app/api`)
- **`projects/route.ts`** - CRUD for projects list
- **`projects/[id]/route.ts`** - CRUD for individual projects
- **`ai-generate/route.ts`** - AI architecture generation (OpenAI)
- **`ai-usage/route.ts`** - Track AI usage
- **`create-subscription/route.ts`** - Create Razorpay subscription
- **`activate-subscription/route.ts`** - Activate subscription
- **`check-subscription/route.ts`** - Check subscription status
- **`razorpay-webhook/route.ts`** - Handle Razorpay webhooks
- **`track-architecture-usage/route.ts`** - Track architecture usage
- **`setup-check/route.ts`** - API setup verification

---

## **Components** (`/components`)

### **Top-Level Components**
- **`ModernNavbar.tsx`** - Main navigation bar
- **`Sidebar.tsx`** - Dashboard sidebar
- **`ProjectEditor.tsx`** - Main project editor wrapper
- **`AIImportModal.tsx`** - AI-powered import modal
- **`CodeImportModal.tsx`** - Code import modal

### **Architecture Components** (`/components/architecture`)
- **`ArchitectureEditor.tsx`** - Main architecture editor with mode switching
- **`ModeSelector.tsx`** - Toggle between Application/Infrastructure/AI modes
- **`ExportModal.tsx`** - Export diagrams (PNG, PDF, SVG, Mermaid)

#### **Application Mode** (`application-mode/`)
- **`ApplicationEditor.tsx`** - Application architecture editor
- **`MermaidPreview.tsx`** - Live Mermaid diagram preview

#### **Infrastructure Mode** (`infrastructure-mode/`)
- **`InfrastructureEditor.tsx`** - Visual infrastructure diagram editor
- **`ReactFlowCanvas.tsx`** - React Flow-based canvas
- **`NodeSidebar.tsx`** - Node/layer management sidebar

#### **AI Mode** (`ai-mode/`)
- **`AIGenerator.tsx`** - AI-powered architecture generation

### **Gantt Components** (`/components/gantt`)
- **`GanttTemplateSelector.tsx`** - Template selector for Gantt charts

### **UI Components** (`/components/ui`)
- **`button.tsx`** - Button component
- **`card.tsx`** - Card component
- **`badge.tsx`** - Badge component
- **`skeleton.tsx`** - Loading skeleton

---

## **Editors** (`/editors`)

Standalone editor components for different diagram types:
- **`GanttEditor.tsx`** - Gantt chart editor
- **`RACIMatrixEditor.tsx`** - RACI matrix editor
- **`ArchitectureEditor.tsx`** - Architecture diagram editor (legacy?)
- **`CodeDiagramEditor.tsx`** - Code diagram editor
- **`FlowchartEditor.tsx`** - Flowchart editor
- **`VisualArchitectureEditor.tsx`** - Visual architecture editor
- **`VisualDiagramEditor.tsx`** - General visual diagram editor

---

## **Library/Utils** (`/lib`)

### **Architecture Utilities** (`/lib/architecture`)
- **`aiArchitectureGenerator.ts`** - AI generation logic (OpenAI API)
- **`mermaidGenerator.ts`** - Generate Mermaid syntax from diagrams
- **`infrastructureCodeGenerator.ts`** - Generate IaC code (Terraform, AWS CDK, etc.)

### **Core Utilities**
- **`supabase.ts`** - Supabase client initialization
- **`razorpay.ts`** - Razorpay payment gateway setup
- **`checkSubscription.ts`** - Subscription validation logic
- **`config.ts`** - App configuration
- **`ganttTemplates.ts`** - Pre-built Gantt templates
- **`utils.ts`** - General utility functions (likely classnames merger)

---

## **Services** (`/services`)

- **`AutoSaveService.ts`** - Auto-save functionality for projects
- **`ExportService.ts`** - Export diagrams to various formats

---

## **State Management** (`/store`)

Zustand stores:
- **`useProjectStore.ts`** - Global project state management
- **`architectureStore.ts`** - Architecture diagram state

---

## **Types** (`/types`)

TypeScript type definitions:
- **`project.ts`** - Project, Gantt, RACI, Flowchart types
- **`architecture.ts`** - Architecture diagram types (Node, Edge, Layer)

---

## **Templates** (`/templates`)

- **`TemplateLoader.tsx`** - Load pre-built templates

---

## **Public Assets** (`/public`)

Static assets (icons, images, fonts)

---

## **Documentation Files**

- **`README.md`** - Project overview
- **`FEATURE.md`** - Feature documentation
- **`SETUP_GUIDE.md`** - Setup instructions
- **`CODE_IMPORT_GUIDE.md`** - Code import guide
- **`IMPLEMENTATION_STATUS.md`** - Implementation progress
- **`TROUBLESHOOTING.md`** - Common issues and fixes
- **`UI_IMPROVEMENTS.md`** - UI enhancement notes
- **`WHITELIST_SETUP.md`** - Whitelist configuration

---

## **Key Technologies**

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Clerk** (Authentication)
- **Supabase** (Database)
- **Razorpay** (Payments)
- **React Flow** (Visual diagrams)
- **Mermaid** (Diagram generation)
- **Zustand** (State management)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

---

## **Project Overview**

This is a comprehensive project management tool for creating SOWs (Statement of Work) with visual editors for:
- **Gantt Charts** - Project timeline visualization
- **RACI Matrices** - Responsibility assignment matrices
- **Architecture Diagrams** - Application and infrastructure architecture with AI-powered generation
- **Flowcharts** - Process flow diagrams

The application features:
- Subscription-based monetization via Razorpay
- AI-powered architecture generation
- Multiple export formats (PNG, PDF, SVG, Mermaid, IaC code)
- Real-time collaboration and auto-save
- Template library for quick starts