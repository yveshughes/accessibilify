// Mock Snowflake implementation for development/testing
// This will store data in memory temporarily until Snowflake connection is resolved

interface AnalysisData {
  videoId?: string
  title?: string
  duration?: number
  scores?: {
    mobility?: number
    vision?: number
    hearing?: number
    cognition?: number
    total?: number
  }
  issues?: Array<{
    type: string
    title?: string
    description?: string
  }>
  markers?: Array<{
    type: string
    timestamp?: number
    tsStartMs?: number
    tsEndMs?: number
    confidence?: number
    boundingBox?: {
      Left?: number
      Top?: number
      Width?: number
      Height?: number
    }
    text?: string
    notes?: string
    description?: string
  }>
}

interface StoredAnalysis {
  analysisId: string
  data: AnalysisData
  timestamp: Date
}

const mockStorage: StoredAnalysis[] = []

export const mockStoreAnalysis = async (data: AnalysisData) => {
  const analysisId = Math.random().toString(36).substring(7)

  mockStorage.push({
    analysisId,
    data,
    timestamp: new Date()
  })

  console.log('📊 Mock Snowflake: Analysis stored with ID:', analysisId)
  console.log('Data would be sent to Snowflake:', {
    videoId: data.videoId,
    scores: data.scores,
    issueCount: data.issues?.length || 0
  })

  return { analysisId, success: true }
}

export const getMockAnalysis = (analysisId: string) => {
  const analysis = mockStorage.find(a => a.analysisId === analysisId)
  return analysis?.data || null
}

export const getAllMockAnalyses = () => {
  return mockStorage.map(a => ({
    analysisId: a.analysisId,
    timestamp: a.timestamp,
    title: a.data.title,
    scores: a.data.scores
  }))
}