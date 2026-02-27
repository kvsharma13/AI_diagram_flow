import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { startOfMonth, format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event);

    // Handle different events
    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(event.payload.subscription.entity);
        break;

      case 'subscription.resumed':
        await handleSubscriptionResumed(event.payload.subscription.entity);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(subscription: any) {
  console.log('Subscription activated:', subscription.id);

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active',
      subscription_start_date: new Date(subscription.start_at * 1000).toISOString(),
      subscription_end_date: new Date(subscription.end_at * 1000).toISOString(),
    })
    .eq('subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  }

  // Initialize AI usage for current month
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('subscription_id', subscription.id)
    .single();

  if (user) {
    const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

    await supabaseAdmin.from('ai_usage').upsert({
      user_id: user.id,
      month_year: currentMonth,
      generations_count: 0,
    });
  }
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
  console.log('Subscription charged:', subscription.id, 'Payment:', payment.id);

  // Reset AI usage count for new billing period
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('subscription_id', subscription.id)
    .single();

  if (user) {
    const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

    // Reset or create AI usage for new month
    await supabaseAdmin.from('ai_usage').upsert({
      user_id: user.id,
      month_year: currentMonth,
      generations_count: 0,
    }, {
      onConflict: 'user_id,month_year',
    });
  }

  // Update subscription end date
  await supabaseAdmin
    .from('users')
    .update({
      subscription_end_date: new Date(subscription.current_end * 1000).toISOString(),
    })
    .eq('subscription_id', subscription.id);
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('Subscription cancelled:', subscription.id);

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('subscription_id', subscription.id);
}

async function handleSubscriptionPaused(subscription: any) {
  console.log('Subscription paused:', subscription.id);

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'inactive',
    })
    .eq('subscription_id', subscription.id);
}

async function handleSubscriptionResumed(subscription: any) {
  console.log('Subscription resumed:', subscription.id);

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active',
    })
    .eq('subscription_id', subscription.id);
}
