import { cpSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { rolldown } from "rolldown";

const root = fileURLToPath(new URL("../..", import.meta.url));
const jQueryDir = join(root, "node_modules", "jquery4");

let projectDir;

// A consumer project with jQuery and the package installed as npm would lay it out.
function consumerProject(entry) {
  projectDir = mkdtempSync(join(tmpdir(), "jquery-load-json-bundle-"));
  const installed = join(projectDir, "node_modules", "jquery-load-json");
  cpSync(join(root, "package.json"), join(installed, "package.json"));
  cpSync(join(root, "dist"), join(installed, "dist"), { recursive: true });
  symlinkSync(jQueryDir, join(projectDir, "node_modules", "jquery"), "dir");
  writeFileSync(join(projectDir, "entry.js"), entry);
  return join(projectDir, "entry.js");
}

afterEach(function () {
  rmSync(projectDir, { recursive: true, force: true });
});

describe("when a bundler builds an app that imports the package", function () {
  it("should register loadJSON on the app's jQuery", async function () {
    const input = consumerProject(
      'import $ from "jquery";\nimport "jquery-load-json";\nwindow.loadJSONType = typeof $.fn.loadJSON;\n'
    );
    const window = new JSDOM("", { runScripts: "outside-only" }).window;

    const bundle = await rolldown({ input, platform: "browser", logLevel: "silent" });
    const { output } = await bundle.generate({ format: "iife" });
    window.eval(output[0].code);

    expect(window.loadJSONType).toBe("function");
  });
});
