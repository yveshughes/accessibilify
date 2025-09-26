'use client'

import { ConnectedAnalysis } from '@/components/ConnectedAnalysis'

export default function Home() {
  return (
    <div className="flex gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-12">
      {/* Left Column - Accessibility Analysis */}
      <div className="flex-[2] max-w-4xl">
        <ConnectedAnalysis />
      </div>

      {/* Right Column - How it works */}
      <div className="flex-1 max-w-md">
        <div className="sticky top-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">How it works</h2>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold mr-3">1</span>
              Upload Building Footage
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed ml-10">
              Upload video walkthroughs of your building or facility. Our AI analyzes the footage to identify physical
              accessibility features and potential ADA compliance issues in real-time.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold mr-3">2</span>
              ADA Compliance Detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed ml-10">
              Our system automatically detects ADA violations such as door width requirements (32&quot; minimum),
              missing handrails, insufficient ramp slopes, contrast issues, and missing accessibility signage
              based on official ADA guidelines.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold mr-3">3</span>
              Timestamped Issue Alerts
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed ml-10">
              Each detected issue is timestamped and linked to specific ADA policy sections. Click any alert
              to jump to that moment in the video and see the exact policy reference and requirements.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold mr-3">4</span>
              Actionable Recommendations
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed ml-10">
              Receive specific remediation guidance for each issue, including required measurements,
              materials needed, and priority levels based on ADA Title III requirements and potential legal risk.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold mr-3">5</span>
              Compliance Documentation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed ml-10">
              Generate detailed reports with ADA policy citations, photographic evidence, and remediation
              timelines for legal compliance, insurance documentation, or accessibility certification.
            </p>
          </section>
        </div>

        <div className="mt-10 p-5 bg-slate-50 rounded-lg">
          <h3 className="text-base font-semibold text-slate-900 mb-2">ADA Compliance Standards</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Americans with Disabilities Act (ADA) requires public accommodations to be accessible to people
            with disabilities. Our system references official ADA Standards for Accessible Design (2010) and
            helps ensure your facility meets federal requirements while avoiding potential lawsuits and penalties.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}