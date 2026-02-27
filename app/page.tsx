'use client';

import Link from 'next/link';
import { Calendar, Users, Sparkles, Code, Zap, Shield, TrendingUp, Check, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ProjectFlow AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in?redirect_url=/pricing"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">AI-Powered Project Management</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Plan Projects
          <br />
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            10x Faster with AI
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Create stunning Gantt charts and RACI matrices in seconds with AI.
          Save hours of planning time and focus on what matters.
        </p>

        <div className="flex items-center justify-center gap-4 mb-12">
          <Link
            href="/sign-in?redirect_url=/pricing"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg border-2 border-gray-200"
          >
            View Pricing
          </a>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Two affordable plans</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">4.9/5 rating</span>
          </div>
        </div>

        {/* Demo Screenshot Placeholder */}
        <div className="mt-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-2xl p-8 border-4 border-white">
          <div className="bg-white rounded-xl shadow-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <p className="text-gray-500 font-medium">Interactive Demo Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to manage projects
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Generation</h3>
              <p className="text-gray-600 mb-4">
                Paste your project description and watch AI create professional Gantt charts and RACI matrices instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>5-12 AI generations/month</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Smart phase detection</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Auto role assignment</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Gantt Charts</h3>
              <p className="text-gray-600 mb-4">
                Beautiful, interactive Gantt charts with drag-and-drop editing, templates, and export options.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Drag & drop timeline</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Professional templates</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>PNG/JSON export</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">RACI Matrix</h3>
              <p className="text-gray-600 mb-4">
                Clear responsibility assignments with visual matrix, dual marks, and team collaboration features.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Dual RACI marks (R/A, C/I)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Unlimited stakeholders</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Quick toggle interface</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Code Import</h3>
              <p className="text-gray-600 mb-4">
                Import from JSON code with unlimited imports. Perfect for developers and automation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Unlimited code imports</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Flexible JSON format</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>API integration ready</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl border border-pink-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Auto-Save</h3>
              <p className="text-gray-600 mb-4">
                Never lose your work. All changes automatically saved to cloud with instant sync.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Real-time auto-save</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Cloud backup</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Access anywhere</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600 mb-4">
                Bank-level security with encrypted data storage. Your projects are safe with us.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>SOC 2 compliant</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Regular backups</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl opacity-90">
              All features included. Only AI generation is limited by plan. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border-2 border-white/20 hover:border-white/40 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Basic Plan</h3>
                <div className="text-5xl font-bold mb-2">₹900</div>
                <div className="text-lg opacity-90">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">5 AI generations per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited manual editing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited code imports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Auto-save & cloud storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Export to PNG/JSON</span>
                </li>
              </ul>

              <Link
                href="/sign-in?redirect_url=/pricing"
                className="block text-center bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-10 border-4 border-white/40 hover:border-white/60 transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              </div>

              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                <div className="text-5xl font-bold mb-2">₹2000</div>
                <div className="text-lg opacity-90">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg font-semibold">12 AI generations per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited manual editing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited code imports</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Unlimited projects</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Auto-save & cloud storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg font-semibold">Priority support</span>
                </li>
              </ul>

              <Link
                href="/sign-in?redirect_url=/pricing"
                className="block text-center bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <TrendingUp className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to 10x your project planning?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join hundreds of teams already using ProjectFlow AI
          </p>
          <Link
            href="/sign-in?redirect_url=/pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-xl text-xl font-bold transition-all shadow-2xl hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ProjectFlow AI</span>
          </div>
          <p className="mb-4">© 2025 ProjectFlow AI. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
