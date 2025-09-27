'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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

interface ComplianceScores {
  mobility: number
  vision: number
  hearing: number
  cognition: number
  total: number
}

function DemoContent() {
  const searchParams = useSearchParams()
  const [detectedIssues, setDetectedIssues] = useState<Issue[]>([])

  // Get video from URL parameter or default
  const videoParam = searchParams.get('video')
  const initialVideo = videoParam === 'sample_1' ? '/video/sample_1.mp4' :
                      videoParam === 'sample_2' ? '/video/sample_2.mp4' :
                      '/video/enter_building.mp4'

  const [selectedVideo, setSelectedVideo] = useState(initialVideo)

  useEffect(() => {
    // Update video when URL parameter changes
    const newVideo = videoParam === 'sample_1' ? '/video/sample_1.mp4' :
                    videoParam === 'sample_2' ? '/video/sample_2.mp4' :
                    '/video/enter_building.mp4'
    setSelectedVideo(newVideo)
    setDetectedIssues([]) // Clear previous issues
  }, [videoParam])

  const handleAnalysisUpdate = (newIssues: Issue[]) => {
    setDetectedIssues(prev => {
      // Add new issues and keep the last 100 for more comprehensive tracking
      const updated = [...prev, ...newIssues]
      return updated.slice(-100)
    })
  }

  const handleTimeUpdate = (time: number) => {
    // Time update handled by VideoPlayerWithAnalysis
    console.log('Current time:', time)
  }


  // Calculate real-time compliance scores based on detected issues
  const complianceScores = useMemo((): ComplianceScores => {
    if (detectedIssues.length === 0) {
      return { mobility: 100, vision: 100, hearing: 100, cognition: 100, total: 100 }
    }

    // Base scores start at 100
    let mobilityScore = 100
    let visionScore = 100
    let hearingScore = 100
    let cognitionScore = 100

    detectedIssues.forEach(issue => {
      // Positive features increase scores
      if (issue.type === 'success') {

        // Boost relevant category based on feature type
        if (issue.title.toLowerCase().includes('handrail') ||
            issue.title.toLowerCase().includes('ramp') ||
            issue.title.toLowerCase().includes('wheelchair')) {
          mobilityScore = Math.min(100, mobilityScore + 2)
        }
        if (issue.title.toLowerCase().includes('braille') ||
            issue.title.toLowerCase().includes('contrast') ||
            issue.title.toLowerCase().includes('lighting')) {
          visionScore = Math.min(100, visionScore + 2)
        }
        if (issue.title.toLowerCase().includes('visual alarm') ||
            issue.title.toLowerCase().includes('hearing loop')) {
          hearingScore = Math.min(100, hearingScore + 2)
        }
        if (issue.title.toLowerCase().includes('signage') ||
            issue.title.toLowerCase().includes('wayfinding')) {
          cognitionScore = Math.min(100, cognitionScore + 2)
        }
      }
      // Violations decrease scores
      else if (issue.type === 'error') {
        // Categorize violations
        if (issue.title.toLowerCase().includes('door') ||
            issue.title.toLowerCase().includes('ramp') ||
            issue.title.toLowerCase().includes('handrail') ||
            issue.title.toLowerCase().includes('wheelchair') ||
            issue.title.toLowerCase().includes('step')) {
          mobilityScore = Math.max(0, mobilityScore - 8)
        }
        if (issue.title.toLowerCase().includes('lighting') ||
            issue.title.toLowerCase().includes('contrast') ||
            issue.title.toLowerCase().includes('visibility') ||
            issue.title.toLowerCase().includes('braille')) {
          visionScore = Math.max(0, visionScore - 8)
        }
        if (issue.title.toLowerCase().includes('alarm') ||
            issue.title.toLowerCase().includes('audio')) {
          hearingScore = Math.max(0, hearingScore - 8)
        }
        if (issue.title.toLowerCase().includes('signage') ||
            issue.title.toLowerCase().includes('wayfinding') ||
            issue.title.toLowerCase().includes('confusing')) {
          cognitionScore = Math.max(0, cognitionScore - 8)
        }
      }
      // Warnings have moderate impact
      else if (issue.type === 'warning') {
        if (issue.title.toLowerCase().includes('door') ||
            issue.title.toLowerCase().includes('ramp') ||
            issue.title.toLowerCase().includes('handrail')) {
          mobilityScore = Math.max(0, mobilityScore - 3)
        }
        if (issue.title.toLowerCase().includes('lighting') ||
            issue.title.toLowerCase().includes('contrast')) {
          visionScore = Math.max(0, visionScore - 3)
        }
        if (issue.title.toLowerCase().includes('signage')) {
          cognitionScore = Math.max(0, cognitionScore - 3)
        }
      }
    })

    // Apply confidence weighting - higher confidence issues have more impact
    const avgConfidence = detectedIssues.reduce((sum, issue) => sum + issue.confidence, 0) / detectedIssues.length
    const confidenceFactor = avgConfidence / 100

    // Calculate weighted total score
    const weights = {
      mobility: 0.35,    // 35% weight - most critical for physical access
      vision: 0.25,      // 25% weight
      hearing: 0.15,     // 15% weight
      cognition: 0.25    // 25% weight - important for navigation
    }

    const totalScore = Math.round(
      (mobilityScore * weights.mobility +
       visionScore * weights.vision +
       hearingScore * weights.hearing +
       cognitionScore * weights.cognition) * confidenceFactor
    )

    return {
      mobility: Math.round(mobilityScore),
      vision: Math.round(visionScore),
      hearing: Math.round(hearingScore),
      cognition: Math.round(cognitionScore),
      total: Math.max(0, Math.min(100, totalScore))
    }
  }, [detectedIssues])

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
                key={selectedVideo} // Force remount on video change
                src={selectedVideo}
                onTimeUpdate={handleTimeUpdate}
                onAnalysisUpdate={handleAnalysisUpdate}
              />
            </div>

            {/* Live Compliance Score Card */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Live Compliance Score</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-600">Real-time Calculation</span>
                </div>
              </div>

              {/* Total Score Display */}
              <div className="text-center mb-6">
                <div className={`text-5xl font-bold mb-2 ${
                  complianceScores.total >= 85 ? 'text-green-600' :
                  complianceScores.total >= 70 ? 'text-yellow-600' :
                  complianceScores.total >= 55 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {complianceScores.total}%
                </div>
                <div className="text-sm text-slate-600">Overall ADA Compliance</div>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Mobility</div>
                  <div className={`text-2xl font-bold ${
                    complianceScores.mobility >= 80 ? 'text-green-600' :
                    complianceScores.mobility >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {complianceScores.mobility}%
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        complianceScores.mobility >= 80 ? 'bg-green-500' :
                        complianceScores.mobility >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${complianceScores.mobility}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Vision</div>
                  <div className={`text-2xl font-bold ${
                    complianceScores.vision >= 80 ? 'text-green-600' :
                    complianceScores.vision >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {complianceScores.vision}%
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        complianceScores.vision >= 80 ? 'bg-green-500' :
                        complianceScores.vision >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${complianceScores.vision}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Hearing</div>
                  <div className={`text-2xl font-bold ${
                    complianceScores.hearing >= 80 ? 'text-green-600' :
                    complianceScores.hearing >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {complianceScores.hearing}%
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        complianceScores.hearing >= 80 ? 'bg-green-500' :
                        complianceScores.hearing >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${complianceScores.hearing}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">Cognition</div>
                  <div className={`text-2xl font-bold ${
                    complianceScores.cognition >= 80 ? 'text-green-600' :
                    complianceScores.cognition >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {complianceScores.cognition}%
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        complianceScores.cognition >= 80 ? 'bg-green-500' :
                        complianceScores.cognition >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${complianceScores.cognition}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Score Explanation */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Live Calculation:</strong> Scores update in real-time based on detected features and violations.
                  Higher scores indicate better ADA compliance.
                </p>
              </div>
            </div>

            {/* Compliance Status Dashboard */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Compliant Features</h3>
                </div>
                <p className="text-sm text-slate-600">
                  {detectedIssues.filter(i => i.type === 'success').length} accessibility features detected
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Areas to Review</h3>
                </div>
                <p className="text-sm text-slate-600">
                  {detectedIssues.filter(i => i.type === 'warning').length} potential improvements identified
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Violations Found</h3>
                </div>
                <p className="text-sm text-slate-600">
                  {detectedIssues.filter(i => i.type === 'error').length} ADA violations requiring attention
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

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading demo...</p>
        </div>
      </div>
    }>
      <DemoContent />
    </Suspense>
  )
}