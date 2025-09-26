// Mock Snowflake implementation for development/testing
// This will store data in memory temporarily until Snowflake connection is resolved

interface StoredAnalysis {
  analysisId: string
  data: any
  timestamp: Date
}

const mockStorage: StoredAnalysis[] = []

export const mockStoreAnalysis = async (data: any) => {
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