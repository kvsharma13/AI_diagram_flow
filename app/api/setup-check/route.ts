import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const checks: any = {
    supabaseConnected: false,
    tablesExist: false,
    razorpayConfigured: false,
    openaiConfigured: false,
  };

  try {
    // Check Supabase connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (!error) {
      checks.supabaseConnected = true;
      checks.supabaseDetails = 'Connected successfully';
      checks.tablesExist = true;
    } else {
      checks.supabaseDetails = error.message;
    }
  } catch (error) {
    checks.supabaseDetails = 'Failed to connect';
  }

  // Check Razorpay
  checks.razorpayConfigured = !!(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_TEMPORARY'
  );

  // Check OpenAI
  checks.openaiConfigured = !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith('sk-')
  );

  return NextResponse.json(checks);
}
