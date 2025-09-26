import { NextResponse } from 'next/server'
import { initializeSchema } from '@/lib/snowflake'

export async function POST() {
  try {
    await initializeSchema()
    return NextResponse.json({
      success: true,
      message: 'Snowflake schema initialized successfully'
    })
  } catch (error) {
    console.error('Failed to initialize Snowflake schema:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize Snowflake schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}