import { describe, expect, it } from "vitest";
import { fixture } from "./helpers.js";

describe("links", function () {
  describe("when the link has no href", function () {
    it("should set the href to the value", function () {
      const $root = fixture('<div><a class="l">text</a></div>');

      $root.loadJSON({ l: "https://example.com/" });

      expect($root.find("a").attr("href")).toBe("https://example.com/");
      expect($root.find("a").text()).toBe("text");
    });
  });

  describe("when the link has an href", function () {
    it("should append the key and value as a query parameter", function () {
      const $root = fixture('<div><a class="l" href="/page">text</a></div>');

      $root.loadJSON({ l: 5 });

      expect($root.find("a").attr("href")).toBe("/page?l=5");
    });

    it("should append with & when the href already has a query", function () {
      const $root = fixture('<div><a class="l" href="/page?x=1">text</a></div>');

      $root.loadJSON({ l: 5 });

      expect($root.find("a").attr("href")).toBe("/page?x=1&l=5");
    });

    it("should append the value without encoding it", function () {
      const $root = fixture('<div><a class="l" href="/page">text</a></div>');

      $root.loadJSON({ l: "a b&c" });

      expect($root.find("a").attr("href")).toBe("/page?l=a b&c");
    });

    it.fails("should encode the value", function () {
      const $root = fixture('<div><a class="l" href="/page">text</a></div>');

      $root.loadJSON({ l: "a b&c" });

      expect($root.find("a").attr("href")).toBe("/page?l=a%20b%26c");
    });

    it("should append with & when the href is only a query", function () {
      const $root = fixture('<div><a class="l" href="?x=1">text</a></div>');

      $root.loadJSON({ l: 5 });

      expect($root.find("a").attr("href")).toBe("?x=1&l=5");
    });

    it("should add the parameter before an href that is only a fragment", function () {
      const $root = fixture('<div><a class="l" href="#top">text</a></div>');

      $root.loadJSON({ l: 5 });

      expect($root.find("a").attr("href")).toBe("?l=5#top");
    });

    it("should add the parameter before a fragment", function () {
      const $root = fixture('<div><a class="l" href="/page?x=1#top">text</a></div>');

      $root.loadJSON({ l: 5 });

      expect($root.find("a").attr("href")).toBe("/page?x=1&l=5#top");
    });

    it("should use undefined as the name when the link itself is loaded with a scalar", function () {
      const $link = fixture('<a href="/page">text</a>');

      $link.loadJSON(5);

      expect($link.attr("href")).toBe("/page?undefined=5");
    });
  });
});

describe("images", function () {
  describe("when the value is a string", function () {
    it("should set src to the string", function () {
      const $root = fixture('<div><img class="p" src="data:,old"></div>');

      $root.loadJSON({ p: "photo.png" });

      expect($root.find("img").attr("src")).toBe("photo.png");
    });

    it('should use a string in the old "src$alt" format whole, as the src', function () {
      const $root = fixture('<div><img class="p" alt="keep"></div>');

      $root.loadJSON({ p: "photo.png$Photo" });

      expect($root.find("img").attr("src")).toBe("photo.png$Photo");
      expect($root.find("img").attr("alt")).toBe("keep");
    });
  });

  describe("when the value is an object with src, alt and title", function () {
    it("should set those attributes", function () {
      const $root = fixture('<div><img class="p" src="data:,old"></div>');

      $root.loadJSON({ p: { src: "a.png", alt: "A", title: "T" } });

      expect($root.find("img").attr("src")).toBe("a.png");
      expect($root.find("img").attr("alt")).toBe("A");
    });

    it("should set them on every matched image", function () {
      const $root = fixture('<div><img class="p" src="data:,old"><img class="p"></div>');

      $root.loadJSON({ p: { src: "data:,new", alt: "A", title: "T" } });

      expect(
        $root
          .find("img")
          .map(function () {
            return this.getAttribute("src");
          })
          .get()
      ).toEqual(["data:,new", "data:,new"]);
    });
  });

  describe("when the value is neither a string nor an object", function () {
    it("should set src to the value and ignore the top-level src, alt and title", function () {
      const $root = fixture('<div><img class="p" src="data:,old"></div>');

      $root.loadJSON({ p: 7, src: "data:,top", alt: "Top", title: "T" });

      const $img = $root.find("img");
      expect([$img.attr("src"), $img.attr("alt"), $img.attr("title")]).toEqual([
        "7",
        undefined,
        undefined,
      ]);
    });
  });
});
