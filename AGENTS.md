# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 14 app for inspecting DICOM attributes and raw bytes. Main routes live in `src/app/`, with the primary UI in `src/app/page.tsx`. Reusable interface pieces are in `src/components/`, parsing and lookup helpers are in `src/lib/`, shared types are in `src/types/`, and global styles live in `src/styles/globals.css`. Tests live in `test/`. Keep new code close to the feature it supports.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local dev server at `http://localhost:3000`.
- `npm run build`: produce a production build and catch type/build regressions.
- `npm run start`: serve the production build locally after a successful build.
- `npm test`: run the full Vitest suite.
- `npm test -- test/AttributeDetailsPanel.test.tsx`: run a focused test file during development.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and the existing import alias style such as `@/components/...`. Follow the current formatting already in the repo: 2-space indentation, semicolons, and double quotes. Name React components in PascalCase, utility modules in camelCase, and test files as `*.test.ts` or `*.test.tsx`. Prefer small helpers in `src/lib/` for shared formatting or parsing logic instead of duplicating string manipulation in components.

## Testing Guidelines
Tests use Vitest with Testing Library and `jsdom`. Add or update tests whenever UI rendering, parsing behavior, or formatting logic changes. Keep tests near the existing patterns in `test/`, for example `test/formatDicomTag.test.ts` for pure helpers and `test/AttributeDetailsPanel.test.tsx` for component behavior. Focus assertions on user-visible output and important parser edge cases.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `Build initial DICOM explorer web app` and `Adjust attribute details layout and tag formatting`. Follow that pattern: one clear sentence describing the change. For pull requests, include a concise description, testing notes, and screenshots or screen recordings for visible UI changes. Link the related issue when applicable.

## Deployment & Configuration Notes
Vercel is configured for deployment, and `.vercel` is ignored in Git. Do not commit sample DICOM files containing sensitive data. Use de-identified fixtures only.
