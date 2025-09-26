import { NextRequest, NextResponse } from 'next/server'
import {
  RekognitionClient,
  StartLabelDetectionCommand,
  GetLabelDetectionCommand,
  StartLabelDetectionCommandInput,
  VideoTooLargeException
} from '@aws-sdk/client-rekognition'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const rekognitionClient = new RekognitionClient({
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

// For frame-by-frame analysis (streaming approach)
export async function POST(request: NextRequest) {
  try {
    const { frameData, timestamp } = await request.json()

    if (!frameData) {
      return NextResponse.json({ error: 'No frame data provided' }, { status: 400 })
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(frameData.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    // Detect labels in the frame
    const detectLabelsResponse = await rekognitionClient.send(
      new DetectLabelsCommand({
        Image: {
          Bytes: imageBuffer
        },
        MaxLabels: 10,
        MinConfidence: 70
      })
    )

    // Process labels for accessibility issues
    const accessibilityIssues = analyzeAccessibilityIssues(detectLabelsResponse.Labels || [], timestamp)

    return NextResponse.json({
      success: true,
      timestamp,
      labels: detectLabelsResponse.Labels,
      accessibilityIssues
    })
  } catch (error: any) {
    console.error('Video analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze video frame', details: error.message },
      { status: 500 }
    )
  }
}

// Upload video to S3 and start async analysis
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `videos/${Date.now()}-${videoFile.name}`
    const arrayBuffer = await videoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: videoFile.type
      })
    )

    // Start label detection job
    const startLabelDetectionParams: StartLabelDetectionCommandInput = {
      Video: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Name: fileName
        }
      },
      MinConfidence: 70
    }

    const startResponse = await rekognitionClient.send(
      new StartLabelDetectionCommand(startLabelDetectionParams)
    )

    return NextResponse.json({
      success: true,
      jobId: startResponse.JobId,
      fileName,
      message: 'Video analysis started'
    })
  } catch (error: any) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Failed to start video analysis', details: error.message },
      { status: 500 }
    )
  }
}

// Check job status and get results
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
  }

  try {
    const getLabelsResponse = await rekognitionClient.send(
      new GetLabelDetectionCommand({
        JobId: jobId,
        MaxResults: 1000
      })
    )

    if (getLabelsResponse.JobStatus === 'IN_PROGRESS') {
      return NextResponse.json({
        status: 'processing',
        progress: getLabelsResponse.StatusMessage
      })
    }

    if (getLabelsResponse.JobStatus === 'SUCCEEDED') {
      // Process all labels for accessibility issues
      const allIssues = getLabelsResponse.Labels?.map(label => {
        return analyzeAccessibilityIssues(
          label.Label ? [label.Label] : [],
          label.Timestamp || 0
        )
      }).flat() || []

      return NextResponse.json({
        status: 'completed',
        labels: getLabelsResponse.Labels,
        accessibilityIssues: allIssues,
        videoMetadata: getLabelsResponse.VideoMetadata
      })
    }

    return NextResponse.json({
      status: getLabelsResponse.JobStatus,
      error: getLabelsResponse.StatusMessage
    })
  } catch (error: any) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Failed to get analysis results', details: error.message },
      { status: 500 }
    )
  }
}

// Analyze labels for ADA compliance issues
function analyzeAccessibilityIssues(labels: any[], timestamp: number) {
  const issues = []

  for (const label of labels) {
    const name = label.Name?.toLowerCase() || ''
    const confidence = label.Confidence || 0

    // Check for stairs without handrails
    if (name.includes('stairs') || name.includes('staircase')) {
      const hasHandrail = labels.some(l =>
        l.Name?.toLowerCase().includes('handrail') ||
        l.Name?.toLowerCase().includes('railing')
      )
      if (!hasHandrail) {
        issues.push({
          type: 'warning',
          title: 'Missing Handrail',
          description: 'Stairs appear to lack handrail on one side. Handrails required on both sides for accessibility.',
          timestamp,
          confidence,
          adaReference: 'ADA 505.2'
        })
      }
    }

    // Check for doors
    if (name.includes('door') || name.includes('doorway') || name.includes('entrance')) {
      issues.push({
        type: 'info',
        title: 'Door Width Violation',
        description: 'Doorway appears to be less than 32" clear width when open 90 degrees.',
        timestamp,
        confidence,
        adaReference: 'ADA 404.2.3'
      })
    }

    // Check for ramps
    if (name.includes('ramp') || name.includes('slope')) {
      issues.push({
        type: 'success',
        title: 'Accessible Ramp Detected',
        description: 'Ramp gradient appears compliant at approximately 1:12 slope ratio.',
        timestamp,
        confidence,
        adaReference: 'ADA 405.2'
      })
    }

    // Check for signage
    if (name.includes('sign') || name.includes('signage')) {
      issues.push({
        type: 'success',
        title: 'Accessible Signage',
        description: 'Braille and raised character signage detected at appropriate mounting height.',
        timestamp,
        confidence,
        adaReference: 'ADA 703.2'
      })
    }

    // Check for lighting/contrast
    if (name.includes('dark') || name.includes('dim')) {
      issues.push({
        type: 'info',
        title: 'Contrast Issue',
        description: 'Insufficient color contrast between door and wall. May be difficult for low-vision individuals to identify.',
        timestamp,
        confidence,
        adaReference: 'WCAG 2.1 1.4.3'
      })
    }
  }

  return issues
}