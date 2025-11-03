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
  - Script editor with JSON formatting (see `docs/script-input-guide.md`)
  - Auto-play controls with configurable interval timing
  - Page jump navigation for loaded slides
  - Audio settings (volume, enable/disable)

### Custom Hooks Architecture

The application uses a modular hook architecture with specialized hooks in `src/hooks/slidePresentation/`:

- **`useSlidePresentation.ts`**: Main composition hook that:
  - Orchestrates all sub-hooks (script, typing, navigation, message groups, auto-play)
  - Manages complex interactions between different concerns
  - Provides unified interface for Home component
  - **Important**: Initializes `isAutoPlaying` at the top level to avoid circular dependencies between hooks
  - **Initialization order matters**: Script Manager → Typing State → Slide Navigation → Message Group Control → Auto-play

- **`useScriptManager.ts`**: Script parsing and management
  - Parses script input using `createSlideScripts` (JSON format only)
  - Maps scripts to slides based on page count
  - Provides script state and update handlers
  - Error recovery: retains previous valid scripts on parse errors if page count matches

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
  - Controls clear effect animations between groups (only during auto-play, not manual navigation)
  - Provides group navigation (next/prev)
  - Integrates with auto-play mode
  - `showClearEffect` is true only when entering a new group with auto-play enabled AND there was a previous message
  - Manages fight animation triggers based on group `animation` property

- **`useAutoPlay.ts`**: Auto-play functionality
  - Automatic slide and message group advancement
  - Configurable delay between transitions
  - Coordinates with typing state (waits for typing to complete)
  - Uses `pendingSlideTransition` state machine flag to track whether next action should advance group or slide
  - Flow: Wait for `isTypingComplete` → Delay for configured seconds → Check `pendingSlideTransition` → Execute next action
  - Manual navigation stops auto-play and bypasses the state machine

- **`usePdfUpload.ts`**: PDF file handling
  - File upload and validation (PDF only)
  - PDF rendering via `renderPdfToSlides`
  - Loading state and error handling

- **`useAudioPlayer.ts`**: Audio playback management
  - Typewriter sound effects during message display (plays every 90ms, double the typing rate)
  - Uses audio file cloning pattern for overlapping sounds (`/sounds/message-type.mp3`)
  - Volume control and enable/disable toggle
  - Settings persistence via localStorage (`slide-navi-audio-settings`)
  - Hydration safety: uses `isInitializedRef` to prevent double-loading settings

- **`useSpeechSynthesis.ts`**: Text-to-speech functionality
  - Web Speech API integration with browser compatibility check
  - Japanese voice auto-selection with fallback
  - Settings: enabled, volume (0-1), rate (0.5-2.0), pitch (0.5-2.0), voiceName
  - Polls speaking state every 50ms for accurate completion detection (onend events can be delayed)
  - Settings persistence via localStorage (`slide-navi-speech-settings`)

### Key Features

#### Script System

Scripts use **JSON format** (not markdown). See `docs/script-input-guide.md` for complete specifications.

**JSON Structure:**

- Root can be an array of slide objects OR an object with `slides` property
- Each slide has: `title`, `transition`, and message groups

**Flexible Property Names:**

- Groups: `groups` (recommended) OR `messageGroups` OR `messages`
- Messages within groups: array of strings OR array of `{text: string}` objects

**Slide Object Fields:**

- `title` (string): Slide heading displayed in viewer
- `transition` (string or object): Transition type, currently only supports `"immediate"`
- `groups`/`messageGroups`/`messages` (array): Message groups for this slide

**Group Object Fields:**

- `id` (optional string): Identifier for group (useful for script version control)
- `speaker` (optional string): Character name - `"axolotl"` (ウーパー君, default) or `"yagi"` (やぎ君)
- `messages` (required array): Array of message strings or `{text: string}` objects
- `animation` (optional string): Set to `"fight"` to trigger battle animation

**Processing Rules:**

- Empty groups are silently filtered out
- Parse errors are caught; previous valid scripts retained if page count matches
- Multiple message groups per slide: each group displays as separate typewriter animation
- Auto-play advances through groups before moving to next slide

**Example:**

```json
{
  "slides": [
    {
      "title": "Introduction",
      "transition": "immediate",
      "groups": [
        {
          "speaker": "axolotl",
          "messages": ["Hello!", "Welcome to the presentation."]
        },
        {
          "speaker": "yagi",
          "messages": ["Let's begin!"],
          "animation": "fight"
        }
      ]
    }
  ]
}
```

