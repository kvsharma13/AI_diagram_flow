import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { format, startOfMonth } from 'date-fns';
import { isWhitelistedUser, getAICreditsForPlan } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if whitelisted
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    if (isWhitelistedUser(userId, email)) {
      return NextResponse.json({
        used: 0,
        remaining: 999,
        limit: 999,
        isWhitelisted: true,
        hasSubscription: true,
      });
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status, subscription_plan_type')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({
        used: 0,
        remaining: 0,
        limit: 0,
        hasSubscription: false,
      });
    }

    // Get AI limit based on plan
    const aiLimit = getAICreditsForPlan(user.subscription_plan_type);

    // Get current month usage
    const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

    const { data: usage } = await supabaseAdmin
      .from('ai_usage')
      .select('generations_count')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single();

    const used = usage?.generations_count || 0;
    const remaining = Math.max(0, aiLimit - used);

    return NextResponse.json({
      used,
      remaining,
      limit: aiLimit,
      isWhitelisted: false,
      hasSubscription: user.subscription_status === 'active' || user.subscription_status === 'trialing',
    });
  } catch (error) {
    console.error('AI usage check error:', error);
    return NextResponse.json(
      { error: 'Failed to check AI usage' },
      { status: 500 }
    );
  }
}
