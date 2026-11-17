# DICOM Explorer

A web app for inspecting DICOM attributes and byte-level ranges.

## Features

- Upload a DICOM file or drag and drop.
- Left panel tree view of parsed DICOM attributes.
- Top-right details panel with selected attribute metadata and value previews.
- Bottom-right hex viewer with highlighted selected value byte ranges.
- Binary/long value previews are omitted or truncated in details.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm test
```

## End-to-End Tests

Install Playwright's browser once:

```bash
npx playwright install chromium
```

Run the E2E suite:

```bash
npm run test:e2e
```

For DICOM upload coverage, place a de-identified fixture at `test/fixtures/dicom/sample.dcm`.

The included Playwright test:
- always captures a homepage screenshot into `test-results/`
- uploads `test/fixtures/dicom/sample.dcm` when present and captures the loaded UI state instead

## Codex Cloud and Linear

Create a Codex Cloud environment with `petermtate/dicom-explorer` first in its
repository map. Set its manual setup command to `bash scripts/setup-codex-cloud.sh`.
The script runs `npm ci` and links the pinned pstack skills into
`~/.agents/skills`. Reset the environment cache when changing the pstack pin.

Install Codex for Linear and link your Linear account. Linear uses the default
branch of the first repository in the selected environment, so the setup script
must be on that branch. Name the repository and skill in the issue comment.

> @Codex In petermtate/dicom-explorer, use the pstack `in-your-own-words`
> skill to restate this issue. Report the skill file you loaded and leave
> repository files untouched.

Use this prompt in both a direct Cloud chat (without the mention) and a Linear
issue to check skill loading. The expected path ends in `in-your-own-words/SKILL.md`.
For implementation tasks, request `poteto-mode` explicitly. This setup installs
the skills only. The native plugin's SessionStart hook is separate.

[Codex Cloud setup](https://learn.chatgpt.com/docs/environments/cloud-environment) ·
[Codex for Linear](https://learn.chatgpt.com/docs/third-party/linear)
