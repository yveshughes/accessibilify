'use client'

import { useVideo } from './VideoContext'
import { VideoPlayer } from './VideoPlayer'

export function ConnectedVideo() {
  const { setCurrentTime, seekToTime, selectedAlert } = useVideo()

  return (
    <div className="space-y-4">
      <div className="relative mx-auto block w-48 overflow-hidden rounded-lg bg-slate-900 shadow-xl shadow-slate-200 sm:w-64 sm:rounded-xl lg:w-auto lg:rounded-2xl">
        <VideoPlayer
          src="/video/enter_building.mp4"
          onTimeUpdate={setCurrentTime}
          seekToTime={seekToTime}
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset sm:rounded-xl lg:rounded-2xl pointer-events-none" />
      </div>

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