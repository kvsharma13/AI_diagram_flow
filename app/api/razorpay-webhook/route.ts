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
  console.log('Subscription activated (created, not paid yet):', subscription.id);

  // DO NOT activate subscription here! This event fires when subscription is created,
  // NOT when payment is successful. We'll activate on subscription.charged event.

  // Just store the subscription dates for reference
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      // Keep status as 'pending' until payment is confirmed
      subscription_start_date: new Date(subscription.start_at * 1000).toISOString(),
      subscription_end_date: new Date(subscription.end_at * 1000).toISOString(),
    })
    .eq('subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription dates:', error);
  }
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
  console.log('Subscription charged - PAYMENT SUCCESSFUL:', subscription.id, 'Payment:', payment.id);

  // Get user
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, subscription_status')
    .eq('subscription_id', subscription.id)
    .single();

  if (!user) {
    console.error('User not found for subscription:', subscription.id);
    return;
  }

  // ACTIVATE subscription now that payment is confirmed
  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active', // NOW we activate, after payment
      subscription_end_date: new Date(subscription.current_end * 1000).toISOString(),
    })
    .eq('subscription_id', subscription.id);

  // Initialize AI usage for current month
  const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');

  await supabaseAdmin.from('ai_usage').upsert({
    user_id: user.id,
    month_year: currentMonth,
    generations_count: 0,
  }, {
    onConflict: 'user_id,month_year',
  });

  console.log('Subscription activated successfully after payment');
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
