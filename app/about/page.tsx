'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            About Accessibilify
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transforming ADA compliance from reactive litigation defense to proactive accessibility improvement
            through AI-powered video analysis and data-driven insights.
          </p>
        </div>


        {/* Architecture Diagram */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">How It Works</h2>

          <div className="relative">
            {/* Diagram Container */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              {/* Video Input */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-3 shadow-lg">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div className="font-semibold">Video Upload</div>
                </div>
                <p className="text-sm text-slate-600">Building walkthroughs</p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex items-center justify-center">
                <svg className="w-full h-12 text-slate-300" viewBox="0 0 100 40">
                  <defs>
                    <marker id="arrowhead1" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                      <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
                    </marker>
                  </defs>
                  <line x1="0" y1="20" x2="90" y2="20" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead1)" />
                </svg>
              </div>

              {/* AWS Rekognition */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 mb-3 shadow-lg relative">
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    AI/ML
                  </div>
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="font-semibold">AWS Rekognition</div>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="text-red-600 font-semibold">Non-Deterministic</span><br/>
                  Object & text detection
                </p>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex items-center justify-center">
                <svg className="w-full h-12 text-slate-300" viewBox="0 0 100 40">
                  <defs>
                    <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                      <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
                    </marker>
                  </defs>
                  <line x1="0" y1="20" x2="90" y2="20" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead2)" />
                </svg>
              </div>

              {/* Snowflake */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-6 mb-3 shadow-lg relative">
                  <div className="absolute -top-2 -right-2 bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
                    SQL
                  </div>
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <div className="font-semibold">Snowflake</div>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="text-green-600 font-semibold">Deterministic</span><br/>
                  Data warehouse
                </p>
              </div>
            </div>

            {/* Process Flow Description */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">1. Capture</h4>
                <p className="text-sm text-purple-700">
                  Property managers upload building walkthrough videos
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">2. Analyze</h4>
                <p className="text-sm text-orange-700">
                  AWS Rekognition detects accessibility features and violations
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">3. Store & Report</h4>
                <p className="text-sm text-blue-700">
                  Snowflake stores immutable compliance records for analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Differentiators */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Proactive Protection</h3>
            <p className="text-slate-600">
              Identify and fix violations before they become lawsuits. Average savings: $50,000-$250,000 per prevented lawsuit.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Data-Driven Decisions</h3>
            <p className="text-slate-600">
              ROI calculations for every fix. Know which improvements provide the best return on investment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Complete Audit Trail</h3>
            <p className="text-slate-600">
              Every analysis timestamped and stored. Perfect for demonstrating good-faith compliance efforts.
            </p>
          </div>
        </div>

        {/* ROI Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-10 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-6">The Business Case</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Typical 50-Building Portfolio</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-semibold">1,247 violations detected</div>
                    <div className="text-green-100">Across all properties</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <div className="font-semibold">12-15 lawsuits prevented</div>
                    <div className="text-green-100">Based on industry statistics</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-semibold">$600K - $3.75M saved</div>
                    <div className="text-green-100">In avoided litigation costs</div>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">ROI Breakdown</h3>
              <div className="bg-white/20 backdrop-blur rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Remediation Investment:</span>
                    <span className="font-bold">$125,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Litigation Savings:</span>
                    <span className="font-bold">$600K - $3.75M</span>
                  </div>
                  <div className="h-px bg-white/40 my-2"></div>
                  <div className="flex justify-between text-lg">
                    <span>Net Benefit:</span>
                    <span className="font-bold">$475K - $3.625M</span>
                  </div>
                  <div className="text-center mt-4 text-2xl font-bold">
                    ROI: 380% - 2,900%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to Transform Your ADA Compliance?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join forward-thinking property managers who are turning compliance from a cost center into a competitive advantage.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/demo"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              Watch Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl border-2 border-blue-600"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-slate-500">
          <p>
            Built with AWS Rekognition for AI analysis and Snowflake for deterministic data warehousing.
          </p>
          <p className="mt-2">
            © 2025 Accessibilify. Proactive ADA Compliance Through Intelligence.
          </p>
        </div>
      </div>
    </div>
  )
}