import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/page");
});

test.describe("when the published plugin loads JSON fetched with $.getJSON", () => {
  test("should fill the matching elements", async ({ page }) => {
    await page.evaluate(() =>
      $.getJSON("/data/person.json").then((data) => {
        $("#person").loadJSON(data);
      })
    );

    await expect(page.locator("#person .name")).toHaveText("Ada Lovelace");
    await expect(page.locator("#person .city")).toHaveText("London");
  });
});

test.describe("when the published plugin loads an object into a form", () => {
  test("should set inputs, selects and checkboxes", async ({ page }) => {
    await page.evaluate(() => {
      $("#form").loadJSON({ email: "ada@example.com", country: "fr", tags: ["b"] });
    });

    await expect(page.locator("[name=email]")).toHaveValue("ada@example.com");
    await expect(page.locator("[name=country]")).toHaveValue("fr");
    await expect(page.locator("[name=tags][value=a]")).not.toBeChecked();
    await expect(page.locator("[name=tags][value=b]")).toBeChecked();
  });
});
