# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **SlideNavi** application - a PDF slide presenter with speaker notes and auto-play functionality. Built with Next.js 15 (App Router), React 19, TypeScript, and PDF.js for rendering PDF slides with real-time typewriter message effects.

## Architecture

### Core Components

- **`src/app/page.tsx`**: Main application entry point that orchestrates the entire slide presentation logic including:
  - PDF loading and rendering via PDF.js
  - Script parsing and page synchronization
  - Auto-play functionality with configurable delays
  - State management for slides, scripts, and presentation settings

- **`src/components/SlideViewer.tsx`**: Primary viewer component featuring:
  - Slide display with navigation controls
  - Typewriter effect for speaker messages (45ms delay per character)
  - Speaker info display with customizable icon

- **`src/components/ControlsPanel.tsx`**: Control interface providing:
  - PDF upload functionality
  - Speaker name and icon customization
  - Script editor with page-based segmentation (empty lines as separators)
  - Auto-play controls with timing configuration
  - Page jump navigation for loaded slides

### Key Features

- **Script System**: Scripts are split by double line breaks to match slide pages
- **Typewriter Effect**: Messages animate character-by-character for engagement
- **PDF Processing**: Client-side PDF rendering using canvas API
- **Auto-play**: Automatic slide advancement with configurable intervals

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
- **Styling**: CSS Modules (SCSS) + Tailwind CSS 4
- **PDF Handling**: pdfjs-dist for client-side PDF rendering
- **State Management**: React hooks (useState, useCallback, useMemo)
- **Code Quality**: ESLint, Prettier, Husky with lint-staged