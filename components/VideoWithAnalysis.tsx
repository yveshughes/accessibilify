'use client'

import { useState } from 'react'
import { VideoPlayer } from './VideoPlayer'
import { AccessibilityAnalysis } from './AccessibilityAnalysis'

export function VideoWithAnalysis() {
  const [currentTime, setCurrentTime] = useState(0)
  const [seekToTime, setSeekToTime] = useState<number | null>(null)

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  const handleSeekToTime = (time: number) => {
    setSeekToTime(time)
  }

  return (
    <>
      {/* Video in sidebar */}
      <div className="relative mx-auto block w-48 overflow-hidden rounded-lg bg-slate-900 shadow-xl shadow-slate-200 sm:w-64 sm:rounded-xl lg:w-auto lg:rounded-2xl">
        <VideoPlayer
          src="/video/enter_building.mp4"
          onTimeUpdate={handleTimeUpdate}
          seekToTime={seekToTime}
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset sm:rounded-xl lg:rounded-2xl pointer-events-none" />
      </div>

      {/* Analysis in main content area - will be rendered through a portal */}
      <div id="analysis-portal-content" className="hidden">
        <AccessibilityAnalysis
          currentTime={currentTime}
          onSeekToTime={handleSeekToTime}
        />
      </div>
    </>
  )
}