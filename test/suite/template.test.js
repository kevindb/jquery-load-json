import { describe, expect, it } from "vitest";
import { fixture, texts } from "./helpers.js";

describe("template reuse", function () {
  describe("when the same element is loaded twice", function () {
    it("should load into the output of the first call", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');
      $root.loadJSON({ i: ["a", "b"] });

      $root.loadJSON({ i: ["c"] });

      expect(texts($root.find(".i"))).toEqual(["c", "b"]);
    });

    it.fails("should start again from the original markup", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');
      $root.loadJSON({ i: ["a", "b"] });

      $root.loadJSON({ i: ["c"] });

      expect(texts($root.find(".i"))).toEqual(["c"]);
    });
  });

  describe("when the loadJSON-template data is set to null first", function () {
    it("should save the markup and restore it on the next call", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');
      $root.data("loadJSON-template", null);
      $root.loadJSON({ i: ["a", "b"] });

      $root.loadJSON({ i: ["c"] });

      expect(texts($root.find(".i"))).toEqual(["c"]);
    });
  });

  describe("when the loadJSON-template data holds markup", function () {
    it("should replace the element's content with it before loading", function () {
      const $root = fixture('<div><span class="old"></span></div>');
      $root.data("loadJSON-template", '<b class="a"></b>');

      $root.loadJSON({ a: "x" });

      expect($root.html()).toBe('<b class="a">x</b>');
    });
  });
});
