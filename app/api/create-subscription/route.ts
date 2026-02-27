import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { razorpayInstance, RAZORPAY_CONFIG } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { PRICING_PLANS } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || 'user@example.com';
    const userName = clerkUser?.fullName || clerkUser?.firstName || 'User';

    // Get plan type from request body
    const body = await request.json();
    const planType = body.planType || 'basic'; // default to basic if not specified

    if (planType !== 'basic' && planType !== 'pro') {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Get the appropriate Razorpay plan ID
    const razorpayPlanId = planType === 'basic'
      ? process.env.RAZORPAY_BASIC_PLAN_ID
      : process.env.RAZORPAY_PRO_PLAN_ID;

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `Razorpay plan ID not configured for ${planType} plan` },
        { status: 500 }
      );
    }

    // Get or create user in Supabase
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    let user = existingUser;

    if (!user) {
      // Create user in Supabase
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: userEmail,
          subscription_plan_type: planType,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({
          error: 'Failed to create user',
          details: error.message
        }, { status: 500 });
      }

      user = newUser;
    }

    // Check if already has active subscription
    if (user.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Create or get Razorpay customer
    let customerId = user.razorpay_customer_id;

    if (!customerId) {
      try {
        const customer = await razorpayInstance.customers.create({
          name: userName,
          email: userEmail,
          contact: '',
        });

        customerId = customer.id;
      } catch (error: any) {
        // If customer already exists, try to fetch by listing all customers
        if (error.error?.description?.includes('already exists')) {
          console.log('Customer already exists, fetching existing customer...');
          try {
            // Fetch all customers and find by email
            const customers = await razorpayInstance.customers.all({ count: 100 });
            const existingCustomer = customers.items.find(
              (c: any) => c.email === userEmail
            );

            if (existingCustomer) {
              customerId = existingCustomer.id;
              console.log('Found existing customer:', customerId);
            } else {
              throw new Error('Customer exists but could not be retrieved');
            }
          } catch (fetchError) {
            console.error('Error fetching customers:', fetchError);
            throw new Error('Failed to retrieve existing customer');
          }
        } else {
          throw error;
        }
      }

      // Update user with customer ID
      await supabaseAdmin
        .from('users')
        .update({ razorpay_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create Razorpay subscription
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_id: customerId,
      total_count: 12, // 12 months
      quantity: 1,
      notes: {
        user_id: userId,
        supabase_user_id: user.id,
        plan_type: planType,
      },
    } as any);

    // Store subscription ID and plan type, but keep status as pending until payment is confirmed
    await supabaseAdmin
      .from('users')
      .update({
        subscription_id: subscription.id,
        subscription_status: 'pending', // Will be updated to 'active' after payment
        subscription_plan_type: planType,
      })
      .eq('id', user.id);

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Extract detailed error message
    let errorMessage = 'Failed to create subscription';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const err = error as any;
      errorMessage = err.error?.description || err.message || JSON.stringify(err);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
