import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    // Update subscription status to active
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)
      .eq('subscription_id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error activating subscription:', error);
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
