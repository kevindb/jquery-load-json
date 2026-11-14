import { describe, expect, it } from "vitest";
import { fixture, texts } from "./helpers.js";

describe("arrays", function () {
  describe("when a key's value is an array", function () {
    it("should fill the matching element and add a copy of the last one per extra item", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');

      $root.loadJSON({ i: ["a", "b", "c"] });

      expect(texts($root.find(".i"))).toEqual(["a", "b", "c"]);
    });

    it("should load objects into each copy", function () {
      const $root = fixture('<div><div class="row"><b class="n"></b><i class="m"></i></div></div>');

      $root.loadJSON({
        row: [
          { n: 1, m: "x" },
          { n: 2, m: "y" },
        ],
      });

      expect(texts($root.find(".n"))).toEqual(["1", "2"]);
      expect(texts($root.find(".m"))).toEqual(["x", "y"]);
    });

    it("should fill existing elements in order before adding copies", function () {
      const $root = fixture('<div><ul><li class="i">1</li><li class="i">2</li></ul></div>');

      $root.loadJSON({ i: ["a", "b", "c"] });

      expect(texts($root.find(".i"))).toEqual(["a", "b", "c"]);
    });

    it("should leave extra existing elements unchanged when the array is shorter", function () {
      const $root = fixture(
        '<div><ul><li class="i">1</li><li class="i">2</li><li class="i">3</li></ul></div>'
      );

      $root.loadJSON({ i: ["a"] });

      expect(texts($root.find(".i"))).toEqual(["a", "2", "3"]);
    });

    it("should leave the element unchanged for an empty array", function () {
      const $root = fixture('<div><ul><li class="i">1</li></ul></div>');

      $root.loadJSON({ i: [] });

      expect(texts($root.find(".i"))).toEqual(["1"]);
    });

    it("should copy event handlers to the added elements", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');
      const clicked = [];
      $root.find(".i").on("click", function () {
        clicked.push($(this).text());
      });

      $root.loadJSON({ i: ["a", "b"] });
      $root.find(".i").trigger("click");

      expect(clicked).toEqual(["a", "b"]);
    });
  });

  describe("when the array's container has rel children", function () {
    it("should repeat the container, not fill the children by rel index", function () {
      const $root = fixture('<div><ul class="l"><li rel="1"></li><li rel="0"></li></ul></div>');

      $root.loadJSON({ l: ["zero", "one"] });

      expect(texts($root.find(".l"))).toEqual(["zero", "one"]);
    });
  });

  describe("when loading an array into the loaded element itself", function () {
    it("should fill a jQuery-wrapped element passed through a key", function () {
      const $root = fixture('<div><p class="p"></p></div>');

      $root.loadJSON({ p: [1, 2] });

      expect(texts($root.find(".p"))).toEqual(["1", "2"]);
    });

    it("should repeat an element that is not a select or form, once per item", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');

      $root.find("ul").loadJSON([{ i: 1 }, { i: 2 }]);

      expect($root.find("ul").length).toBe(2);
      expect(texts($root.find(".i"))).toEqual(["1", "2"]);
    });

    it("should load each item into a copy of the element (#28)", function () {
      const $root = fixture('<div><p class="item"><b class="n"></b></p></div>');

      $root.find(".item").loadJSON([{ n: 1 }, { n: 2 }]);

      expect(texts($root.find(".n"))).toEqual(["1", "2"]);
    });
  });

  describe("when loading checkboxes from an array of values", function () {
    it("should check each box in the group separately", function () {
      const $form = fixture(
        '<form><input type="checkbox" name="c" value="a"><input type="checkbox" name="c" value="b"></form>'
      );

      $form.loadJSON({ c: ["a"] });

      expect($form.find("input")[0].checked).toBe(true);
      expect($form.find("input")[1].checked).toBe(false);
    });
  });
});
