import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// The URL-argument tests request JSON fixtures from /fixtures/<file>.json, served as a real server
// would (application/json), without Vite turning them into modules.
const jsonFixtures = {
  name: "json-fixtures",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const match = req.url.match(/^\/fixtures\/([\w.-]+\.json)(\?.*)?$/);
      if (!match) {
        return next();
      }
      try {
        const body = await readFile(new URL(`./test/fixtures/${match[1]}`, import.meta.url));
        res.setHeader("Content-Type", "application/json");
        res.end(body);
      } catch {
        res.statusCode = 404;
        res.end("not found");
      }
    });
  },
};

// Surface pages load files as consumers would, without Vite rewriting bare imports.
const rawFiles = {
  name: "raw-files",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const match = req.url.match(/^\/raw\/((?:dist|node_modules)\/[\w./@-]+\.m?js)$/);
      if (!match) {
        return next();
      }
      try {
        const body = await readFile(new URL(`./${match[1]}`, import.meta.url));
        res.setHeader("Content-Type", "text/javascript");
        res.end(body);
      } catch {
        res.statusCode = 404;
        res.end("not found");
      }
    });
  },
};

const jqueryEsm = new URL("./test/jquery-esm.js", import.meta.url);

// JQUERY_FILE picks the classic jQuery build: 3.5.1, 3.7.1 and 4.0.0 come from the jquery35, jquery3
// and jquery4 dev dependencies.
const jqueryFile = fileURLToPath(
  new URL(
    process.env.JQUERY_FILE || "./node_modules/jquery3/dist/jquery.js",
    `file://${process.cwd()}/`
  )
);

// jQuery builds are classic scripts that set window.jQuery. Appending an export gives the suite a
// default import without Vite's CommonJS interop, for every version in the matrix.
const jqueryAsModule = {
  name: "jquery-as-module",
  enforce: "pre",
  transform(code, id) {
    if (id.split("?")[0] === jqueryFile) {
      return { code: `${code}\nexport default window.jQuery;\n`, map: null };
    }
  },
};

// The suite runs in each browser as suite-chromium, suite-firefox and suite-webkit. V8 coverage only
// exists in Chromium, so npm test runs the other two in a second run.
const suiteBrowsers = ["chromium", "firefox", "webkit"];

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      reporter: ["text", "html"],
      thresholds: { 100: true },
    },
    projects: [
      {
        plugins: [jqueryAsModule, jsonFixtures],
        test: {
          name: "suite",
          alias: [
            { find: /^jquery$/, replacement: fileURLToPath(jqueryEsm) },
            { find: /^jquery-file$/, replacement: jqueryFile },
          ],
          include: ["test/suite/**/*.test.js"],
          setupFiles: ["test/setup.js"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: suiteBrowsers.map((name) => ({ browser: name, name: `suite-${name}` })),
          },
        },
      },
      {
        plugins: [rawFiles],
        test: {
          name: "surfaces",
          include: ["test/surfaces/browser.test.js"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        test: {
          name: "commonjs",
          include: [
            "test/surfaces/bundlers.test.js",
            "test/surfaces/commonjs.test.js",
            "test/surfaces/manifests.test.js",
          ],
          environment: "node",
        },
      },
    ],
  },
});
