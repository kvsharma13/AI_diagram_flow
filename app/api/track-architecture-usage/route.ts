import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format, startOfMonth } from 'date-fns';
import { isWhitelistedUser, isTestUser, getTestUserPlan, getAICreditsForPlan } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const isWhitelisted = isWhitelistedUser(userId, email);
    const isTest = isTestUser(email);

    console.log(`Architecture usage - User: ${userId}, Email: ${email}, IsTest: ${isTest}`);

    // Get or create user
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status, subscription_plan_type')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: email || `${userId}@user.com`,
          subscription_status: 'inactive',
        })
        .select('id, subscription_status, subscription_plan_type')
        .single();

      user = newUser!;
    }

    // Whitelisted users have unlimited
    if (isWhitelisted) {
      return NextResponse.json({ success: true, remaining: 999 });
    }

    // Check subscription/test user
    const hasAccess = isTest || user.subscription_status === 'active' || user.subscription_status === 'trialing';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Active subscription required', needsSubscription: true },
        { status: 403 }
      );
    }

    // Get AI limit
    let aiLimit;
    if (isTest) {
      const testPlan = getTestUserPlan(email);
      aiLimit = getAICreditsForPlan(testPlan || 'basic');
    } else {
      aiLimit = getAICreditsForPlan(user.subscription_plan_type);
    }

    // Check and update usage
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
        { error: 'AI generation limit reached', limitReached: true },
        { status: 429 }
      );
    }

    // Increment usage
    await supabaseAdmin.from('ai_usage').upsert({
      user_id: user.id,
      generation_type: 'architecture',
      month_year: currentMonth,
      generations_count: currentUsage + 1,
    }, {
      onConflict: 'user_id,month_year'
    });

    const remaining = aiLimit - currentUsage - 1;

    return NextResponse.json({
      success: true,
      remaining,
      used: currentUsage + 1,
      limit: aiLimit
    });
  } catch (error) {
    console.error('Track architecture usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
