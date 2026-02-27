import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase';
import { isWhitelistedUser } from './config';

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

  // Check if whitelisted (you)
  if (isWhitelistedUser(userId, email)) {
    return {
      hasAccess: true,
      isWhitelisted: true,
      needsSubscription: false,
      user: clerkUser,
      aiCredits: 999, // Unlimited for you
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
    planType: user?.subscription_plan_type || 'basic',
  };
}
