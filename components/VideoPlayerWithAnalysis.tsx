'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface VideoPlayerWithAnalysisProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  onAnalysisUpdate?: (issues: any[]) => void
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
  const [detectedIssues, setDetectedIssues] = useState<any[]>([])

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

    // Convert to base64
    const frameData = canvas.toDataURL('image/jpeg', 0.7)

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
      }
    } catch (error) {
      console.error('Frame analysis error:', error)
    }
  }, [onAnalysisUpdate])

  // Start/stop analysis
  useEffect(() => {
    if (isAnalyzing && !analysisInterval) {
      // Analyze frame every 2 seconds
      const interval = setInterval(analyzeFrame, 2000)
      setAnalysisInterval(interval)
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

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
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

      {/* Analysis indicator */}
      {isAnalyzing && (
        <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Analyzing
        </div>
      )}

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
    </div>
  )
}