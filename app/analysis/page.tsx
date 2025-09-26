'use client'

import { useState, useEffect } from 'react'
import { AccessibilityAnalysis } from '@/components/AccessibilityAnalysis'

export default function AnalysisPage() {
  const [currentTime, setCurrentTime] = useState(0)

  // Listen for video time updates from the sidebar video
  useEffect(() => {
    const handleVideoTimeUpdate = (event: CustomEvent) => {
      setCurrentTime(event.detail.currentTime)
    }

    window.addEventListener('videoTimeUpdate' as any, handleVideoTimeUpdate)

    return () => {
      window.removeEventListener('videoTimeUpdate' as any, handleVideoTimeUpdate)
    }
  }, [])

  const handleSeekToTime = (time: number) => {
    // Dispatch event to seek video in sidebar
    window.dispatchEvent(new CustomEvent('seekVideo', { detail: { time } }))
  }

  return (
    <div className="h-full">
      <AccessibilityAnalysis
        currentTime={currentTime}
        onSeekToTime={handleSeekToTime}
      />
    </div>
  )
}