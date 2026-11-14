import { describe, expect, it } from "vitest";
import { fixture, texts } from "./helpers.js";

describe("content", function () {
  describe("when the html option is not set", function () {
    it("should insert a string as text, markup included", function () {
      const $root = fixture('<div><p class="a"></p></div>');

      $root.loadJSON({ a: '<img src="x" onerror="alert(1)">' });

      expect($root.find(".a").text()).toBe('<img src="x" onerror="alert(1)">');
      expect($root.find("img").length).toBe(0);
    });

    it("should insert a number as text", function () {
      const $root = fixture('<div><p class="a">old</p></div>');

      $root.loadJSON({ a: 5 });

      expect($root.find(".a").html()).toBe("5");
    });
  });

  describe("when the html option is true", function () {
    it("should insert a string as HTML", function () {
      const $root = fixture('<div><p class="a"></p></div>');

      $root.loadJSON({ a: "<b>bold</b>" }, { html: true });

      expect($root.find(".a b").text()).toBe("bold");
    });

    it("should insert HTML into nested keys and repeats too", function () {
      const $root = fixture(
        '<div><div class="o"><p class="a"></p></div><ul><li class="i"></li></ul></div>'
      );

      $root.loadJSON({ o: { a: "<b>nested</b>" }, i: ["<b>1</b>", "<b>2</b>"] }, { html: true });

      expect($root.find(".a b").text()).toBe("nested");
      expect(texts($root.find(".i b"))).toEqual(["1", "2"]);
    });
  });

  describe("when the html option is false", function () {
    it("should insert a string as text", function () {
      const $root = fixture('<div><p class="a"></p></div>');

      $root.loadJSON({ a: "<b>x</b>" }, { html: false });

      expect($root.find(".a").text()).toBe("<b>x</b>");
    });
  });
});
