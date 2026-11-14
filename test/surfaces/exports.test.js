import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../..", import.meta.url));

let projectDir;
let installed;

// A consumer project with the package installed as npm would lay it out, src included.
beforeAll(function () {
  projectDir = realpathSync(mkdtempSync(join(tmpdir(), "jquery-load-json-exports-")));
  installed = join(projectDir, "node_modules", "jquery-load-json");
  for (const entry of ["package.json", "dist", "src"]) {
    cpSync(join(root, entry), join(installed, entry), { recursive: true });
  }
});

afterAll(function () {
  rmSync(projectDir, { recursive: true, force: true });
});

// Resolves a specifier from the consumer project with Node, as an import and as a require.
// Returns the resolved path relative to the package, or the error code.
function resolve(specifier) {
  const script = `
    const result = {};
    try {
      result.import = new URL(import.meta.resolve(${JSON.stringify(specifier)})).pathname;
    } catch (error) {
      result.import = error.code;
    }
    try {
      result.require = (await import("node:module")).createRequire(process.cwd() + "/").resolve(${JSON.stringify(specifier)});
    } catch (error) {
      result.require = error.code;
    }
    console.log(JSON.stringify(result));
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: projectDir,
  });
  const result = JSON.parse(output);
  const relative = (path) => path.replace(installed + "/", "");

  return { import: relative(result.import), require: relative(result.require) };
}

describe("when a consumer resolves the package by name", function () {
  it("should give import the module build and require the classic build", function () {
    const resolved = resolve("jquery-load-json");

    expect(resolved).toEqual({
      import: "dist/jquery.loadJSON.mjs",
      require: "dist/jquery.loadJSON.js",
    });
  });
});

describe("when a consumer resolves a build by its path", function () {
  for (const file of [
    "dist/jquery.loadJSON.js",
    "dist/jquery.loadJSON.mjs",
    "dist/jquery.loadJSON.min.js",
    "package.json",
  ]) {
    it(`should allow ${file}`, function () {
      const resolved = resolve(`jquery-load-json/${file}`);

      expect(resolved).toEqual({ import: file, require: file });
    });
  }
});

describe("when a consumer deep-imports any other file", function () {
  for (const file of [
    "src/jquery.loadJSON.js",
    "src/element-kinds.js",
    "dist/jquery.loadJSON",
    "dist/jquery.loadJSON.min.js.map",
  ]) {
    it(`should block ${file}`, function () {
      const resolved = resolve(`jquery-load-json/${file}`);

      expect(resolved).toEqual({
        import: "ERR_PACKAGE_PATH_NOT_EXPORTED",
        require: "ERR_PACKAGE_PATH_NOT_EXPORTED",
      });
    });
  }
});
