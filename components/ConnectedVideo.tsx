'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useVideo } from './VideoContext'
import { VideoPlayerWithAnalysis } from './VideoPlayerWithAnalysis'

// Interface for accessibility issues detected by AWS Rekognition
interface Issue {
  type: string
  title: string
  timestamp: number
  adaReference?: string
}

// Main video component that connects to the VideoContext
// Displays the sample building entrance video with AI analysis
export function ConnectedVideo() {
  const pathname = usePathname()
  const { setCurrentTime, seekToTime, selectedAlert } = useVideo()
  const [liveIssues, setLiveIssues] = useState<Issue[]>([])
  const [videoUrl] = useState<string>('/video/enter_building.mp4')

  // Hide video on demo page to avoid duplication
  if (pathname === '/demo') {
    return null
  }

  // Update the live feed with new accessibility issues from Rekognition
  const handleAnalysisUpdate = (newIssues: Issue[]) => {
    // Add new issues to the live feed
    setLiveIssues(prev => [...newIssues, ...prev].slice(0, 3)) // Keep last 3 issues

    // Log observations for monitoring
    console.log('Rekognition detected:', newIssues)
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto block w-48 overflow-hidden rounded-lg bg-slate-900 shadow-xl shadow-slate-200 sm:w-64 sm:rounded-xl lg:w-auto lg:rounded-2xl">
        <VideoPlayerWithAnalysis
          src={videoUrl}
          onTimeUpdate={setCurrentTime}
          onAnalysisUpdate={handleAnalysisUpdate}
          seekToTime={seekToTime}
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset sm:rounded-xl lg:rounded-2xl pointer-events-none" />
      </div>

      {/* Live Rekognition Analysis Feed */}
      {liveIssues.length > 0 && (
        <div className="space-y-2 px-2">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">AI Detection</h3>
          {liveIssues.map((issue, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded-lg border transition-all duration-300 ${
                issue.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : issue.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
              style={{
                opacity: 1 - (index * 0.3),
                transform: `scale(${1 - (index * 0.05)})`
              }}
            >
              <div className="font-medium">{issue.title}</div>
              {issue.adaReference && (
                <div className="text-xs opacity-75 mt-1">{issue.adaReference}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedAlert && (
        <div className="bg-slate-100 rounded-lg p-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-slate-900">
                {selectedAlert.title}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {selectedAlert.timestamp.toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}