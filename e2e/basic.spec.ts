import { expect, Page, test } from "@playwright/test";

test("example", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("status")).toContainText("Service worker ready");
  await page.getByText("example").click();
  await testHtmlReport(page);
});

test("file input", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("status")).toContainText("Service worker ready");
  await page.locator('input[type="file"]').setInputFiles("docs/assets/vitest-html-reporter.zip");
  await testHtmlReport(page);
});

test("fetch error clears on drop recovery", async ({ page }) => {
  await page.goto("/?url=http://localhost:1/test.zip");
  await expect(page.getByTestId("fetch-error")).toContainText("likely blocked by CORS");
  await page.locator('input[type="file"]').setInputFiles("docs/assets/vitest-html-reporter.zip");
  await expect(page.getByTestId("fetch-error")).not.toBeVisible();
  await testHtmlReport(page);
});

async function testHtmlReport(page: Page) {
  await expect(page.getByTestId("status")).toContainText("Cached 7 files");
  const frame = page.frameLocator("iframe");
  await expect(frame.getByTestId("pass-entry")).toHaveText("6 Pass");
}
