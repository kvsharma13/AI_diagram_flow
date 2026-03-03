// Whitelisted users (full access, no payment required)
// Add user IDs or emails here for testing/admin access
export const WHITELISTED_USERS: string[] = [
  // 'user_xxx' // Example: add test user IDs here
];

// Test users - can manually set plan type for testing without payment
// Change testPlan to 'pro' when you want to test Pro features
export const TEST_USERS: Record<string, { email: string; testPlan: 'basic' | 'pro' }> = {
  'kavindrash12@gmail.com': {
    email: 'kavindrash12@gmail.com',
    testPlan: 'basic', // Change to 'pro' to test Pro plan
  },
};

// Pricing tiers
export const PRICING_PLANS = {
  BASIC: {
    name: 'Basic Plan',
    price: 900,
    priceDisplay: '₹900',
    aiCredits: 5,
    razorpayPlanId: 'plan_basic_900', // You'll create this in Razorpay
  },
  PRO: {
    name: 'Pro Plan',
    price: 2000,
    priceDisplay: '₹2,000',
    aiCredits: 10,
    razorpayPlanId: 'plan_pro_2000', // You'll create this in Razorpay
  },
};

// Check if user is whitelisted (full access)
export function isWhitelistedUser(userId: string, email?: string): boolean {
  return WHITELISTED_USERS.includes(userId) ||
         (email ? WHITELISTED_USERS.includes(email) : false);
}

// Check if user is a test user
export function isTestUser(email?: string): boolean {
  return email ? email in TEST_USERS : false;
}

// Get test user plan
export function getTestUserPlan(email?: string): 'basic' | 'pro' | null {
  return email && TEST_USERS[email] ? TEST_USERS[email].testPlan : null;
}

// Get AI credits based on plan
export function getAICreditsForPlan(planType: string): number {
  if (planType === 'pro' || planType === 'PRO') {
    return PRICING_PLANS.PRO.aiCredits;
  }
  return PRICING_PLANS.BASIC.aiCredits;
}
