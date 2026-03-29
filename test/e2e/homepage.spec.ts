import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const fixturePath = path.resolve(__dirname, "../fixtures/dicom/sample.dcm");
const hasFixture = fs.existsSync(fixturePath);

test("renders the homepage and captures a screenshot", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "DICOM Explorer" })).toBeVisible();
  await expect(page.getByText("Drop a DICOM file here or click to choose a file.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Attributes" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Attribute Details" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Hex Viewer" })).toBeVisible();

  if (hasFixture) {
    await page.locator('input[type="file"]').setInputFiles(fixturePath);
    await expect(page.getByText("Loaded file: sample.dcm")).toBeVisible();
    await expect(page.getByText("Select an attribute to inspect details.")).not.toBeVisible();
  }

  await page.screenshot({
    path: testInfo.outputPath(hasFixture ? "homepage-with-dicom.png" : "homepage.png"),
    fullPage: true
  });
});
