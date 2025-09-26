import snowflake from 'snowflake-sdk'

// Snowflake connection configuration
const connectionOptions = {
  account: process.env.SNOWFLAKE_ACCOUNT || '',
  username: process.env.SNOWFLAKE_USERNAME || '',
  password: process.env.SNOWFLAKE_PASSWORD || '',
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'ACCESSIBILIFY_WH',
  database: process.env.SNOWFLAKE_DATABASE || 'ACCESSIBILIFY',
  schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
  role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN'
}

// Create connection pool
export const getConnection = () => {
  return new Promise<snowflake.Connection>((resolve, reject) => {
    const connection = snowflake.createConnection(connectionOptions)

    connection.connect((err, conn) => {
      if (err) {
        console.error('Unable to connect to Snowflake:', err)
        reject(err)
      } else {
        console.log('Successfully connected to Snowflake')
        resolve(conn)
      }
    })
  })
}

// Execute query helper
export const executeQuery = async (query: string, binds?: any[]): Promise<any[]> => {
  const connection = await getConnection()

  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: query,
      binds: binds || [],
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to execute query:', err)
          reject(err)
        } else {
          resolve(rows || [])
        }
        connection.destroy(() => {})
      }
    })
  })
}

// Analysis data structure
export interface AnalysisData {
  analysisId: string
  videoId: string
  title: string
  duration: number
  scores: {
    mobility: number
    vision: number
    hearing: number
    cognition: number
    total: number
  }
}

// Marker data structure
export interface MarkerData {
  analysisId: string
  markerId: string
  type: string
  tsStartMs: number
  tsEndMs: number
  confidence: number
  bbox?: number[]
  text?: string[]
  notes?: string
}

// Recommendation data structure
export interface RecommendationData {
  analysisId: string
  recId: string
  title: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  policy: string
  rationale: string
}

// Store analysis results
export const storeAnalysis = async (data: AnalysisData) => {
  const query = `
    INSERT INTO ANALYSES (
      ANALYSIS_ID, VIDEO_ID, TITLE, DURATION_S,
      MOBILITY, VISION, HEARING, COGNITION, TOTAL
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const binds = [
    data.analysisId,
    data.videoId,
    data.title,
    data.duration,
    data.scores.mobility,
    data.scores.vision,
    data.scores.hearing,
    data.scores.cognition,
    data.scores.total
  ]

  return executeQuery(query, binds)
}

// Store markers
export const storeMarkers = async (markers: MarkerData[]) => {
  if (markers.length === 0) return

  const values = markers.map(m =>
    `('${m.analysisId}', '${m.markerId}', '${m.type}', ${m.tsStartMs}, ${m.tsEndMs},
      ${m.confidence}, ${m.bbox ? `PARSE_JSON('${JSON.stringify(m.bbox)}')` : 'NULL'},
      ${m.text ? `PARSE_JSON('${JSON.stringify(m.text)}')` : 'NULL'},
      ${m.notes ? `'${m.notes}'` : 'NULL'})`
  ).join(',')

  const query = `
    INSERT INTO MARKERS (
      ANALYSIS_ID, MARKER_ID, TYPE, TS_START_MS, TS_END_MS,
      CONFIDENCE, BBOX, TEXT, NOTES
    ) VALUES ${values}
  `

  return executeQuery(query)
}

// Store recommendations
export const storeRecommendations = async (recommendations: RecommendationData[]) => {
  if (recommendations.length === 0) return

  const values = recommendations.map(r =>
    `('${r.analysisId}', '${r.recId}', '${r.title}', '${r.impact}',
      '${r.effort}', '${r.policy}', '${r.rationale}')`
  ).join(',')

  const query = `
    INSERT INTO RECOMMENDATIONS (
      ANALYSIS_ID, REC_ID, TITLE, IMPACT, EFFORT, POLICY, RATIONALE
    ) VALUES ${values}
  `

  return executeQuery(query)
}

// Get analysis summary
export const getAnalysisSummary = async (analysisId: string) => {
  const query = `
    SELECT
      a.*,
      COUNT(DISTINCT m.MARKER_ID) as marker_count,
      COUNT(DISTINCT r.REC_ID) as recommendation_count
    FROM ANALYSES a
    LEFT JOIN MARKERS m ON a.ANALYSIS_ID = m.ANALYSIS_ID
    LEFT JOIN RECOMMENDATIONS r ON a.ANALYSIS_ID = r.ANALYSIS_ID
    WHERE a.ANALYSIS_ID = ?
    GROUP BY a.ANALYSIS_ID, a.VIDEO_ID, a.TITLE, a.DURATION_S,
             a.MOBILITY, a.VISION, a.HEARING, a.COGNITION, a.TOTAL, a.CREATED_AT
  `

  return executeQuery(query, [analysisId])
}

// Initialize database schema
export const initializeSchema = async () => {
  const queries = [
    `CREATE WAREHOUSE IF NOT EXISTS ACCESSIBILIFY_WH
     WITH WAREHOUSE_SIZE = 'XSMALL'
     AUTO_SUSPEND = 60
     AUTO_RESUME = TRUE`,

    `CREATE DATABASE IF NOT EXISTS ACCESSIBILIFY`,

    `USE DATABASE ACCESSIBILIFY`,

    `CREATE SCHEMA IF NOT EXISTS PUBLIC`,

    `USE SCHEMA PUBLIC`,

    `CREATE TABLE IF NOT EXISTS ANALYSES (
      ANALYSIS_ID   STRING,
      VIDEO_ID      STRING,
      TITLE         STRING,
      DURATION_S    NUMBER,
      MOBILITY      NUMBER,
      VISION        NUMBER,
      HEARING       NUMBER,
      COGNITION     NUMBER,
      TOTAL         NUMBER,
      CREATED_AT    TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
    )`,

    `CREATE TABLE IF NOT EXISTS MARKERS (
      ANALYSIS_ID   STRING,
      MARKER_ID     STRING,
      TYPE          STRING,
      TS_START_MS   NUMBER,
      TS_END_MS     NUMBER,
      CONFIDENCE    FLOAT,
      BBOX          VARIANT,
      TEXT          VARIANT,
      NOTES         STRING
    )`,

    `CREATE TABLE IF NOT EXISTS RECOMMENDATIONS (
      ANALYSIS_ID   STRING,
      REC_ID        STRING,
      TITLE         STRING,
      IMPACT        STRING,
      EFFORT        STRING,
      POLICY        STRING,
      RATIONALE     STRING
    )`
  ]

  for (const query of queries) {
    try {
      await executeQuery(query)
      console.log('Executed:', query.substring(0, 50) + '...')
    } catch (error) {
      console.error('Failed to execute schema query:', error)
    }
  }
}