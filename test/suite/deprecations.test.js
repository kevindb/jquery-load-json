import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fixture } from "./helpers.js";

// Notices show once per page, and each test file runs in its own page, so every test below
// triggers a different notice.
describe("deprecation notices", function () {
  let warn;

  beforeEach(function () {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(function () {
    $.fn.loadJSON.debug = false;
    warn.mockRestore();
  });

  function warnings() {
    return warn.mock.calls.map((call) => call[0]);
  }

  describe("when debug is off", function () {
    it("should be off by default and warn about nothing", function () {
      const $root = fixture('<div><span rel="a"></span></div>');

      $root.loadJSON({ a: "<b>x</b>" });

      expect($.fn.loadJSON.debug).toBe(false);
      expect(warnings()).toEqual([]);
    });
  });

  // These run before the tests below, so that each notice they rule out has not been shown yet.
  describe("when debug is on, first in the page", function () {
    beforeEach(function () {
      $.fn.loadJSON.debug = true;
    });

    it('should not warn about "src$alt" for a string without $', function () {
      const $root = fixture('<div><img class="p"></div>');

      $root.loadJSON({ p: "data:,a" });

      expect(warnings().join()).not.toContain("src$alt");
    });

    it("should not warn about the top-level fallback when there is none", function () {
      const $root = fixture('<div><img class="p"></div>');

      $root.loadJSON({ p: 1 });

      expect(warnings().join()).not.toContain("top-level");
    });

    it("should not warn about HTML for plain text", function () {
      const $root = fixture('<div><span class="a"></span></div>');

      $root.loadJSON({ a: "a < b" });

      expect(warnings().join()).not.toContain("inserted as HTML");
    });
  });

  describe("when debug is on", function () {
    beforeEach(function () {
      $.fn.loadJSON.debug = true;
    });

    it('should warn about an image value in the "src$alt" format', function () {
      const $root = fixture('<div><img class="p"></div>');

      $root.loadJSON({ p: "data:,a$Alt" });

      expect(warnings().join()).toContain("src$alt");
    });

    it("should warn when an image takes the top-level src, alt and title", function () {
      const $root = fixture('<div><img class="p"></div>');

      $root.loadJSON({ p: 1, title: "Top" });

      expect(warnings().join()).toContain("top-level src, alt and title");
    });

    it("should warn when a key matches by rel", function () {
      const $root = fixture('<div><span rel="r"></span></div>');

      $root.loadJSON({ r: "x" });

      expect(warnings().join()).toContain("rel attribute");
    });

    it("should warn when array items go into rel index children", function () {
      const $root = fixture('<div><ul class="l"><li rel="0"></li></ul></div>');

      $root.loadJSON({ l: ["zero"] });

      expect(warnings().join()).toContain('rel="index"');
    });

    it("should warn when given a URL, once per page", function () {
      const $root = fixture("<div></div>");

      $root.loadJSON("/fixtures/missing.json");
      $root.loadJSON("/fixtures/missing.json");

      expect(warnings()[0]).toMatch(/^jQuery loadJSON: /);
      expect(warnings().filter((text) => text.includes("Passing a URL"))).toHaveLength(1);
    });

    it("should warn when a string that looks like markup is inserted as HTML", function () {
      const $root = fixture('<div><span class="a"></span></div>');

      $root.loadJSON({ a: "<b>x</b>" });

      expect(warnings().join()).toContain("inserted as HTML");
    });
  });
});
