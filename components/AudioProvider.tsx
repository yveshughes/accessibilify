'use client'

import { createContext, useContext, ReactNode } from 'react'

// Simplified AudioProvider that just passes through children
// Since we don't need audio functionality for the ADA compliance app

export interface Episode {
  id: string
  title: string
  description: string
  audio: {
    src: string
    type: string
  }
}

interface PlayerState {
  playing: boolean
  muted: boolean
  duration: number
  currentTime: number
  episode: Episode | null
}

interface PublicPlayerActions {
  play: (episode?: Episode) => void
  pause: () => void
  toggle: (episode?: Episode) => void
  seekBy: (amount: number) => void
  seek: (time: number) => void
  playbackRate: (rate: number) => void
  toggleMute: () => void
  isPlaying: (episode?: Episode) => boolean
}

export type PlayerAPI = PlayerState & PublicPlayerActions

// Create a simple stub context
const stubPlayer: PlayerAPI = {
  playing: false,
  muted: false,
  duration: 0,
  currentTime: 0,
  episode: null,
  play: () => {},
  pause: () => {},
  toggle: () => {},
  seekBy: () => {},
  seek: () => {},
  playbackRate: () => {},
  toggleMute: () => {},
  isPlaying: () => false,
}

const AudioPlayerContext = createContext<PlayerAPI>(stubPlayer)

interface AudioProviderProps {
  children: ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  return (
    <AudioPlayerContext.Provider value={stubPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

// Stub for useAudioPlayer hook
export function useAudioPlayer(episode?: Episode) {
  const player = useContext(AudioPlayerContext)
  return player
}