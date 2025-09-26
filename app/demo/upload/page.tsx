'use client'

import { useState } from 'react'
import { VideoUpload } from '@/components/VideoUpload'
import { VideoPlayerWithAnalysis } from '@/components/VideoPlayerWithAnalysis'

interface AnalysisResult {
  type: string
  title: string
  description: string
  timestamp: number
  confidence: number
  adaReference?: string
}

export default function DemoUploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'completed' | 'error'>('idle')

  const handleVideoSelect = async (file: File) => {
    setVideoFile(file)
    setAnalysisStatus('uploading')
    setIsUploading(true)

    // Create local URL for preview
    const localUrl = URL.createObjectURL(file)
    setVideoUrl(localUrl)

    try {
      // Upload to S3 and start analysis
      const formData = new FormData()
      formData.append('video', file)

      const response = await fetch('/api/analyze-video', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setIsUploading(false)
      setAnalysisStatus('analyzing')

      // Poll for results
      if (data.jobId) {
        pollForResults(data.jobId)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
      setAnalysisStatus('error')
      alert('Failed to upload video. Please try again.')
    }
  }

  const pollForResults = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analyze-video?jobId=${jobId}`)
        const data = await response.json()

        if (data.status === 'completed') {
          clearInterval(pollInterval)
          setAnalysisResults(data.accessibilityIssues || [])
          setAnalysisStatus('completed')
        } else if (data.status === 'FAILED') {
          clearInterval(pollInterval)
          setAnalysisStatus('error')
        }
      } catch (error) {
        console.error('Polling error:', error)
        clearInterval(pollInterval)
        setAnalysisStatus('error')
      }
    }, 3000) // Poll every 3 seconds
  }

  const handleAnalysisUpdate = (newIssues: AnalysisResult[]) => {
    setAnalysisResults(prev => [...newIssues, ...prev])
  }

  const resetDemo = () => {
    setVideoFile(null)
    setVideoUrl(null)
    setIsUploading(false)
    setAnalysisResults([])
    setAnalysisStatus('idle')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            ADA Compliance Video Analyzer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload a video of your building or facility to instantly detect accessibility issues
            and receive ADA compliance recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Video Upload/Player */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {videoUrl ? 'Your Video' : 'Upload Video'}
              </h2>

              {!videoUrl ? (
                <VideoUpload
                  onVideoSelect={handleVideoSelect}
                  isUploading={isUploading}
                />
              ) : (
                <div className="space-y-4">
                  <VideoPlayerWithAnalysis
                    src={videoUrl}
                    onAnalysisUpdate={handleAnalysisUpdate}
                  />

                  {videoFile && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{videoFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={resetDemo}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Upload Different Video
                        </button>
                      </div>
                    </div>
                  )}

                  {analysisStatus === 'analyzing' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <div>
                          <p className="font-medium text-blue-900">Analyzing video with AWS Rekognition...</p>
                          <p className="text-sm text-blue-700 mt-1">
                            Detecting accessibility features and ADA compliance issues
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Indicators */}
            {videoUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Analysis Pipeline</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${analysisStatus === 'uploading' || analysisStatus !== 'idle' ? 'text-green-600' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Video uploaded to AWS S3</span>
                  </div>
                  <div className={`flex items-center gap-3 ${analysisStatus === 'analyzing' || analysisStatus === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Frame-by-frame analysis running</span>
                  </div>
                  <div className={`flex items-center gap-3 ${analysisStatus === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>ADA compliance report ready</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Analysis Results
              </h2>

              {analysisResults.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-24 h-24 text-slate-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-slate-500">
                    Upload a video to see accessibility analysis results
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {analysisResults.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        issue.type === 'success'
                          ? 'bg-green-50 border-green-200'
                          : issue.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            issue.type === 'success'
                              ? 'text-green-900'
                              : issue.type === 'warning'
                              ? 'text-yellow-900'
                              : 'text-blue-900'
                          }`}>
                            {issue.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            issue.type === 'success'
                              ? 'text-green-700'
                              : issue.type === 'warning'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                          }`}>
                            {issue.description}
                          </p>
                          {issue.adaReference && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                                {issue.adaReference}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 ml-3">
                          {issue.timestamp.toFixed(1)}s
                        </span>
                      </div>
                      {issue.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">Confidence:</span>
                            <div className="flex-1 bg-white/50 rounded-full h-2">
                              <div
                                className={`h-full rounded-full ${
                                  issue.type === 'success'
                                    ? 'bg-green-500'
                                    : issue.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${issue.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-700 font-medium">
                              {issue.confidence.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {analysisResults.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Generate Full ADA Compliance Report
                  </button>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {analysisResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResults.filter(r => r.type === 'success').length}
                    </div>
                    <div className="text-xs text-slate-600">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysisResults.filter(r => r.type === 'warning').length}
                    </div>
                    <div className="text-xs text-slate-600">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResults.filter(r => r.type === 'info').length}
                    </div>
                    <div className="text-xs text-slate-600">Info</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}