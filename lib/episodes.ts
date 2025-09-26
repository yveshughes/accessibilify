// Simplified episode type for AudioProvider
export interface Episode {
  id: string
  title: string
  description: string
  audio: {
    src: string
    type: string
  }
}

// Empty episodes array since we don't need audio functionality
export const episodes: Episode[] = []