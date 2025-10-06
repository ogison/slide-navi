# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **SlideNavi** application - a PDF slide presenter with speaker notes and auto-play functionality. Built with Next.js 15 (App Router), React 19, TypeScript, and PDF.js for rendering PDF slides with real-time typewriter message effects and audio feedback.

## Architecture

### Main Application Flow

- **`src/app/page.tsx`**: Simple entry point that renders the Home component
- **`src/components/Home.tsx`**: Main orchestrator component that:
  - Integrates PDF upload, slide presentation, and audio player hooks
  - Manages the overall application state and event handlers
  - Coordinates between SlideViewer and ControlsPanel components

### Core Components

- **`src/components/SlideViewer.tsx`**: Primary viewer component featuring:
  - Slide display with navigation controls (previous/next)
  - Integrated SpeakerMessage component for typewriter effect
  - Document metadata display (filename, page count, slide title)

- **`src/components/SpeakerMessage.tsx`**: Message display with animations:
  - Typewriter effect for messages (45ms delay per character)
  - Clear effect animation when transitioning between message groups
  - Speaker icon animation during typing
  - Audio integration with typewriter sound effects

- **`src/components/ControlsPanel.tsx`**: Control interface providing:
  - PDF upload functionality
  - Script editor with markdown-style formatting
  - Auto-play controls with configurable interval timing
  - Page jump navigation for loaded slides
  - Audio settings (volume, enable/disable)

### Custom Hooks Architecture

The application uses a modular hook architecture with specialized hooks in `src/hooks/slidePresentation/`:

- **`useSlidePresentation.ts`**: Main composition hook that:
  - Orchestrates all sub-hooks (script, typing, navigation, message groups, auto-play)
  - Manages complex interactions between different concerns
  - Provides unified interface for Home component

- **`useScriptManager.ts`**: Script parsing and management
  - Parses script input using `createSlideScripts`
  - Maps scripts to slides based on page count
  - Provides script state and update handlers

- **`useTypingState.ts`**: Typewriter effect state
  - Tracks typing completion status
  - Coordinates with auto-play for proper timing
  - Provides callbacks for typing lifecycle events

- **`useSlideNavigation.ts`**: Slide navigation logic
  - Current slide index management
  - Jump-to-page functionality
  - Navigation bounds validation

- **`useMessageGroupControl.ts`**: Message group display control
  - Manages which message group is currently visible
  - Controls clear effect animations between groups
  - Provides group navigation (next/prev)
  - Integrates with auto-play mode

- **`useAutoPlay.ts`**: Auto-play functionality
  - Automatic slide and message group advancement
  - Configurable delay between transitions
  - Coordinates with typing state (waits for typing to complete)
  - Handles pending slide transitions

- **`usePdfUpload.ts`**: PDF file handling
  - File upload and validation (PDF only)
  - PDF rendering via `renderPdfToSlides`
  - Loading state and error handling

- **`useAudioPlayer.ts`**: Audio playback management
  - Typewriter sound effects during message display
  - Completion sound when typing finishes
  - Volume control and enable/disable toggle
  - Settings persistence via localStorage

### Key Features

#### Script System

Scripts use a markdown-like format with specific parsing rules:

- **Slide separation**: Lines starting with `# ` mark the beginning of a new slide
  - Example: `# 1ページ目：タイトル`
  - The text after `# ` becomes the slide title

- **Message groups**: Empty lines within a slide separate message groups
  - Each group displays as a separate typewriter animation
  - Auto-play advances through groups before moving to next slide
  - Example:
    ```
    # Slide 1
    First message group

    Second message group
    ```

- **Auto text splitting**: Long lines (>40 chars) are automatically split at punctuation marks (。、？！?,) for better readability

#### Typewriter Effect

- Messages animate character-by-character at 45ms per character
- Integrated with audio feedback (typewriter sounds)
- Clear effect animation when transitioning between message groups in auto-play mode
- Completion callback triggers next auto-play action

#### Auto-play Behavior

1. Displays current message group with typewriter effect
2. Waits for typing to complete
3. Waits for configured delay (default: 2 seconds)
4. Advances to next message group (or next slide if no more groups)
5. Repeats until end of presentation

#### PDF Processing

- Client-side PDF rendering using PDF.js canvas API
- Each page rendered as data URL and stored in memory
- PowerPoint files must be converted to PDF before upload

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Format code
npm run format
```

## Pre-commit Hooks

Husky automatically runs on commits:
1. `npm run format` - Prettier formatting
2. `npm run lint` - ESLint checks

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: CSS Modules (SCSS) + Tailwind CSS 4
- **PDF Handling**: pdfjs-dist for client-side PDF rendering
- **Audio**: Web Audio API (via `src/utils/audioGenerator.ts`)
- **State Management**: React hooks with modular hook composition pattern
- **Code Quality**: ESLint, Prettier, Husky with lint-staged

## Important Implementation Notes

- All state management is done via React hooks - no external state management library
- The hook composition pattern in `useSlidePresentation` requires careful dependency management to avoid circular dependencies
- Message groups are identified by unique IDs (`slide-{index}-group-{groupIndex}`) to track transitions
- Auto-play uses `isTypingComplete` flag to coordinate timing between typewriter effect and slide/group transitions
- Audio settings are persisted to localStorage to maintain user preferences across sessions
