# next-js-template

This repository packages my go-to Next.js setup so new projects can start from a consistent, production-friendly baseline.

## What\'s inside

- Next.js 15 App Router with React 19 and TypeScript already wired up.
- Tailwind CSS 4 configured via the new @tailwindcss/postcss plugin and project-wide globals.css.
- Opinionated linting/formatting with ESLint, Prettier, and matching configs.
- Husky + lint-staged to keep commits clean by running
  pm run format and
  pm run lint on staged files.
- Turbopack-powered dev and uild scripts for faster feedback loops.

## Usage

1. Install dependencies:
   pm install.
2. Start developing:
   pm run dev.
3. Build for production:
   pm run build.
4. Preview production build locally:
   pm run start (after building).

## Project layout

- src/app contains the default App Router entry point (layout.tsx, page.tsx) and global styles.
- public holds static assets like favicons and logos.
- Root-level config files ( sconfig.json, eslint.config.mjs, postcss.config.mjs, etc.) are preconfigured for the stack above.

## Customization tips

- Update src/app/layout.tsx metadata and fonts to match the new project.
- Replace the sample landing page in src/app/page.tsx with your own UI.
- Adjust linting or formatting rules in eslint.config.mjs and .prettierrc (if added) to suit team preferences.
- Add or tweak Husky hooks under .husky/ if you need additional pre-commit checks.
