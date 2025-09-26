'use client'

import { useState } from 'react'
import { VideoPlayer } from './VideoPlayer'

export function VideoAnalysisLayout() {
  const [, setCurrentTime] = useState(0)
  const [seekToTime, setSeekToTime] = useState<number | null>(null)

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  const handleSeekToTime = (time: number) => {
    setSeekToTime(time)
    // This function is kept for future use
  }
  // Keep reference to prevent unused warning
  void handleSeekToTime

  return (
    <div className="relative mx-auto block w-48 overflow-hidden rounded-lg bg-slate-900 shadow-xl shadow-slate-200 sm:w-64 sm:rounded-xl lg:w-auto lg:rounded-2xl">
      <VideoPlayer
        src="/video/enter_building.mp4"
        onTimeUpdate={handleTimeUpdate}
        seekToTime={seekToTime}
      />
      <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset sm:rounded-xl lg:rounded-2xl pointer-events-none" />
    </div>
  )
}