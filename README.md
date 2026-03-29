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
