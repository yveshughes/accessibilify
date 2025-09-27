'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarSection() {
  const pathname = usePathname()
  const isDemoPage = pathname?.startsWith('/demo')

  if (isDemoPage) {
    // Show video selection on demo page
    return (
      <section className="mt-10 lg:mt-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
          Select Video
        </h2>
        <ul
          role="list"
          className="mt-4 flex justify-center gap-10 text-base font-medium text-slate-700 sm:gap-8 lg:flex-col lg:gap-4"
        >
          <li className="flex">
            <Link
              href="/demo"
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900"
              aria-label="Building Entrance Video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:block">Building Entrance</span>
            </Link>
          </li>
          <li className="flex">
            <Link
              href="/demo?video=sample_1"
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900"
              aria-label="Sample Video 1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:block">Sample Video 1</span>
            </Link>
          </li>
          <li className="flex">
            <Link
              href="/demo?video=sample_2"
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900"
              aria-label="Sample Video 2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:block">Sample Video 2</span>
            </Link>
          </li>
          <li className="flex">
            <div className="w-full h-px bg-slate-200 my-2" />
          </li>
          <li className="flex">
            <Link
              href="/demo/upload"
              className="group flex items-center gap-2 text-green-600 hover:text-green-700"
              aria-label="Upload Your Video"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="hidden sm:block font-medium">Upload Video</span>
            </Link>
          </li>
        </ul>
      </section>
    )
  }

  // Show sponsors on other pages
  return (
    <section className="mt-10 lg:mt-12">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
        Sponsors
      </h2>
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
  )
}