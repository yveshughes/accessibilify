'use client'

import { useVideo } from './VideoContext'
import { AccessibilityAnalysis } from './AccessibilityAnalysis'

export function ConnectedAnalysis() {
  const { currentTime, setSeekToTime, setSelectedAlert } = useVideo()

  const handleSeekToTime = (time: number, title?: string) => {
    setSeekToTime(time)
    if (title) {
      setSelectedAlert({ title, timestamp: time })
    }
  }

  return (
    <AccessibilityAnalysis
      currentTime={currentTime}
      onSeekToTime={handleSeekToTime}
    />
  )
}