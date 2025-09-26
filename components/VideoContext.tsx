'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface VideoContextType {
  currentTime: number
  setCurrentTime: (time: number) => void
  seekToTime: number | null
  setSeekToTime: (time: number | null) => void
  selectedAlert: { title: string; timestamp: number } | null
  setSelectedAlert: (alert: { title: string; timestamp: number } | null) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [seekToTime, setSeekToTime] = useState<number | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<{ title: string; timestamp: number } | null>(null)

  return (
    <VideoContext.Provider value={{
      currentTime,
      setCurrentTime,
      seekToTime,
      setSeekToTime,
      selectedAlert,
      setSelectedAlert
    }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider')
  }
  return context
}