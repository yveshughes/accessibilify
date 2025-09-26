'use client'

import { useRef, useState, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  seekToTime?: number | null
}

export function VideoPlayer({ src, onTimeUpdate, seekToTime }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLooping, setIsLooping] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [onTimeUpdate])

  // Handle external seek commands
  useEffect(() => {
    if (seekToTime !== null && seekToTime !== undefined && videoRef.current) {
      // Temporarily disable loop to prevent jumping
      setIsLooping(false)
      videoRef.current.currentTime = seekToTime
      // Ensure video is playing after seek
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      }
      // Re-enable loop after a delay
      setTimeout(() => setIsLooping(true), 1000)
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
    setIsPlaying(!isPlaying)
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
        loop={isLooping}
        muted
        playsInline
      />
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
      </div>
    </div>
  )
}