'use client'

import { useState, useRef, DragEvent } from 'react'

// Compact video upload component designed to fit in the sidebar
// Provides drag-and-drop and click-to-upload functionality
interface CompactVideoUploadProps {
  onVideoSelect: (file: File) => void
  isUploading?: boolean
}

export function CompactVideoUpload({ onVideoSelect, isUploading = false }: CompactVideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag over event for visual feedback
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Handle file drop with video type validation
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('video/')) {
        onVideoSelect(file)
      } else {
        alert('Please upload a video file')
      }
    }
  }

  // Handle file selection from file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onVideoSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`relative aspect-video border-2 border-dashed rounded-lg flex items-center justify-center transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className="text-center p-4">
        {isUploading ? (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">Uploading...</p>
          </>
        ) : (
          <>
            <svg
              className="w-10 h-10 text-slate-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs font-medium text-slate-700 mb-1">
              Drop video here
            </p>
            <p className="text-xs text-slate-500">
              or click to browse
            </p>
          </>
        )}
      </div>
    </div>
  )
}