# AGENTS.md

## Scope
This instruction file applies to the entire repository.

## Project summary
- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript.
- **Styling**: Tailwind CSS 4 plus project-wide `globals.css`.
- **Tooling**: ESLint, Prettier, Husky, lint-staged.

## Collaboration guidelines
- Prefer small, focused commits with descriptive messages.
- Run `npm run lint` before committing when changes touch TypeScript/TSX files.
- Keep components and hooks strongly typed; avoid use of `any` unless there is a documented reason.
- Co-locate component-specific styles (e.g., CSS modules) next to the component using them.
- When adding new utilities, place them in `src/utils/` and export named helpers.

## Frontend conventions
- Use functional React components with hooks; do not introduce class components.
- Keep components presentational where possible and move complex logic into hooks under `src/hooks/`.
- Follow existing prop naming patterns (`onX`, `isX`, etc.) for boolean or handler props.
- Ensure new UI remains accessible (semantic HTML, `aria` attributes when needed).

## Testing & verification
- Prefer `npm run lint` for quick validation.
- If you add behavior that can be unit-tested, create tests under `src/__tests__/`.
- Document any manual testing steps in the PR description when automated tests are not available.

