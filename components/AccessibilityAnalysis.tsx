'use client'

import { useState, useEffect, useRef } from 'react'

interface AnalysisItem {
  id: string
  timestamp: number
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  description: string
  confidence: number
  location?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface AccessibilityAnalysisProps {
  currentTime: number
  onSeekToTime: (time: number, title?: string) => void
}

// Placeholder data that simulates streaming analysis
const generateAnalysisItems = (): AnalysisItem[] => [
  {
    id: '1',
    timestamp: 2.5,
    type: 'warning',
    title: 'Low Hanging Sign Detected',
    description: 'Sign at entrance appears to be below 80" clearance requirement. May pose hazard for visually impaired individuals.',
    confidence: 87,
    location: { x: 120, y: 50, width: 100, height: 80 }
  },
  {
    id: '2',
    timestamp: 5.0,
    type: 'error',
    title: 'Narrow Pathway',
    description: 'Corridor width appears to be less than 36" minimum for wheelchair accessibility.',
    confidence: 92,
    location: { x: 200, y: 100, width: 150, height: 200 }
  },
  {
    id: '3',
    timestamp: 8.3,
    type: 'info',
    title: 'Lighting Analysis',
    description: 'Lighting levels detected at approximately 15 foot-candles. Recommended minimum is 20 for public spaces.',
    confidence: 78,
  },
  {
    id: '4',
    timestamp: 12.0,
    type: 'warning',
    title: 'Missing Tactile Indicators',
    description: 'No tactile paving detected at the top of stairs. Required for safe navigation by visually impaired.',
    confidence: 95,
    location: { x: 150, y: 180, width: 200, height: 100 }
  },
  {
    id: '5',
    timestamp: 15.5,
    type: 'success',
    title: 'Accessible Ramp Detected',
    description: 'Ramp gradient appears compliant at approximately 1:12 slope ratio.',
    confidence: 88,
    location: { x: 50, y: 150, width: 250, height: 150 }
  },
  {
    id: '6',
    timestamp: 18.2,
    type: 'error',
    title: 'Door Width Violation',
    description: 'Doorway appears to be less than 32" clear width when open 90 degrees.',
    confidence: 91,
    location: { x: 180, y: 60, width: 80, height: 160 }
  },
  {
    id: '7',
    timestamp: 22.0,
    type: 'warning',
    title: 'Contrast Issue',
    description: 'Insufficient color contrast between door and wall. May be difficult for low-vision individuals to identify.',
    confidence: 76,
  },
  {
    id: '8',
    timestamp: 25.5,
    type: 'info',
    title: 'Elevator Button Height',
    description: 'Call buttons appear to be at 42" height, within acceptable range of 35"-48".',
    confidence: 83,
    location: { x: 100, y: 120, width: 60, height: 80 }
  },
  {
    id: '9',
    timestamp: 28.0,
    type: 'error',
    title: 'Missing Handrail',
    description: 'Stairs appear to lack handrail on one side. Handrails required on both sides for accessibility.',
    confidence: 94,
    location: { x: 0, y: 100, width: 300, height: 200 }
  },
  {
    id: '10',
    timestamp: 30.5,
    type: 'success',
    title: 'Accessible Signage',
    description: 'Braille and raised character signage detected at appropriate mounting height.',
    confidence: 89,
    location: { x: 220, y: 70, width: 70, height: 50 }
  }
]

export function AccessibilityAnalysis({ currentTime, onSeekToTime }: AccessibilityAnalysisProps) {
  const [items, setItems] = useState<AnalysisItem[]>([])
  const [isStreaming, setIsStreaming] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)

  // Simulate streaming analysis
  useEffect(() => {
    const allItems = generateAnalysisItems()
    let currentIndex = 0

    const streamInterval = setInterval(() => {
      if (currentIndex < allItems.length) {
        setItems(prev => [...prev, allItems[currentIndex]])
        currentIndex++
      } else {
        setIsStreaming(false)
        clearInterval(streamInterval)
      }
    }, 2000) // Add new item every 2 seconds

    return () => clearInterval(streamInterval)
  }, [])

  // Highlight item based on current video time
  useEffect(() => {
    const activeItem = items.find(item =>
      Math.abs(item.timestamp - currentTime) < 0.5
    )
    setHighlightedItem(activeItem?.id || null)
  }, [currentTime, items])

  const getTypeStyles = (type: AnalysisItem['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900'
    }
  }

  const getTypeIcon = (type: AnalysisItem['type']) => {
    switch (type) {
      case 'error':
        return '⚠️'
      case 'warning':
        return '⚡'
      case 'success':
        return '✅'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Accessibility Analysis</h2>
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">Live Analysis</span>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1">
          {items.length} issue{items.length !== 1 ? 's' : ''} detected
        </p>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`group border rounded-lg p-4 cursor-pointer transition-all ${
              getTypeStyles(item.type)
            } ${
              highlightedItem === item.id
                ? 'ring-2 ring-offset-2 ring-blue-500 scale-[1.02] shadow-lg'
                : 'hover:scale-[1.01] hover:shadow-md hover:border-opacity-80'
            } ${
              index === items.length - 1 && isStreaming ? 'animate-slideIn' : ''
            }`}
            onClick={() => onSeekToTime(item.timestamp, item.title)}
            title={`Click to jump to ${item.timestamp.toFixed(1)}s in video`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label={item.type}>
                {getTypeIcon(item.type)}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                      {item.timestamp.toFixed(1)}s
                    </span>
                  </div>
                </div>
                <p className="text-sm opacity-80 mb-2">{item.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item.confidence}% confidence
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Region tracked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-center py-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}