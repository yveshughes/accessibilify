import { NextResponse } from 'next/server'
import { RekognitionClient } from '@aws-sdk/client-rekognition'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

// Initialize AWS clients
// Rekognition client ready for future use
new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET() {
  try {
    // Test S3 connection by listing buckets
    const s3Command = new ListBucketsCommand({})
    const s3Response = await s3Client.send(s3Command)

    // Rekognition client initialized and ready

    return NextResponse.json({
      success: true,
      message: 'AWS connection successful',
      s3Bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      buckets: s3Response.Buckets?.map(b => b.Name) || [],
      rekognitionReady: true,
    })
  } catch (error) {
    console.error('AWS connection test failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'AWS connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: error instanceof Error ? error.name : 'Unknown',
      },
      { status: 500 }
    )
  }
}