import { NextResponse } from 'next/server';
import { checkUserSubscription } from '@/lib/checkSubscription';

export async function GET() {
  try {
    const subscriptionStatus = await checkUserSubscription();
    return NextResponse.json(subscriptionStatus);
  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
