import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format, startOfMonth } from 'date-fns';
import { isWhitelistedUser, isTestUser, getTestUserPlan, getAICreditsForPlan } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { textInput, type } = await request.json();

    if (!textInput || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: textInput and type' },
        { status: 400 }
      );
    }

    // Check if user is whitelisted or test user
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const isWhitelisted = isWhitelistedUser(userId, email);
    const isTest = isTestUser(email);

    console.log(`User check - ID: ${userId}, Email: ${email}, IsTest: ${isTest}, IsWhitelisted: ${isWhitelisted}`);

    // Get or create user from database
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status, subscription_plan_type')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      // Create user if doesn't exist - NO SUBSCRIPTION by default
      console.log('Creating new user in database:', userId, email);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: email || `${userId}@user.com`,
          subscription_status: 'inactive', // Changed: users must subscribe first
        })
        .select('id, subscription_status, subscription_plan_type')
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user. Please try again.', details: createError.message },
          { status: 500 }
        );
      }

      if (!newUser) {
        console.error('User creation returned null');
        return NextResponse.json(
          { error: 'Failed to create user. Please try again.' },
          { status: 500 }
        );
      }

      console.log('User created successfully:', newUser.id);
      user = newUser;
    } else {
      console.log('User found in database:', user.id);
    }

    // Whitelisted users have unlimited access
    if (isWhitelisted) {
      console.log('Whitelisted user - unlimited access');
      // Skip subscription and usage checks for whitelisted users
      // Continue to generation
    } else if (isTest) {
      // Test users have plan-based access without payment
      console.log('Test user - plan-based access');
      const testPlan = getTestUserPlan(email);
      const aiLimit = getAICreditsForPlan(testPlan || 'basic');

      // Check AI usage for current month
      const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

      const { data: usage } = await supabaseAdmin
        .from('ai_usage')
        .select('generations_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      const currentUsage = usage?.generations_count || 0;

      if (currentUsage >= aiLimit) {
        return NextResponse.json(
          {
            error: `AI generation limit reached (${aiLimit}/${aiLimit}). Upgrade your plan or wait until next month.`,
            limitReached: true,
            remaining: 0
          },
          { status: 429 }
        );
      }
    } else {
      // For regular users, check subscription
      if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
        return NextResponse.json(
          { error: 'Active subscription required. Please subscribe to use AI generation.', needsSubscription: true },
          { status: 403 }
        );
      }

      // Get AI limit based on their plan
      const aiLimit = getAICreditsForPlan(user.subscription_plan_type);

      // Check AI usage for current month
      const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

      const { data: usage } = await supabaseAdmin
        .from('ai_usage')
        .select('generations_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      const currentUsage = usage?.generations_count || 0;

      if (currentUsage >= aiLimit) {
        return NextResponse.json(
          {
            error: `AI generation limit reached (${aiLimit}/${aiLimit}). Upgrade your plan or wait until next month.`,
            limitReached: true,
            remaining: 0
          },
          { status: 429 }
        );
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    let systemPrompt: string;

    if (type === 'gantt') {
      systemPrompt = `You are a project management assistant. Convert the provided project timeline text into a JSON structure for a Gantt chart.

Output format:
{
  "timeline": {
    "totalMonths": <number>,
    "phases": [
      {
        "name": "<phase name>",
        "startMonth": <number>,
        "endMonth": <number>,
        "color": "<blue|green|orange|purple|pink|teal>",
        "months": [
          {
            "month": <number>,
            "title": "<month title>",
            "tasks": ["<task1>", "<task2>"],
            "deliverables": ["<deliverable1>"],
            "milestones": ["<milestone1>"]
          }
        ]
      }
    ]
  }
}

Rules:
- Extract phases, months, tasks, deliverables, and milestones from the text
- Assign colors to phases (alternate between blue, green, orange, purple)
- Calculate startMonth and endMonth for each phase
- Return ONLY valid JSON, no explanations`;
    } else if (type === 'bpmn') {
      systemPrompt = `You are a business process modeling assistant. Convert the provided process description into a BPMN diagram JSON structure.

Output format:
{
  "swimlanes": [
    { "id": "lane-1", "label": "<role/department>", "role": "<role>", "color": "#6366f1", "order": 0 }
  ],
  "nodes": [
    { "id": "node-1", "type": "startEvent|endEvent|task|userTask|serviceTask|scriptTask|exclusiveGateway|parallelGateway|inclusiveGateway|intermediateEvent|subProcess", "label": "<label>", "swimlaneId": "lane-1", "position": { "x": 100, "y": 100 } }
  ],
  "edges": [
    { "id": "edge-1", "type": "sequenceFlow", "source": "node-1", "target": "node-2", "label": "<optional condition>" }
  ]
}

Rules:
- Always start with a startEvent node and end with an endEvent node
- Use exclusiveGateway for decision points (XOR), parallelGateway for parallel paths (AND)
- Use userTask for manual tasks, serviceTask for automated tasks
- Group nodes into swimlanes based on roles/departments
- Connect all nodes with sequenceFlow edges
- Position nodes left-to-right, top-to-bottom
- Return ONLY valid JSON, no explanations`;
    } else if (type === 'proposal_section') {
      systemPrompt = `You are a professional proposal writer. Generate well-structured markdown content for the given section of a project proposal.

Rules:
- Write professional, clear, and concise content
- Use proper markdown formatting (headings, bullets, tables where appropriate)
- Base content on the project context provided
- Do NOT wrap the output in JSON - return raw markdown text only
- Include placeholder values where specific data is not available (use [brackets])
- Make content realistic and actionable`;
    } else if (type === 'full_sow') {
      systemPrompt = `You are a senior business consultant and legal-grade proposal writer who specialises in technology project Statements of Work. You write at the standard of a top-tier consulting firm — specific, enforceable, and commercially sharp.

Generate a COMPLETE Statement of Work document based on the project description provided by the user.

OUTPUT FORMAT — return ONLY this JSON, no prose outside it:
{
  "title": "<Document Title>",
  "subtitle": "<e.g. Production Platform | Fixed-Fee Delivery>",
  "sections": [
    { "type": "custom", "title": "<Section Title>", "content": "<full markdown content>" }
  ]
}

MANDATORY SECTIONS — generate ALL of these in order:
1. "Document Information" — Version history table (v1.0 initial, v2.0 revised, v3.0 final), fields table: Client, Project, Document, Version, Date, Effective Date, Prepared By, Engagement Model, Total Contract Value, Delivery Timeline. Include a NOTE that this SOW supersedes all prior versions.
2. "Key Contacts" — Two subsections: Vendor contacts table (Name | Role | Phone | Email) and Client contacts table with [Name] [SPOC Name] placeholders. Include CLIENT DEPENDENCY note that client must designate SPOC within 2 business days.
3. "Scope of Services" — Opening paragraph describing full engagement scope. Then a numbered Requirements Coverage table (# | Requirement | Status | Key Client Dependency) with every requirement from the project description marked "Included". Then detailed subsections for each requirement with bullet-point specifics and a bold "CLIENT DEPENDENCY:" callout per requirement stating exactly what data/access is needed and by what deadline (e.g. "by Day 5 of engagement").
4. "Go-Live Acceptance & Success Criteria" — Intro paragraph. Then a lettered table (# | Success Criterion | Agreed SLA / Threshold | Client Dependency for Measurement) with specific, quantified thresholds for each requirement (e.g. ">=95%", "100% on valid inputs", "<=5 minutes per batch"). Include NOTE that success criteria are evaluated against correctly formatted client inputs. End with AGREED statement that signed-off milestones are non-refundable.
5. "Contract Validity" — Subsection on commencement (binding upon execution AND receipt of Milestone 1 wire transfer). Subsection on prototype/demo gate at midpoint (written client approval required before go-live authorised, deemed approved if no objection within 3 business days).
6. "Solution Architecture" — Architecture layers table (Layer | Components | Technology Stack) covering all system layers. Data flow as numbered list. Security & access section covering RBAC, encryption, credential handling, data residency. NOTE that architecture is indicative and finalised during discovery.
7. "Project Delivery Timeline" — Intro paragraph. Phase table (Phase | Timeline | Phase Name | Key Deliverables | Client Dependencies Due) covering all phases from kickoff to post go-live support. TIMELINE NOTE that 18-week schedule is contingent on all client dependencies being met.
8. "Project Team" — Team table (Role | Allocation | Duration | Primary Responsibilities) with realistic allocations (Full-time / Part-time % / weeks). Include all roles needed for the project.
9. "Governance & Responsibilities" — Vendor responsibilities (bullet list of 6-8 specific obligations). Client responsibilities (numbered list of 12-16 specific data/access/approval obligations with exact deadlines). CLIENT DEPENDENCY block. Governance cadence table (Meeting | Frequency | Participants | Purpose). Escalation path table (Level | Role | Trigger | Resolution Target — L1 PM through L4 CEO).
10. "Service Level Agreements" — Platform Performance SLAs table (SLA Metric | Target | Measurement Method | Exclusions) for every major function. Post Go-Live Support SLAs table (Priority | Definition | Response Time | Resolution Target) with P1/P2/P3. NOTE on warranty period and exclusions.
11. "Intellectual Property & Exclusivity" — Ownership of custom deliverables (transfers on full payment). Vendor pre-existing IP (retained by vendor — list engine, models, frameworks, connectors). Non-resale restriction (no competing deployment for 12 months). Client usage rights (free to use, commercialise, sublicense custom deliverables). Optional joint GTM subsection.
12. "Refund, Remedy & Termination" — Refund rights (three simultaneous conditions). 7-day remedy window (no refund exercisable during window). Refund exclusions (10-12 specific exclusions covering client-caused delays, Oracle issues, signed-off milestones, force majeure). AGREED statement.
13. "Commercials" — Implementation pricing table listing every item in scope with "Included" status and TOTAL CONTRACT VALUE. Payment milestones table (# | Milestone | Trigger | Amount | Due Within) with exact dollar amounts. Any per-usage billing (e.g. per-page, per-API-call) as a separate table. Exclusions list (8-12 items explicitly out of scope).
14. "Change Control" — Intro on formal CR requirement. Change type table (Change Type | Definition | Approval Authority | Pricing Impact) covering Standard, Normal, and Emergency changes.
15. "Terms & Conditions" — Numbered subsections: Effective Date & Commencement, Payment Confirmation, Infrastructure Confirmation, Timeline Confirmation, Post Go-Live Support Confirmation, Confidentiality, Taxes, Delayed Payments, IP Confirmation, Limitation of Liability (capped at total contract value, no consequential damages), Notices (email to both contacts deemed valid).
16. "Future Scope" — Table of post-go-live enhancement opportunities (Enhancement | Description | Estimated Investment) with 4-6 realistic add-ons.
17. "Proposal Acceptance" — Closing paragraph. Two-column signature block: Vendor company left, Client company right (Authorized Signatory, Name, Title, Date lines for each). Vendor contact details at bottom.

WRITING QUALITY REQUIREMENTS — non-negotiable:
- CLIENT DEPENDENCY: Every requirement and phase must call out exactly what data, credentials, or approvals are needed and by when. Use the label "CLIENT DEPENDENCY:" in bold.
- QUANTIFIED SLAs: Never write vague targets. Always use specific numbers: ">=95%", "100% on valid inputs", "<=5 minutes", ">=80%". Specify how measured and what is excluded.
- PROTECTIVE CLAUSES: Include deemed-acceptance language wherever approval is needed: "If no written objection is received within [N] business days of [event], the deliverable shall be deemed accepted and [consequence]."
- EXCLUSIONS: Every scope section and the commercials section must list explicit exclusions.
- PAYMENT PROTECTION: Milestones must state "Go-live will not be authorised until Milestone [N] payment is received." Overdue payments trigger work suspension.
- TABLE FORMATTING: Use proper markdown pipe tables with header separator rows. All tables must render cleanly.
- SPECIFICITY: Do not use generic placeholders where you can infer from context. Generate realistic specific content (team sizes, percentages, timeframes) based on the project description.
- LEGAL PRECISION: Terms must be specific and enforceable. Limitation of liability must cap at total contract value. Confidentiality obligations survive termination.

The output must be a document a client would sign for a real engagement. Do not produce generic boilerplate.`;
    } else {
      systemPrompt = `You are a project management assistant. Convert the provided text into a RACI matrix JSON structure.

Output format:
{
  "raciMatrix": {
    "roles": ["<role1>", "<role2>"],
    "tasks": [
      {
        "activity": "<task name>",
        "category": "<category>",
        "<RoleKey1>": "R|A|C|I",
        "<RoleKey2>": "R|A|C|I"
      }
    ]
  }
}

Rules:
- Extract all stakeholder roles and tasks from the text
- Assign RACI values based on context (R=Responsible, A=Accountable, C=Consulted, I=Informed)
- Use camelCase for role keys (e.g., "Project Manager" → "ProjectManager")
- Return ONLY valid JSON, no explanations`;
    }

    console.log('Calling OpenAI API from server...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: type === 'full_sow' ? 'gpt-4o' : 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textInput }
        ],
        temperature: 0.3,
        ...(type === 'full_sow' ? { max_tokens: 8000 } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenAI API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    console.log('OpenAI response received');

    // For proposal_section, return raw text; for full_sow and others return JSON
    let parsedJSON: any;
    if (type === 'proposal_section') {
      parsedJSON = generatedText.trim();
    } else {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = generatedText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      parsedJSON = JSON.parse(jsonText);
    }

    // Increment AI usage count (for test users and regular subscribers)
    if (!isWhitelisted && user && user.id) {
      const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

      // Get limit based on user type
      let aiLimit;
      if (isTest) {
        const testPlan = getTestUserPlan(email);
        aiLimit = getAICreditsForPlan(testPlan || 'basic');
        console.log(`Test user detected - Plan: ${testPlan}, Limit: ${aiLimit}`);
      } else {
        aiLimit = getAICreditsForPlan(user.subscription_plan_type);
        console.log(`Regular user - Plan: ${user.subscription_plan_type}, Limit: ${aiLimit}`);
      }

      const { data: usage, error: usageError } = await supabaseAdmin
        .from('ai_usage')
        .select('generations_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      if (usageError && usageError.code !== 'PGRST116') { // PGRST116 = not found is OK
        console.error('Error fetching current usage:', usageError);
      }

      const currentUsage = usage?.generations_count || 0;
      console.log(`Current usage for user ${user.id}: ${currentUsage}/${aiLimit}`);
      console.log(`Incrementing usage: ${currentUsage} -> ${currentUsage + 1}`);

      const { data: upsertData, error: upsertError } = await supabaseAdmin
        .from('ai_usage')
        .upsert({
          user_id: user.id,
          generation_type: type, // 'gantt' or 'raci'
          month_year: currentMonth,
          generations_count: currentUsage + 1,
        }, {
          onConflict: 'user_id,month_year'
        })
        .select();

      if (upsertError) {
        console.error('❌ FAILED to update AI usage:', upsertError);
        console.error('Upsert details:', { user_id: user.id, month_year: currentMonth, generations_count: currentUsage + 1 });
      } else {
        console.log('✅ Successfully updated usage to', currentUsage + 1);
        console.log('Upsert result:', upsertData);
      }

      const remaining = aiLimit - currentUsage - 1;
      console.log(`Final: ${remaining} remaining out of ${aiLimit}`);

      return NextResponse.json({
        data: parsedJSON,
        remaining
      });
    }

    // For whitelisted users, return unlimited
    return NextResponse.json({
      data: parsedJSON,
      remaining: 999
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate chart' },
      { status: 500 }
    );
  }
}
