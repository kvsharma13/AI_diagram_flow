'use client';

import { useState, useEffect } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import { generateArchitecture } from '@/lib/architecture/aiArchitectureClient';
import { Sparkles, Loader2, Cloud } from 'lucide-react';
import Link from 'next/link';

const examplePrompts = [
  'AI calling agent platform using LiveKit, a Node API gateway, campaign and call microservices, PostgreSQL, Redis, and OpenAI',
  'E-commerce platform with web and mobile clients, API gateway, product/order/payment microservices, PostgreSQL, Redis cache, and Stripe',
  'Real-time chat app with WebSocket gateway, message service, presence service, PostgreSQL, Redis, and push notifications',
  'Video streaming service with CDN, upload service, transcoding workers on a queue, S3 storage, metadata DB, and analytics',
];

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const [error, setError] = useState('');
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const { setNodes, setEdges, setLayers, setMode } = useArchitectureStore();

  useEffect(() => {
    fetchAIUsage();
  }, []);

  const fetchAIUsage = async () => {
    try {
      const response = await fetch('/api/ai-usage');
      if (response.ok) {
        const data = await response.json();
        setAiUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI usage:', err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }
    if (aiUsage && aiUsage.remaining <= 0) {
      setError(`AI generation limit reached (${aiUsage.limit}/${aiUsage.limit}). Upgrade your plan or wait until next month.`);
      return;
    }

    setLoading(true);
    setError('');
    setNeedsSubscription(false);

    try {
      const result = await generateArchitecture(prompt);

      if (!result.nodes.length) {
        setError('The model returned an empty diagram. Try rephrasing with the specific services you want.');
        return;
      }

      // Groups are modelled as nodes; clear any stale layer list.
      setLayers([]);
      setNodes(result.nodes);
      setEdges(result.edges);

      await fetchAIUsage();

      // Drop straight into the editor to view / refine the diagram.
      setMode('infrastructure');
    } catch (err) {
      console.error('Failed to generate architecture:', err);
      const e = err as Error & { needsSubscription?: boolean };
      if (e?.needsSubscription) {
        setNeedsSubscription(true);
        setError('An active subscription is required to use AI generation.');
      } else {
        setError(e?.message || 'Failed to generate architecture. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-3xl w-full space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-11 h-11 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">AI Architecture Generator</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Describe your system and AI will generate a clean, editable architecture diagram.
          </p>
        </div>

        {/* AI Usage Display */}
        {aiUsage && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">AI Generations</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  {aiUsage.remaining}/{aiUsage.limit}
                </div>
                <div className="text-xs text-gray-400">remaining this month</div>
              </div>
            </div>
            {aiUsage.remaining === 0 && (
              <p className="text-xs text-red-400 mt-2">
                ⚠️ Limit reached. Upgrade your plan or wait until next month.
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center justify-between gap-4">
            <p className="text-red-200 text-sm">{error}</p>
            {needsSubscription && (
              <Link
                href="/dashboard/subscription"
                className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
              >
                Subscribe
              </Link>
            )}
          </div>
        )}

        {/* Prompt Input */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
          <label className="text-white font-semibold block">
            Describe your architecture:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: AI calling agent using LiveKit, a Node API gateway, PostgreSQL, Redis, and OpenAI"
            className="w-full h-32 bg-gray-900 text-white border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Architecture...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Architecture
              </>
            )}
          </button>
          <p className="text-gray-500 text-xs text-center">Tip: press ⌘/Ctrl + Enter to generate</p>
        </div>

        {/* Example Prompts */}
        <div className="space-y-3">
          <p className="text-gray-400 text-sm font-semibold">Example prompts:</p>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-3 rounded-lg transition-colors text-sm border border-gray-700"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-start gap-2">
          <Cloud className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-gray-400 text-sm">
            <strong className="text-white">Tip:</strong> name the specific technologies (PostgreSQL, Redis,
            Kafka, S3, Stripe…) so each gets its real brand icon. After generating, you land in the
            <strong className="text-white"> Editor</strong> to drag, connect and tweak nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
