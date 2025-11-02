# Slide Navi

Slide Navi is a Next.js application for rehearsing slide presentations. Upload a PDF deck, write a companion script, and rehearse with synchronized slide playback, typewriter-style audio cues, or speech synthesis.

## Summary
- Upload a PDF to preview individual slides with navigation controls.
- Draft and manage narration scripts with automatic grouping by slide.
- Rehearse with auto-play, timing controls, and either typewriter sound effects or speech synthesis.
- Store audio preferences in local storage so rehearsal settings persist across sessions.

## Getting started
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview the production build locally: `npm run start`

## Project layout
- `src/app` – App Router entry point and global styles.
- `src/components` – UI building blocks such as the slide viewer, control panel, and header.
- `src/hooks` – Custom hooks for PDF handling, slide playback, audio controls, and speech synthesis.
- `src/utils` – Helper utilities including audio generation helpers.
- Root-level config files (`tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, etc.) configure the toolchain.

## Key technologies
- Next.js 15 with React 19 and the App Router.
- Tailwind CSS 4 for utility-first styling.
- ESLint, Prettier, Husky, and lint-staged for consistent formatting and linting.

## Additional documentation
A Japanese version of this README is available at [README.ja.md](README.ja.md).
