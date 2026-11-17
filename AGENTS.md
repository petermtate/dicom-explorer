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
- `npm run test:e2e`: run the Playwright browser tests.
- `npx tsc --noEmit`: check TypeScript types.
- No lint script or lint tooling is currently configured. Establish tooling before requiring a lint check.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and the existing import alias style such as `@/components/...`. Follow the current formatting already in the repo: 2-space indentation, semicolons, and double quotes. Name React components in PascalCase, utility modules in camelCase, and test files as `*.test.ts` or `*.test.tsx`. Prefer small helpers in `src/lib/` for shared formatting or parsing logic instead of duplicating string manipulation in components.

## Testing Guidelines
Tests use Vitest with Testing Library and `jsdom`. Add or update tests whenever UI rendering, parsing behavior, or formatting logic changes. Keep tests near the existing patterns in `test/`, for example `test/formatDicomTag.test.ts` for pure helpers and `test/AttributeDetailsPanel.test.tsx` for component behavior. Focus assertions on user-visible output and important parser edge cases.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `Build initial DICOM explorer web app` and `Adjust attribute details layout and tag formatting`. Follow that pattern: one clear sentence describing the change. For pull requests, include a concise description, testing notes, and screenshots or screen recordings for visible UI changes. Link the related issue when applicable.

## Deployment & Configuration Notes
Vercel is configured for deployment, and `.vercel` is ignored in Git. Do not commit sample DICOM files containing sensitive data. Use de-identified fixtures only.

## Mission
Ship small, correct, reviewable changes linked to Linear issues when provided, with Vercel preview verification when deployed.

## Core workflow
1. Start from the linked Linear issue when provided; otherwise use the explicit user request as the source of requirements.
2. Restate the task in your own words before coding.
3. Define scope, non-goals, risks, and validation steps.
4. Make the smallest viable change.
5. Run required checks.
6. Summarize exactly what changed, how it was tested, and any follow-ups.

## Scope rules
- Do not expand scope beyond the issue or explicit user request unless explicitly requested.
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
- `npm test -- <test-file>` for changed logic, or `npm test` when broader coverage is needed
- relevant Playwright browser checks with `npm run test:e2e -- <test-file>` for visible behavior
- `npx tsc --noEmit` for TypeScript changes
- lint once lint tooling and a script are configured
- `npm run build` if the change affects app wiring, routing, config, or deployment behavior

For documentation-only changes, inspect the diff and run `git diff --check`; app checks are not required.

If tests are not possible, explain why and give a manual verification plan.

## Linear rules
- Use the linked Linear issue as the source of truth when provided; otherwise use the explicit user request. Setup and maintenance tasks do not require an issue.
- Map implementation back to the issue's acceptance criteria or the user's requested outcome.
- Surface assumptions, blockers, and out-of-scope findings clearly.
- In summaries, include:
  - what was implemented
  - what remains
  - risks or follow-ups

## Vercel rules
- Treat preview deployment behavior as the source of truth for deployability.
- When deployed, include the preview URL and verification results. Explicitly report when preview validation remains outstanding; local checks alone do not establish preview behavior.
- For preview/build failures, inspect:
  - build logs
  - framework config
  - env var usage
  - runtime choice
  - routing / middleware / caching behavior
- Do not rename env vars casually.
- Call out any change that requires Vercel project settings updates.

## PR expectations
Implementation final summaries and PR descriptions should include:
- Problem
- Approach
- Files changed
- Validation
- Risks
- Linked Linear issue, when provided

Keep help, review, and setup responses proportional to the task; they do not require this six-field summary.

## Agent role behavior
When acting as Planner:
- do not write code until scope and validation are clear

When acting as Builder:
- implement only the scoped task
- prefer incremental commits / checkpoints

When acting as Reviewer:
- review against the issue or explicit user request, acceptance criteria, and regression risk

When acting as Vercel Debugger:
- prioritize deployment, runtime, and environment correctness over code style


## Pstack skill orchestration

Use installed Pstack skills when they are available
and appropriate to the issue or explicit user request.

- Planner: investigate requirements, scope and risks.
- Builder: implement the approved scope.
- Reviewer: independently assess correctness,
  acceptance criteria and regression risks.
- Vercel Debugger: investigate deployment failures.

Use the Pstack poteto-mode workflow for changes touching
more than one file, changes to signatures called by other
files, design or architecture decisions, bugs whose cause
is not yet known, and performance work.

For small fixes, prefer a focused implementation
rather than unnecessary multi-agent orchestration.

Never assume a skill ran successfully. If a
requested skill is unavailable, report that fact
and follow the existing repository workflow.

Existing repository instructions and Linear
acceptance criteria take precedence over
generic skill recommendations.

<!-- pstack-models:start -->
## Pstack model overrides

These repository-specific role settings override pstack skill defaults and any global model overrides. Use them in local and cloud agents when the configured models are available; report unavailable models before substituting another model.

feature, refactoring: gpt-6.1-sol
bug-fix: gpt-6.1-sol
perf-issue: gpt-6.1-sol
hillclimb: gpt-6.1-sol
judgment and prose: gpt-6.1-sol
strongest judgment: gpt-6-astra
how explorer: gpt-6.1-sol
how explainer: gpt-6.1-sol
why investigators: gpt-6.1-sol
why synthesizer: gpt-6.1-sol
reflect tooling: gpt-6.1-sol
reflect judgment, divergent, synthesizer: gpt-6.1-sol
arena runners: gpt-6.1-sol, gpt-6.1-terra, gpt-6-astra
arena cross-judge pool: gpt-6-astra, gpt-6.1-terra, gpt-6.1-sol
swarm workers: gpt-6.1-sol
architect runners: gpt-6.1-sol, gpt-6.1-terra, gpt-6-astra
interrogate reviewers: gpt-6.1-sol, gpt-6.1-terra, gpt-6-astra
thermos reviewers: gpt-6.1-sol
no-comments reviewer: gpt-6.1-sol

default effort: medium
<!-- pstack-models:end -->
