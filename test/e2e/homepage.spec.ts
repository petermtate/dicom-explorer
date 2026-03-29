import { expect, test } from "@playwright/test";

test("renders the homepage and captures a screenshot", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "DICOM Explorer" })).toBeVisible();
  await expect(page.getByText("Drop a DICOM file here or click to choose a file.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Attributes" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Attribute Details" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Hex Viewer" })).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("homepage.png"),
    fullPage: true
  });
});
