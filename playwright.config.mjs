import { defineConfig } from "@playwright/test";

// End-to-end tests (npm run test:e2e): the built plugin in a real page, loading JSON from the test
// server in test/e2e/server.mjs. JQUERY_FILE picks the classic jQuery build.
const port = Number(process.env.E2E_PORT || 4320);

export default defineConfig({
  testDir: "test/e2e",
  testMatch: "*.spec.mjs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: ["chromium", "firefox", "webkit"].map((name) => ({ name, use: { browserName: name } })),
  webServer: {
    command: "node test/e2e/server.mjs",
    url: `http://127.0.0.1:${port}/page`,
    reuseExistingServer: false,
  },
});
