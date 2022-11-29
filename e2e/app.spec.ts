import { test, expect } from "@playwright/test";

// See here how to get started:
// https://playwright.dev/docs/intro
test("adds a new entry to the list", async ({ page }) => {
  await page.goto("/");

  const newLabel = page.getByTestId("new-label");
  await newLabel.fill("Wood");
  await newLabel.blur();

  const newValue = page.getByTestId("new-value");
  await newValue.fill("123");
  await newValue.blur();

  const createdLabel = page.getByTestId("static-label").last();
  const createdValue = page.getByTestId("existing-value").last();

  await expect(createdLabel).toHaveText("Wood");
  await expect(createdValue).toHaveValue("123.0");
});
