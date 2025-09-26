'use client'

import { useState, useRef, DragEvent } from 'react'

interface VideoUploadProps {
  onVideoSelect: (file: File) => void
  isUploading?: boolean
}

export function VideoUpload({ onVideoSelect, isUploading = false }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

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
      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-slate-400 bg-white'
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

      <div className="flex flex-col items-center">
        {isUploading ? (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700">Uploading video...</p>
            <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
          </>
        ) : (
          <>
            <svg
              className="w-16 h-16 text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-slate-700">
              Drop your video here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Supports MP4, MOV, AVI, WebM (max 500MB)
            </p>
          </>
        )}
      </div>
    </div>
  )
}