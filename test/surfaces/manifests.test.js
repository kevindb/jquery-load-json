import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const fileUrl = (file) => new URL(`../../${file}`, import.meta.url);
const read = (file) => readFileSync(fileUrl(file), "utf8");
const pkg = JSON.parse(read("package.json"));
const bower = JSON.parse(read("bower.json"));
const composer = JSON.parse(read("composer.json"));

const distFiles = [
  "dist/jquery.loadJSON.js",
  "dist/jquery.loadJSON.mjs",
  "dist/jquery.loadJSON.min.js",
];
const license = "LGPL-2.1-or-later";

describe("when the package manifests are read", () => {
  it("should point every entry point at a built dist file", () => {
    const entries = [
      pkg.main,
      pkg.module,
      pkg.browser,
      pkg.jsdelivr,
      pkg.unpkg,
      bower.main,
      ...composer.extra.component.scripts,
    ];

    for (const entry of entries) {
      expect(distFiles).toContain(entry);
      expect(existsSync(new URL(`../../${entry}`, import.meta.url))).toBe(true);
    }
  });

  it("should keep the classic build as main and the module build as module", () => {
    expect(pkg.main).toBe("dist/jquery.loadJSON.js");
    expect(pkg.module).toBe("dist/jquery.loadJSON.mjs");
  });

  it("should serve the minified classic build to browsers and CDNs", () => {
    expect(pkg.browser).toBe("dist/jquery.loadJSON.min.js");
    expect(pkg.jsdelivr).toBe("dist/jquery.loadJSON.min.js");
    expect(pkg.unpkg).toBe("dist/jquery.loadJSON.min.js");
  });

  it("should publish dist, src and the license", () => {
    expect(pkg.files).toEqual(["dist", "src", "LICENSE.md"]);
  });

  it("should agree on the version with every dist banner", () => {
    for (const file of distFiles) {
      expect(read(file).slice(0, 200)).toContain(`v${pkg.version}`);
    }
  });

  it("should give the README's CDN snippets the version and SRI hash of the minified build", () => {
    const hash = createHash("sha384").update(readFileSync(fileUrl("dist/jquery.loadJSON.min.js")));
    const integrity = `sha384-${hash.digest("base64")}`;

    const snippets = read("README.md").match(
      /<script src="https:\/\/[^"]+jquery-load-json@[^>]+>/g
    );

    expect(snippets.length).toBeGreaterThan(0);
    for (const snippet of snippets) {
      expect(snippet).toContain(`jquery-load-json@${pkg.version}/dist/jquery.loadJSON.min.js"`);
      expect(snippet).toContain(`integrity="${integrity}"`);
    }
  });

  it("should agree on the license", () => {
    expect(pkg.license).toBe(license);
    expect(bower.license).toBe(license);
    expect(composer.license).toBe(license);
  });

  it("should agree on the jQuery dependency range", () => {
    expect(pkg.dependencies.jquery).toBe(">=1.7");
    expect(bower.dependencies.jquery).toBe(">=1.7");
    expect(composer.require["components/jquery"]).toBe(">=1.7");
  });
});
