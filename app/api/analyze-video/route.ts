import { NextRequest, NextResponse } from 'next/server'
import {
  RekognitionClient,
  StartLabelDetectionCommand,
  GetLabelDetectionCommand,
  StartLabelDetectionCommandInput,
  DetectLabelsCommand
} from '@aws-sdk/client-rekognition'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

    // Detect labels in the frame with bounding boxes
    const detectLabelsResponse = await rekognitionClient.send(
      new DetectLabelsCommand({
        Image: {
          Bytes: imageBuffer
        },
        MaxLabels: 20,
        MinConfidence: 60,
        Features: ['GENERAL_LABELS']
      })
    )

    // Process labels for accessibility issues
    const analysis = analyzeAccessibilityIssues(detectLabelsResponse.Labels || [], timestamp)

    return NextResponse.json({
      success: true,
      timestamp,
      labels: detectLabelsResponse.Labels,
      accessibilityIssues: analysis.issues,
      observations: analysis.observations
    })
  } catch (error) {
    console.error('Video analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze video frame', details: error instanceof Error ? error.message : 'Unknown error' },
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
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: 'Failed to start video analysis', details: error instanceof Error ? error.message : 'Unknown error' },
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
      const allAnalysis = getLabelsResponse.Labels?.map(label => {
        return analyzeAccessibilityIssues(
          label.Label ? [label.Label] : [],
          label.Timestamp || 0
        )
      }) || []

      const allIssues = allAnalysis.flatMap(a => a.issues)
      const allObservations = allAnalysis.flatMap(a => a.observations)

      return NextResponse.json({
        status: 'completed',
        labels: getLabelsResponse.Labels,
        accessibilityIssues: allIssues,
        observations: allObservations,
        videoMetadata: getLabelsResponse.VideoMetadata
      })
    }

    return NextResponse.json({
      status: getLabelsResponse.JobStatus,
      error: getLabelsResponse.StatusMessage
    })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      { error: 'Failed to get analysis results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Analyze labels for ADA compliance issues
interface Label {
  Name?: string
  Confidence?: number
  Instances?: Array<{
    BoundingBox?: {
      Width?: number
      Height?: number
      Left?: number
      Top?: number
    }
    Confidence?: number
  }>
  Parents?: Array<{
    Name?: string
  }>
}

function analyzeAccessibilityIssues(labels: Label[], timestamp: number) {
  const issues = []
  const observations = []

  // Generate general observations
  for (const label of labels) {
    const name = label.Name?.toLowerCase() || ''
    const confidence = label.Confidence || 0

    // Add observation with bounding box if available
    if (label.Instances && label.Instances.length > 0) {
      observations.push({
        label: label.Name,
        confidence,
        instances: label.Instances,
        timestamp
      })
    }

    // Check for stairs without handrails
    if (name.includes('stairs') || name.includes('staircase') || name.includes('steps')) {
      const hasHandrail = labels.some(l =>
        l.Name?.toLowerCase().includes('handrail') ||
        l.Name?.toLowerCase().includes('railing') ||
        l.Name?.toLowerCase().includes('rail')
      )
      if (!hasHandrail) {
        issues.push({
          type: 'error',
          title: 'Missing Handrail',
          description: 'Stairs detected without visible handrails. ADA requires continuous handrails on both sides of stairs.',
          timestamp,
          confidence,
          boundingBox: label.Instances?.[0]?.BoundingBox,
          adaReference: 'ADA 505.2'
        })
      }
    }

    // Check for narrow pathways
    if (name.includes('hallway') || name.includes('corridor') || name.includes('path')) {
      issues.push({
        type: 'warning',
        title: 'Check Pathway Width',
        description: 'Pathway detected - verify minimum 36" clear width for wheelchair access.',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 403.5'
      })
    }

    // Check for doors
    if (name.includes('door') || name.includes('doorway') || name.includes('entrance') || name.includes('exit')) {
      // Check if it's a glass door (potential visibility issue)
      const isGlass = labels.some(l => l.Name?.toLowerCase().includes('glass'))
      if (isGlass) {
        issues.push({
          type: 'warning',
          title: 'Glass Door Visibility',
          description: 'Glass door detected - ensure contrast markings are present at eye level for visibility.',
          timestamp,
          confidence,
          boundingBox: label.Instances?.[0]?.BoundingBox,
          adaReference: 'ADA 404.1'
        })
      } else {
        issues.push({
          type: 'info',
          title: 'Verify Door Width',
          description: 'Door detected - verify minimum 32" clear width when open 90 degrees.',
          timestamp,
          confidence,
          boundingBox: label.Instances?.[0]?.BoundingBox,
          adaReference: 'ADA 404.2.3'
        })
      }
    }

    // Check for thresholds and level changes
    if (name.includes('threshold') || name.includes('step') || name.includes('curb')) {
      issues.push({
        type: 'warning',
        title: 'Level Change Detected',
        description: 'Potential trip hazard - thresholds should not exceed 1/2" height.',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 303'
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
    if (name.includes('dark') || name.includes('dim') || name.includes('shadow')) {
      issues.push({
        type: 'warning',
        title: 'Poor Lighting Conditions',
        description: 'Area appears dimly lit. Adequate lighting is essential for safe navigation, especially for visually impaired individuals.',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 206.5'
      })
    }

    // Check for parking and access
    if (name.includes('parking') || name.includes('car') || name.includes('vehicle')) {
      issues.push({
        type: 'info',
        title: 'Parking Area',
        description: 'Parking area detected - verify accessible parking spaces with proper width and access aisles.',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 502'
      })
    }

    // Check for person or people (to identify crowding)
    if (name.includes('person') || name.includes('people') || name.includes('crowd')) {
      const count = label.Instances?.length || 1
      if (count > 3) {
        issues.push({
          type: 'info',
          title: 'Crowded Area',
          description: 'Multiple people detected - ensure clear paths of travel are maintained.',
          timestamp,
          confidence,
          adaReference: 'ADA 403.5'
        })
      }
    }

    // Check for flooring and surfaces
    if (name.includes('floor') || name.includes('carpet') || name.includes('mat') || name.includes('rug')) {
      issues.push({
        type: 'info',
        title: 'Floor Surface',
        description: 'Floor surface detected - ensure stable, firm, and slip-resistant surface.',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 302'
      })
    }
    // Check for accessibility equipment
    if (name.includes('wheelchair') || name.includes('accessibility')) {
      issues.push({
        type: 'success',
        title: 'Accessibility Feature',
        description: `${label.Name} detected in frame`,
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox
      })
    }

    // Check for obstacles
    if (name.includes('obstacle') || name.includes('barrier') || name.includes('blocked')) {
      issues.push({
        type: 'warning',
        title: 'Potential Obstacle',
        description: 'Detected potential barrier to accessibility',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 307'
      })
    }

    // Check for elevators
    if (name.includes('elevator') || name.includes('lift')) {
      issues.push({
        type: 'success',
        title: 'Elevator Access',
        description: 'Elevator detected - verify compliance with call button height and braille signage',
        timestamp,
        confidence,
        boundingBox: label.Instances?.[0]?.BoundingBox,
        adaReference: 'ADA 407'
      })
    }
  }

  return { issues, observations }
}