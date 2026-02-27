import Razorpay from 'razorpay';

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  PLAN_AMOUNT: 90000, // ₹900 in paise (Razorpay uses smallest currency unit)
  PLAN_CURRENCY: 'INR',
  PLAN_INTERVAL: 'monthly' as const,
  AI_CREDITS_PER_MONTH: 10,
};
