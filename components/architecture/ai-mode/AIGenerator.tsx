'use client';

import { useState } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import { generateArchitectureWithAI } from '@/lib/architecture/aiArchitectureGenerator';
import { Sparkles, Loader2, ArrowRight, Layers, Cloud } from 'lucide-react';

const examplePrompts = [
  'Create architecture for AI calling agent using LiveKit, PostgreSQL, Redis, and OpenAI',
  'Design an e-commerce platform with microservices for products, orders, and payments',
  'Build a social media app with real-time messaging using WebSockets and PostgreSQL',
  'Create a video streaming service with CDN, transcoding, and analytics',
];

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const { setNodes, setEdges, setLayers, setMode } = useArchitectureStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setGenerated(false);

    try {
      const result = await generateArchitectureWithAI({
        description: prompt,
        mode: 'application',
      });

      setNodes(result.nodes);
      setEdges(result.edges);
      setLayers(result.layers);
      setGenerated(true);
    } catch (error) {
      console.error('Failed to generate architecture:', error);
      alert('Failed to generate architecture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchToApplicationMode = () => {
    setMode('application');
  };

  const switchToInfrastructureMode = () => {
    setMode('infrastructure');
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-blue-500" />
            <h1 className="text-4xl font-bold text-white">AI Architecture Generator</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Describe your architecture and let AI generate it for you
          </p>
        </div>

        {/* Prompt Input */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
          <label className="text-white font-semibold block">
            Describe your architecture:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create architecture for AI calling agent using LiveKit, PostgreSQL, Redis, and OpenAI"
            className="w-full h-32 bg-gray-900 text-white border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={loading}
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

        {/* Success State */}
        {generated && !loading && (
          <div className="bg-green-900/20 border border-green-600 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-400" />
              <h3 className="text-green-400 font-bold text-lg">Architecture Generated!</h3>
            </div>
            <p className="text-gray-300">
              Your architecture has been generated successfully. Choose a view to explore it:
            </p>
            <div className="flex gap-3">
              <button
                onClick={switchToApplicationMode}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <Layers className="w-5 h-5" />
                View in Application Mode
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={switchToInfrastructureMode}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <Cloud className="w-5 h-5" />
                View in Infrastructure Mode
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">
            💡 <strong className="text-white">Tip:</strong> Be specific about the technologies, services, and
            connections you want in your architecture for best results.
          </p>
        </div>
      </div>
    </div>
  );
}
