import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format, startOfMonth } from 'date-fns';
import { isWhitelistedUser, getAICreditsForPlan } from '@/lib/config';

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

    // Check if user is whitelisted
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const isWhitelisted = isWhitelistedUser(userId, email);

    // Get or create user from database
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status, subscription_plan_type')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: email || `${userId}@user.com`,
          subscription_status: 'active',
        })
        .select('id, subscription_status, subscription_plan_type')
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { error: 'Failed to create user. Please try again.' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Whitelisted users have unlimited access
    if (isWhitelisted) {
      console.log('Whitelisted user - unlimited access');
      // Skip subscription and usage checks for whitelisted users
      // Continue to generation
    } else {
      // For non-whitelisted users, check subscription
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

    const systemPrompt = type === 'gantt'
      ? `You are a project management assistant. Convert the provided project timeline text into a JSON structure for a Gantt chart.

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
- Return ONLY valid JSON, no explanations`
      : `You are a project management assistant. Convert the provided text into a RACI matrix JSON structure.

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

    console.log('Calling OpenAI API from server...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textInput }
        ],
        temperature: 0.3,
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

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const parsedJSON = JSON.parse(jsonText);

    // Increment AI usage count (only for non-whitelisted users)
    if (!isWhitelisted && user) {
      const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
      const aiLimit = getAICreditsForPlan(user.subscription_plan_type);

      const { data: usage } = await supabaseAdmin
        .from('ai_usage')
        .select('generations_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      const currentUsage = usage?.generations_count || 0;

      await supabaseAdmin.from('ai_usage').upsert({
        user_id: user.id,
        month_year: currentMonth,
        generations_count: currentUsage + 1,
      }, {
        onConflict: 'user_id,month_year'
      });

      return NextResponse.json({
        data: parsedJSON,
        remaining: aiLimit - currentUsage - 1
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
