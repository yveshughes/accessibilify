import { NextRequest, NextResponse } from 'next/server'
import { mockStoreAnalysis, getMockAnalysis } from '@/lib/snowflake-mock'
import { v4 as uuidv4 } from 'uuid'

// Try to use real Snowflake, fallback to mock if it fails
let useRealSnowflake = true
import {
  storeAnalysis,
  storeMarkers,
  storeRecommendations,
  getAnalysisSummary,
  AnalysisData,
  MarkerData,
  RecommendationData
} from '@/lib/snowflake'

// Store analysis results
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const analysisId = uuidv4()

    // Mock storage while Snowflake connection is being resolved
    const result = await mockStoreAnalysis({
      ...data,
      analysisId
    })

    return NextResponse.json({
      success: true,
      analysisId: result.analysisId,
      message: 'Analysis stored successfully (using mock storage temporarily)'
    })

    /* Original Snowflake code - to be restored once connection is fixed
    // Extract and store main analysis
    const analysis: AnalysisData = {
      analysisId,
      videoId: data.videoId || uuidv4(),
      title: data.title || 'ADA Compliance Analysis',
      duration: data.duration || 0,
      scores: {
        mobility: data.scores?.mobility || 0,
        vision: data.scores?.vision || 0,
        hearing: data.scores?.hearing || 0,
        cognition: data.scores?.cognition || 0,
        total: data.scores?.total || 0
      }
    }

    await storeAnalysis(analysis)

    // Store markers if provided
    if (data.markers && Array.isArray(data.markers)) {
      const markers: MarkerData[] = data.markers.map((m: any) => ({
        analysisId,
        markerId: uuidv4(),
        type: m.type,
        tsStartMs: m.tsStartMs || m.timestamp * 1000,
        tsEndMs: m.tsEndMs || (m.timestamp * 1000) + 1000,
        confidence: m.confidence || 0,
        bbox: m.boundingBox ? [
          m.boundingBox.Left || 0,
          m.boundingBox.Top || 0,
          m.boundingBox.Width || 0,
          m.boundingBox.Height || 0
        ] : undefined,
        text: m.text,
        notes: m.description || m.notes
      }))

      await storeMarkers(markers)
    }

    // Generate and store recommendations based on issues found
    if (data.issues && Array.isArray(data.issues)) {
      const recommendations: RecommendationData[] = []

      const issueTypes = new Set(data.issues.map((i: any) => i.type))

      if (issueTypes.has('error')) {
        recommendations.push({
          analysisId,
          recId: uuidv4(),
          title: 'Address Critical ADA Violations',
          impact: 'high',
          effort: 'medium',
          policy: 'ADA Title III',
          rationale: 'Critical violations detected that may prevent access for individuals with disabilities'
        })
      }

      if (data.issues.some((i: any) => i.title?.includes('Handrail'))) {
        recommendations.push({
          analysisId,
          recId: uuidv4(),
          title: 'Install or Repair Handrails on Stairs',
          impact: 'high',
          effort: 'low',
          policy: 'ADA 505.2',
          rationale: 'Handrails are required on both sides of stairs for safety and accessibility'
        })
      }

      if (data.issues.some((i: any) => i.title?.includes('Door Width'))) {
        recommendations.push({
          analysisId,
          recId: uuidv4(),
          title: 'Verify Door Clear Width Compliance',
          impact: 'high',
          effort: 'high',
          policy: 'ADA 404.2.3',
          rationale: 'Doors must have minimum 32" clear width for wheelchair accessibility'
        })
      }

      if (data.issues.some((i: any) => i.title?.includes('Lighting'))) {
        recommendations.push({
          analysisId,
          recId: uuidv4(),
          title: 'Improve Lighting Conditions',
          impact: 'medium',
          effort: 'low',
          policy: 'ANSI A117.1',
          rationale: 'Adequate lighting is essential for navigation and safety'
        })
      }

      if (recommendations.length > 0) {
        await storeRecommendations(recommendations)
      }
    }

    return NextResponse.json({
      success: true,
      analysisId,
      message: 'Analysis stored in Snowflake successfully'
    })
    */
  } catch (error) {
    console.error('Failed to store analysis:', error)
    return NextResponse.json(
      {
        error: 'Failed to store analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get analysis results
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const analysisId = searchParams.get('analysisId')

  if (!analysisId) {
    return NextResponse.json(
      { error: 'Analysis ID required' },
      { status: 400 }
    )
  }

  try {
    // Use mock storage temporarily
    const analysis = getMockAnalysis(analysisId)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Failed to get analysis:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}