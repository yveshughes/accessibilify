# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Accessibilify is an ADA compliance monitoring system built with Next.js 15 that analyzes building videos to detect accessibility violations using AWS Rekognition AI. It provides real-time compliance scoring and stores analytics data in Snowflake for enterprise reporting.

**Tech Stack**: Next.js 15.5.4, React 19, TypeScript, Tailwind CSS v4, React Aria, AWS SDK (Rekognition/S3), Snowflake SDK

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Snowflake Database
npm run snowflake:init      # Initialize database tables
npm run snowflake:populate  # Populate demo data
npm run snowflake:test      # Test connection

# Type Checking
npx tsc --noEmit         # TypeScript type checking
```

## Architecture

### API Routes
- `/api/analyze-video`: Frame-by-frame AWS Rekognition analysis, handles bulk uploads and job status
- `/api/snowflake/analysis`: Query and store ADA compliance analysis data
- `/api/snowflake/dashboard`: Retrieve dashboard metrics and analytics

### Core Context Providers
- **VideoProvider** (`components/VideoContext.tsx`): Manages video playback state, seeking, and alert selection across the app
- **AudioProvider** (`components/AudioProvider.tsx`): Simplified stub provider (audio functionality not currently implemented)

### Component Communication Pattern
The app uses a "Connected" component pattern where:
- `ConnectedVideo` and `ConnectedAnalysis` components share state via VideoContext
- Components communicate through context rather than props for cross-component interactions
- Time synchronization between video player and accessibility analysis is handled via context

### Data Flow
1. Videos uploaded to S3 → AWS Rekognition analyzes frames
2. Detection results include 30+ ADA violation types with confidence scores
3. Analysis data stored in Snowflake for compliance reporting
4. Real-time UI updates show bounding boxes and accessibility alerts

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- AWS credentials and S3 bucket configuration
- Snowflake connection parameters (account, warehouse, database)

## Code Style Requirements

- Use `const` instead of `let` for variables that are never reassigned
- Avoid using `any` type - specify proper TypeScript types
- ESLint is configured to enforce these rules during build