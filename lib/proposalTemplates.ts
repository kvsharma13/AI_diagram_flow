import { ProposalSection, ProposalTemplateId, ProposalSectionType } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

interface TemplateDefinition {
  id: ProposalTemplateId;
  name: string;
  description: string;
  sections: Array<{ type: ProposalSectionType; title: string; content: string }>;
}

export const proposalTemplates: TemplateDefinition[] = [
  {
    id: 'sow',
    name: 'Statement of Work',
    description: 'Detailed project scope, deliverables, timeline and terms',
    sections: [
      { type: 'cover', title: 'Cover Page', content: '' },
      { type: 'executive_summary', title: 'Executive Summary', content: '## Executive Summary\n\nProvide a brief overview of the project, its objectives, and expected outcomes.\n' },
      { type: 'scope', title: 'Scope of Work', content: '## Scope of Work\n\n### In Scope\n- \n\n### Out of Scope\n- \n' },
      { type: 'timeline', title: 'Project Timeline', content: '## Project Timeline\n\nThe project will be executed in the following phases:\n' },
      { type: 'stakeholders', title: 'Stakeholders & Team', content: '## Stakeholders & Team\n\n| Role | Responsibility |\n|------|---------------|\n| | |\n' },
      { type: 'deliverables', title: 'Deliverables', content: '## Deliverables\n\n1. \n2. \n3. \n' },
      { type: 'architecture', title: 'Technical Architecture', content: '## Technical Architecture\n\nOverview of the system architecture and technology stack.\n' },
      { type: 'risks', title: 'Risks & Mitigation', content: '## Risks & Mitigation\n\n| Risk | Impact | Likelihood | Mitigation |\n|------|--------|------------|------------|\n| | | | |\n' },
      { type: 'budget', title: 'Budget & Pricing', content: '## Budget & Pricing\n\n| Item | Cost |\n|------|------|\n| | |\n| **Total** | **$** |\n' },
      { type: 'terms', title: 'Terms & Conditions', content: '## Terms & Conditions\n\n### Payment Terms\n\n### Intellectual Property\n\n### Confidentiality\n' },
    ],
  },
  {
    id: 'brd',
    name: 'Business Requirements',
    description: 'Business requirements document with functional specs',
    sections: [
      { type: 'cover', title: 'Cover Page', content: '' },
      { type: 'executive_summary', title: 'Business Overview', content: '## Business Overview\n\nDescribe the business context and drivers for this project.\n' },
      { type: 'scope', title: 'Business Requirements', content: '## Business Requirements\n\n### BR-001: \n**Priority:** High\n**Description:** \n\n' },
      { type: 'custom', title: 'Functional Requirements', content: '## Functional Requirements\n\n### FR-001: \n**Description:** \n**Acceptance Criteria:**\n- \n' },
      { type: 'custom', title: 'Non-Functional Requirements', content: '## Non-Functional Requirements\n\n### Performance\n\n### Security\n\n### Scalability\n' },
      { type: 'stakeholders', title: 'Stakeholders', content: '## Stakeholders\n\n| Stakeholder | Role | Interest |\n|-------------|------|----------|\n| | | |\n' },
      { type: 'custom', title: 'Acceptance Criteria', content: '## Acceptance Criteria\n\n1. \n2. \n3. \n' },
      { type: 'assumptions', title: 'Assumptions & Constraints', content: '## Assumptions & Constraints\n\n### Assumptions\n- \n\n### Constraints\n- \n' },
    ],
  },
  {
    id: 'project_charter',
    name: 'Project Charter',
    description: 'High-level project authorization and governance',
    sections: [
      { type: 'cover', title: 'Cover Page', content: '' },
      { type: 'executive_summary', title: 'Purpose', content: '## Purpose\n\nState the purpose and justification for the project.\n' },
      { type: 'scope', title: 'Scope & Objectives', content: '## Scope & Objectives\n\n### Objectives\n1. \n\n### Success Criteria\n- \n' },
      { type: 'stakeholders', title: 'Governance', content: '## Governance\n\n### Project Sponsor\n\n### Steering Committee\n\n### Project Manager\n' },
      { type: 'timeline', title: 'Timeline & Milestones', content: '## Timeline & Milestones\n\n| Milestone | Target Date |\n|-----------|------------|\n| | |\n' },
      { type: 'budget', title: 'Budget', content: '## Budget\n\n**Estimated Budget:** $\n\n| Category | Amount |\n|----------|--------|\n| | |\n' },
      { type: 'risks', title: 'Risks', content: '## Risks\n\n| Risk | Impact | Mitigation |\n|------|--------|------------|\n| | | |\n' },
      { type: 'custom', title: 'Success Criteria', content: '## Success Criteria\n\n1. \n2. \n3. \n' },
    ],
  },
  {
    id: 'technical_proposal',
    name: 'Technical Proposal',
    description: 'Technical approach, architecture and implementation plan',
    sections: [
      { type: 'cover', title: 'Cover Page', content: '' },
      { type: 'executive_summary', title: 'Technical Summary', content: '## Technical Summary\n\nProvide an overview of the proposed technical solution.\n' },
      { type: 'architecture', title: 'System Architecture', content: '## System Architecture\n\nDescribe the proposed architecture.\n' },
      { type: 'bpmn_process', title: 'Process Flows', content: '## Process Flows\n\nKey business processes and their implementations.\n' },
      { type: 'custom', title: 'Technical Approach', content: '## Technical Approach\n\n### Methodology\n\n### Technology Stack\n\n### Integration Points\n' },
      { type: 'timeline', title: 'Implementation Timeline', content: '## Implementation Timeline\n\nPhased implementation approach.\n' },
      { type: 'custom', title: 'Security & Compliance', content: '## Security & Compliance\n\n### Security Measures\n\n### Compliance Requirements\n' },
      { type: 'risks', title: 'Technical Risks', content: '## Technical Risks\n\n| Risk | Impact | Mitigation |\n|------|--------|------------|\n| | | |\n' },
    ],
  },
  {
    id: 'rfp_response',
    name: 'RFP Response',
    description: 'Response to Request for Proposal',
    sections: [
      { type: 'cover', title: 'Cover Letter', content: '## Cover Letter\n\nDear [Client Name],\n\nWe are pleased to submit our response...\n' },
      { type: 'executive_summary', title: 'Executive Summary', content: '## Executive Summary\n\nOur proposed solution addresses...\n' },
      { type: 'custom', title: 'Company Overview', content: '## Company Overview\n\n### About Us\n\n### Relevant Experience\n\n### Key Differentiators\n' },
      { type: 'scope', title: 'Proposed Solution', content: '## Proposed Solution\n\nDetailed description of our proposed solution.\n' },
      { type: 'architecture', title: 'Technical Architecture', content: '## Technical Architecture\n\nOur proposed architecture.\n' },
      { type: 'timeline', title: 'Project Timeline', content: '## Project Timeline\n\nOur proposed implementation timeline.\n' },
      { type: 'stakeholders', title: 'Project Team', content: '## Project Team\n\n| Name | Role | Experience |\n|------|------|------------|\n| | | |\n' },
      { type: 'budget', title: 'Pricing', content: '## Pricing\n\n| Item | Cost |\n|------|------|\n| | |\n| **Total** | **$** |\n' },
      { type: 'appendix', title: 'References', content: '## References\n\n### Case Study 1\n\n### Case Study 2\n' },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start from scratch with an empty document',
    sections: [],
  },
];

export function getTemplateSections(templateId: ProposalTemplateId): ProposalSection[] {
  const template = proposalTemplates.find((t) => t.id === templateId);
  if (!template) return [];

  return template.sections.map((s, index) => ({
    id: uuidv4(),
    type: s.type,
    title: s.title,
    content: s.content,
    order: index,
    isVisible: true,
  }));
}
