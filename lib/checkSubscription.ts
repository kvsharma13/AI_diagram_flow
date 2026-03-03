import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';
import { isWhitelistedUser, isTestUser, getTestUserPlan, getAICreditsForPlan } from './config';

export async function checkUserSubscription() {
  const { userId } = await auth();

  if (!userId) {
    return {
      hasAccess: false,
      isWhitelisted: false,
      needsSubscription: true,
      user: null,
    };
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  // Check if whitelisted (unlimited access)
  if (isWhitelistedUser(userId, email)) {
    return {
      hasAccess: true,
      isWhitelisted: true,
      needsSubscription: false,
      user: clerkUser,
      aiCredits: 999, // Unlimited
    };
  }

  // Check if test user (testing mode with real plan limits)
  if (isTestUser(email)) {
    const testPlan = getTestUserPlan(email);
    return {
      hasAccess: true,
      isWhitelisted: false,
      isTestUser: true,
      needsSubscription: false,
      user: clerkUser,
      planType: testPlan,
      subscriptionStatus: 'active',
      aiCredits: getAICreditsForPlan(testPlan || 'basic'),
    };
  }

  // For everyone else, check subscription in database
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('subscription_status, subscription_plan_type')
    .eq('clerk_user_id', userId)
    .single();

  const hasActiveSubscription = user?.subscription_status === 'active' || user?.subscription_status === 'trialing';

  return {
    hasAccess: hasActiveSubscription,
    isWhitelisted: false,
    needsSubscription: !hasActiveSubscription,
    user: clerkUser,
    planType: hasActiveSubscription ? (user?.subscription_plan_type || 'basic') : null,
    subscriptionStatus: user?.subscription_status || 'inactive',
  };
}
