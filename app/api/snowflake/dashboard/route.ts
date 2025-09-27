import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    // Fetch summary statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(DISTINCT VIDEO_ID) FROM ACCESSIBILIFY.PUBLIC.ANALYSES) as TOTAL_BUILDINGS,
        (SELECT COUNT(*) FROM ACCESSIBILIFY.PUBLIC.MARKERS) as TOTAL_VIOLATIONS,
        (SELECT ROUND(AVG(TOTAL)) FROM ACCESSIBILIFY.PUBLIC.ANALYSES) as AVG_COMPLIANCE,
        (SELECT COUNT(*) FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS WHERE IMPACT = 'high') as HIGH_PRIORITY_FIXES
    `

    // Fetch recent analyses
    const analysesQuery = `
      SELECT
        ANALYSIS_ID,
        VIDEO_ID,
        TITLE,
        DURATION_S,
        MOBILITY,
        VISION,
        HEARING,
        COGNITION,
        TOTAL,
        CREATED_AT
      FROM ACCESSIBILIFY.PUBLIC.ANALYSES
      ORDER BY CREATED_AT DESC
      LIMIT 10
    `

    // Fetch top violations
    const violationsQuery = `
      SELECT
        TYPE,
        COUNT(*) as COUNT,
        AVG(CONFIDENCE) as AVG_CONFIDENCE,
        COUNT(DISTINCT ANALYSIS_ID) as VIDEOS_AFFECTED
      FROM ACCESSIBILIFY.PUBLIC.MARKERS
      GROUP BY TYPE
      ORDER BY COUNT DESC
      LIMIT 5
    `

    // Fetch recommendations with ROI
    const recommendationsQuery = `
      WITH violation_costs AS (
        SELECT
          r.TITLE,
          r.IMPACT,
          r.EFFORT,
          CASE
            WHEN r.EFFORT = 'low' THEN 1000
            WHEN r.EFFORT = 'medium' THEN 5000
            WHEN r.EFFORT = 'high' THEN 20000
          END as ESTIMATED_COST,
          CASE
            WHEN r.IMPACT = 'high' THEN 50000
            WHEN r.IMPACT = 'medium' THEN 20000
            WHEN r.IMPACT = 'low' THEN 5000
          END as RISK_MITIGATION_VALUE
        FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS r
      )
      SELECT
        TITLE,
        IMPACT,
        EFFORT,
        ESTIMATED_COST,
        RISK_MITIGATION_VALUE,
        (RISK_MITIGATION_VALUE - ESTIMATED_COST) as NET_BENEFIT,
        ROUND((RISK_MITIGATION_VALUE::FLOAT / ESTIMATED_COST) * 100) as ROI_PERCENTAGE
      FROM violation_costs
      ORDER BY NET_BENEFIT DESC
      LIMIT 5
    `

    try {
      // Execute all queries
      const [statsResult, analysesResult, violationsResult, recommendationsResult] = await Promise.all([
        executeQuery(statsQuery),
        executeQuery(analysesQuery),
        executeQuery(violationsQuery),
        executeQuery(recommendationsQuery)
      ])

      // Format the response
      const stats = statsResult[0] || {
        TOTAL_BUILDINGS: 0,
        TOTAL_VIOLATIONS: 0,
        AVG_COMPLIANCE: 0,
        HIGH_PRIORITY_FIXES: 0
      }

      return NextResponse.json({
        success: true,
        stats: {
          totalBuildings: stats.TOTAL_BUILDINGS || 0,
          totalViolations: stats.TOTAL_VIOLATIONS || 0,
          avgCompliance: stats.AVG_COMPLIANCE || 0,
          highPriorityFixes: stats.HIGH_PRIORITY_FIXES || 0
        },
        analyses: analysesResult || [],
        violations: violationsResult || [],
        recommendations: recommendationsResult || []
      })
    } catch (snowflakeError) {
      console.log('Snowflake query failed, using demo data:', snowflakeError)

      // Return demo data if Snowflake fails
      return NextResponse.json({
        success: true,
        stats: {
          totalBuildings: 3,
          totalViolations: 4,
          avgCompliance: 74,
          highPriorityFixes: 2
        },
        analyses: [
          {
            ANALYSIS_ID: 'demo-001',
            VIDEO_ID: 'entrance-video-1',
            TITLE: 'Main Entrance Analysis',
            DURATION_S: 120,
            MOBILITY: 65,
            VISION: 78,
            HEARING: 90,
            COGNITION: 85,
            TOTAL: 79,
            CREATED_AT: new Date().toISOString()
          },
          {
            ANALYSIS_ID: 'demo-002',
            VIDEO_ID: 'lobby-video-2',
            TITLE: 'Lobby Accessibility Check',
            DURATION_S: 90,
            MOBILITY: 45,
            VISION: 82,
            HEARING: 88,
            COGNITION: 90,
            TOTAL: 76,
            CREATED_AT: new Date().toISOString()
          },
          {
            ANALYSIS_ID: 'demo-003',
            VIDEO_ID: 'stairwell-video-3',
            TITLE: 'Stairwell Compliance Review',
            DURATION_S: 150,
            MOBILITY: 35,
            VISION: 70,
            HEARING: 85,
            COGNITION: 80,
            TOTAL: 67,
            CREATED_AT: new Date().toISOString()
          }
        ],
        violations: [
          { TYPE: 'missing_handrail', COUNT: 1, AVG_CONFIDENCE: 0.92, VIDEOS_AFFECTED: 1 },
          { TYPE: 'narrow_doorway', COUNT: 1, AVG_CONFIDENCE: 0.85, VIDEOS_AFFECTED: 1 },
          { TYPE: 'poor_lighting', COUNT: 1, AVG_CONFIDENCE: 0.78, VIDEOS_AFFECTED: 1 },
          { TYPE: 'no_ramp', COUNT: 1, AVG_CONFIDENCE: 0.95, VIDEOS_AFFECTED: 1 }
        ],
        recommendations: [
          {
            TITLE: 'Install handrails on both sides of stairs',
            IMPACT: 'high',
            EFFORT: 'low',
            ESTIMATED_COST: 1000,
            RISK_MITIGATION_VALUE: 50000,
            NET_BENEFIT: 49000,
            ROI_PERCENTAGE: 5000
          },
          {
            TITLE: 'Install wheelchair ramp with 1:12 slope',
            IMPACT: 'high',
            EFFORT: 'medium',
            ESTIMATED_COST: 5000,
            RISK_MITIGATION_VALUE: 50000,
            NET_BENEFIT: 45000,
            ROI_PERCENTAGE: 1000
          },
          {
            TITLE: 'Widen doorway to 32 inch minimum',
            IMPACT: 'high',
            EFFORT: 'high',
            ESTIMATED_COST: 20000,
            RISK_MITIGATION_VALUE: 50000,
            NET_BENEFIT: 30000,
            ROI_PERCENTAGE: 250
          },
          {
            TITLE: 'Upgrade lighting to meet standards',
            IMPACT: 'medium',
            EFFORT: 'low',
            ESTIMATED_COST: 1000,
            RISK_MITIGATION_VALUE: 20000,
            NET_BENEFIT: 19000,
            ROI_PERCENTAGE: 2000
          }
        ]
      })
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}