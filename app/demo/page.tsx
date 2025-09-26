'use client'

import { useState } from 'react'
import { VideoPlayerWithAnalysis } from '@/components/VideoPlayerWithAnalysis'

interface Issue {
  type: string
  title: string
  description: string
  timestamp: number
  confidence: number
  adaReference?: string
  boundingBox?: {
    Width?: number
    Height?: number
    Left?: number
    Top?: number
  }
}

export default function DemoPage() {
  const [detectedIssues, setDetectedIssues] = useState<Issue[]>([])

  const handleAnalysisUpdate = (newIssues: Issue[]) => {
    setDetectedIssues(prev => {
      // Add new issues and keep only the last 50 to avoid memory issues
      const updated = [...prev, ...newIssues]
      return updated.slice(-50)
    })
  }

  const handleTimeUpdate = (time: number) => {
    // Time update handled by VideoPlayerWithAnalysis
    console.log('Current time:', time)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Live ADA Compliance Analysis Demo
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Watch our AI analyze a building entrance in real-time, detecting potential ADA violations
            and accessibility concerns with bounding boxes and confidence scores.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content - Full Width on Mobile, 2/3 on Desktop */}
          <div className="lg:col-span-2">

            {/* Video Player */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <VideoPlayerWithAnalysis
                src="/video/enter_building.mp4"
                onTimeUpdate={handleTimeUpdate}
                onAnalysisUpdate={handleAnalysisUpdate}
              />
            </div>

            {/* Key Features */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Real-Time Detection</h3>
                </div>
                <p className="text-sm text-slate-600">
                  AWS Rekognition analyzes video frames every 2 seconds
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">ADA Violations</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Identifies doorway width, handrails, ramps, and signage issues
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Policy Citations</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Each issue includes specific ADA policy references
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Detected Issues
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-600">Live</span>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {detectedIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Waiting for analysis...
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Issues will appear as they&apos;re detected
                    </p>
                  </div>
                ) : (
                  <>
                    {detectedIssues.slice().reverse().map((issue, index) => (
                      <div
                        key={`${issue.timestamp}-${index}`}
                        className={`p-3 rounded-lg border transition-all ${
                          issue.type === 'success'
                            ? 'bg-green-50 border-green-200'
                            : issue.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : issue.type === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                        } ${index === 0 ? 'animate-slideIn' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              issue.type === 'success'
                                ? 'text-green-900'
                                : issue.type === 'warning'
                                ? 'text-yellow-900'
                                : issue.type === 'error'
                                ? 'text-red-900'
                                : 'text-blue-900'
                            }`}>
                              {issue.title}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              issue.type === 'success'
                                ? 'text-green-700'
                                : issue.type === 'warning'
                                ? 'text-yellow-700'
                                : issue.type === 'error'
                                ? 'text-red-700'
                                : 'text-blue-700'
                            }`}>
                              {issue.description}
                            </p>
                            {issue.adaReference && (
                              <span className="inline-block mt-2 px-2 py-1 bg-white/50 rounded text-xs font-medium">
                                {issue.adaReference}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 ml-2">
                            {issue.timestamp.toFixed(1)}s
                          </div>
                        </div>
                        {issue.confidence && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-white/30 rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full ${
                                  issue.type === 'success'
                                    ? 'bg-green-500'
                                    : issue.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : issue.type === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${issue.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {issue.confidence.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {detectedIssues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {detectedIssues.filter(i => i.type === 'error').length}
                      </div>
                      <div className="text-xs text-slate-600">Violations</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {detectedIssues.filter(i => i.type === 'warning').length}
                      </div>
                      <div className="text-xs text-slate-600">Warnings</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {detectedIssues.filter(i => i.type === 'success').length}
                      </div>
                      <div className="text-xs text-slate-600">Compliant</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What to Look For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Common ADA Violations</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Door openings less than 32&quot; clear width</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Missing handrails on stairs or ramps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Ramp slopes exceeding 1:12 ratio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Insufficient lighting or contrast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Missing tactile indicators</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">AI Detection Capabilities</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Identifies doors, stairs, and ramps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Detects handrails and grab bars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Recognizes signage and wayfinding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Spots wheelchairs and mobility aids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Analyzes lighting conditions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}