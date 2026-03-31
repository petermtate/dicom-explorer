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

## Mission
Ship small, correct, reviewable changes linked to Linear issues and verified in Vercel previews.

## Core workflow
1. Start from the linked Linear issue.
2. Restate the task in your own words before coding.
3. Define scope, non-goals, risks, and validation steps.
4. Make the smallest viable change.
5. Run required checks.
6. Summarize exactly what changed, how it was tested, and any follow-ups.

## Scope rules
- Do not expand scope beyond the issue unless explicitly requested.
- Prefer small PRs over broad refactors.
- Flag ambiguity instead of guessing on product behavior.
- If a change suggests follow-up work, note it separately rather than bundling it in.

## Coding rules
- Follow existing project conventions before introducing new patterns.
- Reuse existing utilities, components, and data access layers where possible.
- Keep functions and components focused.
- Avoid unrelated renames or formatting churn.
- Add comments only when they explain intent, not obvious mechanics.

## Testing and validation
Before finishing, run the smallest relevant set of checks:
- unit tests covering changed logic
- lint
- typecheck
- build if the change affects app wiring, routing, config, or deployment behavior

If tests are not possible, explain why and give a manual verification plan.

## Linear rules
- Use the Linear issue as the source of truth for requirements.
- Map implementation back to acceptance criteria.
- Surface assumptions, blockers, and out-of-scope findings clearly.
- In summaries, include:
  - what was implemented
  - what remains
  - risks or follow-ups

## Vercel rules
- Treat preview deployment behavior as the source of truth for deployability.
- For preview/build failures, inspect:
  - build logs
  - framework config
  - env var usage
  - runtime choice
  - routing / middleware / caching behavior
- Do not rename env vars casually.
- Call out any change that requires Vercel project settings updates.

## PR expectations
Every final summary or PR description should include:
- Problem
- Approach
- Files changed
- Validation
- Risks
- Linked Linear issue

## Agent role behavior
When acting as Planner:
- do not write code until scope and validation are clear

When acting as Builder:
- implement only the scoped task
- prefer incremental commits / checkpoints

When acting as Reviewer:
- review against the issue, acceptance criteria, and regression risk

When acting as Vercel Debugger:
- prioritize deployment, runtime, and environment correctness over code style