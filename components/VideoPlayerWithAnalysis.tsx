'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface BoundingBox {
  Width?: number
  Height?: number
  Left?: number
  Top?: number
}

interface Issue {
  type: string
  title: string
  timestamp: number
  confidence: number
  description: string
  adaReference?: string
  boundingBox?: BoundingBox
}

interface Observation {
  label: string
  confidence: number
  timestamp: number
  instances: Array<{
    BoundingBox?: BoundingBox
    Confidence?: number
  }>
}

interface VideoPlayerWithAnalysisProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  onAnalysisUpdate?: (issues: Issue[]) => void
  seekToTime?: number | null
}

export function VideoPlayerWithAnalysis({
  src,
  onTimeUpdate,
  onAnalysisUpdate,
  seekToTime
}: VideoPlayerWithAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null)
  const [detectedIssues, setDetectedIssues] = useState<Issue[]>([])
  const [currentObservations, setCurrentObservations] = useState<Observation[]>([])
  const [showOverlays, setShowOverlays] = useState(true)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [isStoringToSnowflake, setIsStoringToSnowflake] = useState(false)

  // Capture frame and send to Rekognition
  const analyzeFrame = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.paused || video.ended) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 with higher quality for better detection
    const frameData = canvas.toDataURL('image/jpeg', 0.95)

    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frameData,
          timestamp: video.currentTime
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.accessibilityIssues && data.accessibilityIssues.length > 0) {
          setDetectedIssues(prev => [...prev, ...data.accessibilityIssues])
          onAnalysisUpdate?.(data.accessibilityIssues)
        }
        if (data.observations && data.observations.length > 0) {
          // Show all observations with enhanced visibility
          console.log('Received observations:', data.observations)
          setCurrentObservations(data.observations)
          // Keep observations visible for 2.5 seconds for better visibility
          setTimeout(() => setCurrentObservations([]), 2500)
        }
      }
    } catch (error) {
      console.error('Frame analysis error:', error)
    }
  }, [onAnalysisUpdate])

  // Start/stop analysis
  useEffect(() => {
    if (isAnalyzing && !analysisInterval) {
      // Analyze frame every 1 second for more frequent detection
      const interval = setInterval(analyzeFrame, 1000)
      setAnalysisInterval(interval)
      // Also analyze immediately
      analyzeFrame()
    } else if (!isAnalyzing && analysisInterval) {
      clearInterval(analysisInterval)
      setAnalysisInterval(null)
    }

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval)
      }
    }
  }, [isAnalyzing, analysisInterval, analyzeFrame])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      // Start analyzing once video is loaded
      setIsAnalyzing(true)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsAnalyzing(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
      setIsAnalyzing(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [onTimeUpdate])

  // Handle external seek commands
  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekToTime
      if (videoRef.current.paused) {
        videoRef.current.play()
      }
    }
  }, [seekToTime])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
  }

  // Send analysis data to Snowflake
  const storeToSnowflake = async () => {
    if (detectedIssues.length === 0 || isStoringToSnowflake) return

    setIsStoringToSnowflake(true)

    try {
      // Calculate compliance scores
      const errorCount = detectedIssues.filter(i => i.type === 'error').length
      const warningCount = detectedIssues.filter(i => i.type === 'warning').length
      const successCount = detectedIssues.filter(i => i.type === 'success').length
      const totalCount = detectedIssues.length

      const mobilityScore = Math.max(0, 100 - (errorCount * 10))
      const visionScore = Math.max(0, 100 - (warningCount * 5))
      const hearingScore = 90 // Default score for demo
      const cognitionScore = 85 // Default score for demo
      const totalScore = Math.round((mobilityScore + visionScore + hearingScore + cognitionScore) / 4)

      const response = await fetch('/api/snowflake/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: src.split('/').pop()?.split('.')[0] || 'demo',
          title: 'Building Entrance ADA Compliance Analysis',
          duration: duration,
          scores: {
            mobility: mobilityScore,
            vision: visionScore,
            hearing: hearingScore,
            cognition: cognitionScore,
            total: totalScore
          },
          issues: detectedIssues,
          markers: detectedIssues.map(issue => ({
            type: issue.type,
            timestamp: issue.timestamp,
            confidence: issue.confidence,
            description: issue.description,
            boundingBox: issue.boundingBox
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysisId(data.analysisId)
        console.log('Analysis stored in Snowflake:', data.analysisId)
      }
    } catch (error) {
      console.error('Failed to store analysis in Snowflake:', error)
    } finally {
      setIsStoringToSnowflake(false)
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        autoPlay
        loop
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Bounding box overlays - positioned absolutely over the video */}
      {showOverlays && currentObservations.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {currentObservations.map((obs, idx) => (
            obs.instances && obs.instances.map((instance, instIdx) => {
              const box = instance.BoundingBox
              if (!box || !box.Width || !box.Height) return null

              // Enhanced styling for better visibility
              const confidence = instance.Confidence || obs.confidence || 0
              const labelLower = obs.label?.toLowerCase() || ''

              // Determine if this is an accessibility feature (green) or regular detection
              const isAccessibilityFeature =
                labelLower.includes('sign') || labelLower.includes('button') ||
                labelLower.includes('rail') || labelLower.includes('elevator') ||
                labelLower.includes('wheelchair') || labelLower.includes('accessible') ||
                labelLower.includes('braille') || labelLower.includes('tactile') ||
                labelLower.includes('automatic') || labelLower.includes('push')

              // Color based on accessibility compliance
              const color = isAccessibilityFeature ? '#10b981' : // Green for accessibility features
                           confidence > 80 ? '#3b82f6' : // Blue for high confidence
                           confidence > 60 ? '#fbbf24' : // Yellow for medium
                           '#ef4444' // Red for low

              const bgColor = isAccessibilityFeature ? 'rgba(16, 185, 129, 0.3)' :
                             confidence > 80 ? 'rgba(59, 130, 246, 0.2)' :
                             confidence > 60 ? 'rgba(251, 191, 36, 0.2)' :
                             'rgba(239, 68, 68, 0.2)'

              const displayLabel = isAccessibilityFeature ? `✓ ${obs.label}` : obs.label

              return (
                <div
                  key={`${obs.label}-${idx}-${instIdx}`}
                  className="absolute"
                  style={{
                    left: `${(box.Left || 0) * 100}%`,
                    top: `${(box.Top || 0) * 100}%`,
                    width: `${(box.Width || 0) * 100}%`,
                    height: `${(box.Height || 0) * 100}%`,
                    border: `3px solid ${color}`,
                    backgroundColor: bgColor,
                    boxShadow: `0 0 20px ${color}40`,
                    animation: isAccessibilityFeature ? 'glow 2s infinite' : 'pulse 2s infinite'
                  }}
                >
                  <span
                    className="absolute -top-7 left-0 px-2 py-1 text-xs font-bold rounded shadow-lg whitespace-nowrap"
                    style={{
                      backgroundColor: color,
                      color: 'white',
                      fontSize: '11px'
                    }}
                  >
                    {displayLabel} ({Math.round(confidence)}%)
                  </span>
                  {isAccessibilityFeature && (
                    <span
                      className="absolute -bottom-6 left-0 px-2 py-1 text-xs font-medium rounded shadow-lg whitespace-nowrap"
                      style={{
                        backgroundColor: '#065f46',
                        color: 'white',
                        fontSize: '10px'
                      }}
                    >
                      ADA Compliant
                    </span>
                  )}
                </div>
              )
            })
          ))}
        </div>
      )}

      {/* Analysis indicator and overlay toggle */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {isAnalyzing && (
          <div className="bg-green-500/80 backdrop-blur text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Analyzing
          </div>
        )}
        {detectedIssues.length > 5 && !analysisId && (
          <button
            onClick={storeToSnowflake}
            disabled={isStoringToSnowflake}
            className="bg-blue-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700/80 transition-colors flex items-center gap-1"
          >
            {isStoringToSnowflake ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Storing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                Save to Snowflake
              </>
            )}
          </button>
        )}
        {analysisId && (
          <div className="bg-purple-600/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs">
            Stored: {analysisId.substring(0, 8)}...
          </div>
        )}
        <button
          onClick={() => setShowOverlays(!showOverlays)}
          className="bg-black/50 backdrop-blur text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
          title={showOverlays ? "Hide overlays" : "Show overlays"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showOverlays ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="bg-white/20 backdrop-blur hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex-1 bg-white/20 backdrop-blur rounded-full h-1 cursor-pointer"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect()
                 const x = e.clientX - rect.left
                 const percentage = x / rect.width
                 handleSeek(percentage * duration)
               }}>
            <div className="bg-white h-full rounded-full transition-all"
                 style={{ width: `${(currentTime / duration) * 100}%` }} />
          </div>
          <span className="text-white text-sm font-mono">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>

        {/* Analysis summary */}
        {detectedIssues.length > 0 && (
          <div className="mt-2 text-white text-xs">
            {detectedIssues.length} accessibility issues detected
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
        }
        @keyframes glow {
          0% {
            opacity: 0.9;
            filter: brightness(1);
            transform: scale(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.2);
            transform: scale(1.03);
          }
          100% {
            opacity: 0.9;
            filter: brightness(1);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}