#### Typewriter Effect

- Messages animate character-by-character at 45ms per character (configurable via `TYPEWRITER_DELAY_MS`)
- Integrated with audio feedback (typewriter sounds play every 90ms)
- Clear effect animation (400ms duration) when transitioning between message groups in auto-play mode
- Delays before typing starts:
  - New group: 300ms (`NEW_GROUP_DELAY_MS`)
  - Same group with new message: 200ms (`SAME_GROUP_DELAY_MS`)
- **Disabled mode**: When speech synthesis is active, typewriter effect is disabled and text displays immediately
- Completion callback triggers next auto-play action

#### Auto-play Behavior

1. Displays current message group with typewriter effect
2. Waits for typing to complete
3. Waits for configured delay (default: 2 seconds)
4. Advances to next message group (or next slide if no more groups)
5. Repeats until end of presentation

#### Audio Mode Coordination

The application has three mutually exclusive audio modes managed in `Home.tsx`:

1. **Typewriter mode** (`audioMode: "typewriter"`):
   - Plays typewriter sound effects during character-by-character animation
   - Uses `useAudioPlayer` hook
   - Typewriter effect enabled (45ms per character)

2. **Speech synthesis mode** (`audioMode: "speech"`):
   - Uses Web Speech API for text-to-speech
   - Uses `useSpeechSynthesis` hook
   - Typewriter effect **disabled** (text displays immediately)
   - Speech completion triggers `onTypingComplete` callback

3. **Silent mode** (`audioMode: "none"`):
   - No audio playback
   - Typewriter effect enabled (visual only)

**Important**: Only ONE audio system should be active at a time. Enabling one disables the other. In `SpeakerMessage`, effective callbacks change based on `audioMode` - speech mode uses no-op sound functions while routing completion events through speech synthesis.

#### PDF Processing

- Client-side PDF rendering using PDF.js canvas API
- Each page rendered as data URL and stored in memory
- PowerPoint files must be converted to PDF before upload

#### Fight Animation

- Triggered when a message group has `animation: "fight"` in the JSON script
- Managed by `useMessageGroupControl.triggerFightAnimation()`
- Rendered by `FightAnimation.tsx` component
- Displays battle-style visual effect during message group display

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

### State Management

- All state management is done via React hooks - no external state management library
- The hook composition pattern in `useSlidePresentation` requires careful dependency management to avoid circular dependencies
- Message groups are identified by unique IDs (`slide-{index}-group-{groupIndex}`) to track transitions
- Auto-play uses `isTypingComplete` flag to coordinate timing between typewriter effect and slide/group transitions

### Storage Persistence Pattern

- Audio and speech settings are persisted to localStorage
- Storage keys: `slide-navi-audio-settings`, `slide-navi-speech-settings`
- Hydration safety: uses `isInitializedRef` pattern to prevent double-loading during React hydration
- Settings are only saved AFTER initialization completes
- Includes migration logic for old storage key formats

### Timing Constants

Key timing values defined in `src/constants/`:

- `TYPEWRITER_DELAY_MS = 45` - Milliseconds per character for typewriter effect
- `AUDIO_PLAY_INTERVAL_MS = 90` - How often typewriter sound plays (double the typing rate)
- `ICON_ANIMATION_INTERVAL_MS = 150` - Speaker icon animation interval
- `CLEAR_EFFECT_DURATION_MS = 400` - Duration of clear effect animation between groups
- `NEW_GROUP_DELAY_MS = 300` - Delay before starting to type in a new message group
- `SAME_GROUP_DELAY_MS = 200` - Delay before typing continues in the same group

### Component Data Flow

```
Home.tsx (orchestrator)
├── Manages audioMode state (typewriter/speech/none)
├── Integrates useSlidePresentation, useAudioPlayer, useSpeechSynthesis
├── Passes audio settings and callbacks to children
│
├─→ SlideViewer
│   ├── Receives: slides, currentIndex, title, messages, speaker, messageGroupId
│   ├── Receives: showClearEffect, showFightAnimation flags
│   │
│   └─→ SpeakerMessage
│       ├── Integrates useTypewriterEffect with disabled flag based on audioMode
│       ├── Adapts callbacks: typewriter sounds OR speech synthesis based on audioMode
│       └── Triggers onTypingComplete when animation/speech finishes
│
└─→ ControlPanel (conditionally rendered by tab)
    ├── PDF upload section
    ├── Script editor with JSON parsing and error display
    ├── Auto-play controls
    └── Audio settings (mode, volume, rate, pitch)
```
