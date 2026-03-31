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

async function testHtmlReport(page: Page) {
  await expect(page.getByTestId("status")).toContainText("Cached 7 files");
  const frame = page.frameLocator("iframe");
  await expect(frame.getByTestId("pass-entry")).toHaveText("6 Pass");
}
