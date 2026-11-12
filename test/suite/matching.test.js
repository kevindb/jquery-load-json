import { describe, expect, it } from "vitest";
import { fixture } from "./helpers.js";

describe("element matching", function () {
  describe("when a key matches an element", function () {
    it("should match by class", function () {
      const $root = fixture('<div><span class="a"></span></div>');

      $root.loadJSON({ a: "class" });

      expect($root.find(".a").text()).toBe("class");
    });

    it("should match by id", function () {
      const $root = fixture('<div><span id="a"></span></div>');

      $root.loadJSON({ a: "id" });

      expect($root.find("#a").text()).toBe("id");
    });

    it("should match by name, including names with brackets", function () {
      const $root = fixture('<form><input name="user[email]"></form>');

      $root.loadJSON({ "user[email]": "a@b.c" });

      expect($root.find("input").val()).toBe("a@b.c");
    });

    it("should match by rel", function () {
      const $root = fixture('<div><span rel="a"></span></div>');

      $root.loadJSON({ a: "rel" });

      expect($root.find("span").text()).toBe("rel");
    });

    it("should load every element with the matching class", function () {
      const $root = fixture('<div><span class="a"></span><em class="a"></em></div>');

      $root.loadJSON({ a: "both" });

      expect($root.find(".a").text()).toBe("bothboth");
    });
  });

  describe("when several attributes could match", function () {
    it("should prefer class over id, name and rel", function () {
      const $root = fixture(
        '<div><span class="a"></span><span id="a"></span><input name="a"><b rel="a"></b></div>'
      );

      $root.loadJSON({ a: "x" });

      expect($root.find(".a").text()).toBe("x");
      expect($root.find("#a").text()).toBe("");
      expect($root.find("input").val()).toBe("");
      expect($root.find("b").text()).toBe("");
    });

    it("should prefer id over name", function () {
      const $root = fixture('<form><input id="a"><input name="a"></form>');

      $root.loadJSON({ a: "x" });

      expect($root.find("#a").val()).toBe("x");
      expect($root.find("[name=a]").val()).toBe("");
    });
  });

  describe("when a key matches nothing", function () {
    it("should skip it", function () {
      const $root = fixture('<div><span class="a">keep</span></div>');

      $root.loadJSON({ missing: "x" });

      expect($root.html()).toBe('<span class="a">keep</span>');
    });

    it("should skip an empty key", function () {
      const $root = fixture('<div><span class="a">keep</span></div>');

      $root.loadJSON({ "": "x" });

      expect($root.find(".a").text()).toBe("keep");
    });
  });

  describe("when a value is null or undefined", function () {
    it("should leave the element unchanged", function () {
      const $root = fixture('<div><span class="a">keep</span><span class="b">keep</span></div>');

      $root.loadJSON({ a: null, b: undefined });

      expect($root.text()).toBe("keepkeep");
    });
  });

  describe("when a value is an object", function () {
    it("should match its keys inside the element matched by the outer key", function () {
      const $root = fixture(
        '<div><span class="name">outer</span><div class="child"><span class="name"></span></div></div>'
      );

      $root.loadJSON({ child: { name: "inner" } });

      expect($root.find(".child .name").text()).toBe("inner");
      expect($root.children(".name").text()).toBe("outer");
    });

    it("should leave the element unchanged when the object has no prototype", function () {
      const $root = fixture('<div><span class="a">keep</span></div>');

      $root.loadJSON({ a: Object.create(null) });

      expect($root.find(".a").text()).toBe("keep");
    });
  });

  describe("when the matching element is outside the loaded element", function () {
    it("should still load a rel match anywhere in the document", function () {
      const $outside = fixture('<p rel="leaky"></p>');
      const $root = fixture("<div></div>");

      $root.loadJSON({ leaky: "x" });

      expect($outside.text()).toBe("x");
    });

    it.fails("should not load a rel match outside the loaded element", function () {
      const $outside = fixture('<p rel="leaky"></p>');
      const $root = fixture("<div></div>");

      $root.loadJSON({ leaky: "x" });

      expect($outside.text()).toBe("");
    });

    it("should not load a class, id or name match outside the loaded element", function () {
      const $outside = fixture('<p class="a"></p>');
      const $root = fixture("<div></div>");

      $root.loadJSON({ a: "x" });

      expect($outside.text()).toBe("");
    });
  });

  describe("when a key contains selector characters", function () {
    it.fails("should match a class containing a dot", function () {
      const $root = fixture('<div><span class="a.b"></span></div>');

      $root.loadJSON({ "a.b": "x" });

      expect($root.find("span").text()).toBe("x");
    });

    it("should match a class that is not a valid selector", function () {
      const $root = fixture('<div><span class="a:b("></span></div>');

      $root.loadJSON({ "a:b(": "x" });

      expect($root.find("span").text()).toBe("x");
    });

    it("should match a class that is a jQuery-only selector when it finds nothing as one", function () {
      const $root = fixture('<div><span class="a:first"></span></div>');

      $root.loadJSON({ "a:first": "x" });

      expect($root.find("span").text()).toBe("x");
    });

    it("should match an id that is not a valid selector", function () {
      const $root = fixture('<div><span id="a:b("></span></div>');

      $root.loadJSON({ "a:b(": "x" });

      expect($root.find("span").text()).toBe("x");
    });

    it("should match a name containing a quote", function () {
      const $form = fixture("<form><input name='a\"b'><input name='c'></form>");

      $form.loadJSON({ 'a"b': "x" });

      expect($form.find("input").eq(0).val()).toBe("x");
      expect($form.find("input").eq(1).val()).toBe("");
    });

    it("should match a rel containing a quote", function () {
      const $root = fixture("<div><span rel='a\"b'></span></div>");

      $root.loadJSON({ 'a"b': "x" });

      expect($root.find("span").text()).toBe("x");
    });

    it("should leave the element unchanged when nothing matches a key that is not a valid selector", function () {
      const $root = fixture('<div><span class="a">keep</span></div>');

      $root.loadJSON({ "a:b(": "x" });

      expect($root.text()).toBe("keep");
    });

    it("should match a class that starts with a digit", function () {
      const $root = fixture('<div><span class="1a"></span></div>');

      $root.loadJSON({ "1a": "x" });

      expect($root.find("span").text()).toBe("x");
    });
  });
});
