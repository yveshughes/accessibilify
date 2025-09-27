'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface AnalysisData {
  ANALYSIS_ID: string
  VIDEO_ID: string
  TITLE: string
  DURATION_S: number
  MOBILITY: number
  VISION: number
  HEARING: number
  COGNITION: number
  TOTAL: number
  CREATED_AT: string
  MARKER_COUNT?: number
  RECOMMENDATION_COUNT?: number
}

interface ViolationData {
  TYPE: string
  COUNT: number
  AVG_CONFIDENCE: number
  VIDEOS_AFFECTED: number
}

interface RecommendationData {
  TITLE: string
  IMPACT: string
  EFFORT: string
  ESTIMATED_COST: number
  RISK_MITIGATION_VALUE: number
  NET_BENEFIT: number
  ROI_PERCENTAGE: number
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([])
  const [violations, setViolations] = useState<ViolationData[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalViolations: 0,
    avgCompliance: 0,
    highPriorityFixes: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch from Snowflake API
      const response = await fetch('/api/snowflake/dashboard')
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses || [])
        setViolations(data.violations || [])
        setRecommendations(data.recommendations || [])
        setStats(data.stats || {
          totalBuildings: 0,
          totalViolations: 0,
          avgCompliance: 0,
          highPriorityFixes: 0
        })
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const getComplianceColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceBg = (score: number) => {
    if (score >= 85) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/icon-bw.svg" alt="Logo" width={40} height={40} />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">ADA Compliance Dashboard</h1>
                <p className="text-sm text-slate-600">Real-time analysis from Snowflake</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Total Buildings</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalBuildings}</div>
              <div className="text-xs text-slate-500 mt-1">Analyzed locations</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Violations Found</span>
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalViolations}</div>
              <div className="text-xs text-slate-500 mt-1">ADA violations detected</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Avg Compliance</span>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`text-3xl font-bold ${getComplianceColor(stats.avgCompliance)}`}>
                {stats.avgCompliance}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Overall score</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">High Priority</span>
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.highPriorityFixes}</div>
              <div className="text-xs text-slate-500 mt-1">Urgent fixes needed</div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Analyses</h2>
              <div className="space-y-3">
                {analyses.slice(0, 5).map((analysis) => (
                  <div key={analysis.ANALYSIS_ID} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{analysis.TITLE}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {new Date(analysis.CREATED_AT).toLocaleDateString()} • {analysis.DURATION_S}s video
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceBg(analysis.TOTAL)} ${getComplianceColor(analysis.TOTAL)}`}>
                        {analysis.TOTAL}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Violations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Common Violations</h2>
              <div className="space-y-3">
                {violations.slice(0, 5).map((violation, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">
                          {violation.TYPE.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs text-slate-500">{violation.COUNT} instances</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                          style={{ width: `${(violation.COUNT / violations[0].COUNT) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROI Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Cost-Benefit Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Improvement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Impact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Risk Avoided
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recommendations.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{rec.TITLE}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          rec.IMPACT === 'high' ? 'bg-red-100 text-red-800' :
                          rec.IMPACT === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.IMPACT}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        ${rec.ESTIMATED_COST.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        ${rec.RISK_MITIGATION_VALUE.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-green-600">
                          {rec.ROI_PERCENTAGE.toLocaleString()}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Snowflake Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <span className="text-sm font-medium text-slate-600">Powered by Snowflake</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}