'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RACIPage() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription');
      if (response.ok) {
        const data = await response.json();
        setHasSubscription(
          (data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing') ||
          data.isWhitelisted
        );
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
        {/* Subscribe Overlay */}
        {!hasSubscription && !isLoading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="max-w-md p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Subscribe to Use RACI Matrix
              </h2>
              <p className="text-gray-600 mb-8">
                Create professional RACI matrices with AI-powered generation and unlimited editing.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Plans & Subscribe
                </Link>
              </Button>
            </Card>
          </div>
        )}

        {/* Page Content (blurred when not subscribed) */}
        <div className={!hasSubscription ? 'blur-sm pointer-events-none' : ''}>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">RACI Matrix</h1>
            <p className="text-gray-600 mb-8">
              Create and manage RACI matrices for your projects.
            </p>

            {/* Placeholder content */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-2">What is RACI?</h3>
                <p className="text-gray-600">
                  RACI stands for Responsible, Accountable, Consulted, and Informed.
                  It's a responsibility assignment matrix used in project management.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}
