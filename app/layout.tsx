import { type Metadata } from 'next'
import { Geist_Mono } from "next/font/google"
import Link from 'next/link'
import Image from 'next/image'

import { AudioProvider } from '@/components/AudioProvider'
import { AudioPlayer } from '@/components/player/AudioPlayer'
import { Waveform } from '@/components/Waveform'
import { VideoProvider } from '@/components/VideoContext'
import { ConnectedVideo } from '@/components/ConnectedVideo'
import './globals.css'

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: '%s - Accessibilify',
    default: 'Accessibilify - Modern App Switcher Experience',
  },
  description: 'Experience the modern app switcher with beautiful transitions and animations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full bg-white antialiased ${geistMono.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
        />
      </head>
      <body className="flex min-h-full">
        <VideoProvider>
          <AudioProvider>
            <header className="bg-slate-50 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-112 lg:items-start lg:overflow-y-auto xl:w-120">
              <div className="hidden lg:sticky lg:top-0 lg:flex lg:w-16 lg:flex-none lg:flex-col lg:items-center lg:py-12 lg:gap-6">
                {/* Navigation Icons */}
                <Link
                  href="/"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  aria-label="Home"
                  title="Home"
                >
                  <svg className="h-5 w-5 text-slate-600 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>

                <Link
                  href="/demo/upload"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  aria-label="Live Demo"
                  title="Live Demo"
                >
                  <div className="relative">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                </Link>

                <div className="h-px w-8 bg-slate-200 my-2" />

                <Link
                  href="https://github.com/yveshughes/accessibilify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <svg className="h-5 w-5 text-slate-600 group-hover:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Link>

                <Link
                  href="https://www.linkedin.com/in/yves-hughes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg className="h-5 w-5 text-slate-600 group-hover:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Link>
              </div>
              <div className="relative z-10 mx-auto px-4 pt-10 pb-4 sm:px-6 md:max-w-2xl md:px-4 lg:min-h-full lg:flex-auto lg:border-x lg:border-slate-200 lg:px-8 lg:py-12 xl:px-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Image
                    src="/icon-bw.svg"
                    alt="Accessibilify Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <h1 className="text-2xl font-bold text-slate-900">
                    Accessibilify
                  </h1>
                </div>
                <ConnectedVideo />
              <section className="mt-10 lg:mt-12">
                <ul
                  role="list"
                  className="mt-4 flex justify-center gap-10 text-base font-medium text-slate-700 sm:gap-8 lg:flex-col lg:gap-4"
                >
                  {(
                    [
                      ['Snowflake', 'https://www.snowflake.com'],
                      ['Writer', 'https://writer.com'],
                      ['AWS', 'https://aws.amazon.com'],
                      ['Llama', 'https://llama.com'],
                      ['LandingAI', 'https://landing.ai'],
                      ['CrewAI', 'https://www.crewai.com'],
                      ['Glean', 'https://www.glean.com'],
                    ] as const
                  ).map(([sponsor, url]) => (
                    <li key={sponsor} className="flex">
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center text-slate-600 hover:text-slate-900"
                        aria-label={`Visit ${sponsor} website`}
                      >
                        <span className="hidden sm:block">{sponsor}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </header>
          <main className="border-t border-slate-200 lg:relative lg:mb-28 lg:ml-112 lg:border-t-0 xl:ml-120">
            <Waveform className="absolute top-0 left-0 h-20 w-full" />
            <div className="relative">{children}</div>
          </main>
            <div className="fixed inset-x-0 bottom-0 z-10 lg:left-112 xl:left-120">
              <AudioPlayer />
            </div>
          </AudioProvider>
        </VideoProvider>
      </body>
    </html>
  )
}