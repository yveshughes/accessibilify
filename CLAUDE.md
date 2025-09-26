# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an accessibility-focused Next.js 15 application called "Accessibilify" that demonstrates modern app switcher experiences with video analysis capabilities. It uses React 19, TypeScript, Tailwind CSS v4, and React Aria for accessible UI components.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking (no dedicated script, use directly)
npx tsc --noEmit
```

## Architecture

### Core Context Providers
- **VideoProvider** (`components/VideoContext.tsx`): Manages video playback state, seeking, and alert selection across the app
- **AudioProvider** (`components/AudioProvider.tsx`): Handles audio playback with useReducer pattern for complex state management

### Component Communication Pattern
The app uses a "Connected" component pattern where:
- `ConnectedVideo` and `ConnectedAnalysis` components share state via VideoContext
- Components communicate through context rather than props for cross-component interactions
- Time synchronization between video player and accessibility analysis is handled via context

### Key Features
- Video player with accessibility analysis integration
- Audio player with playback controls (play/pause, rewind, forward, speed control)
- Real-time synchronization between video timestamps and accessibility alerts
- Responsive layout with sidebar navigation

## Code Style Requirements

- Use `const` instead of `let` for variables that are never reassigned
- Avoid using `any` type - specify proper TypeScript types
- ESLint is configured to enforce these rules during build