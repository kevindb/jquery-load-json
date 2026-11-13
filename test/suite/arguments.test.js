import { describe, expect, it } from "vitest";
import { fixture, texts } from "./helpers.js";

describe("loadJSON arguments", function () {
  describe("when given an object", function () {
    it("should load each property into the matching element", function () {
      const $root = fixture('<div><h1 id="Name"></h1><span id="Address"></span></div>');

      $root.loadJSON({ Name: "Emkay Entertainments", Address: "Nobel House" });

      expect($root.find("#Name").text()).toBe("Emkay Entertainments");
      expect($root.find("#Address").text()).toBe("Nobel House");
    });

    it("should return the same jQuery object for chaining", function () {
      const $root = fixture('<div><span class="a"></span></div>');

      const result = $root.loadJSON({ a: 1 });

      expect(result).toBe($root);
    });

    it("should load every element in the jQuery set", function () {
      const $root = fixture(
        '<section><div class="card"><b class="a"></b></div><div class="card"><b class="a"></b></div></section>'
      );

      $root.find(".card").loadJSON({ a: "same" });

      expect($root.find(".a").text()).toBe("samesame");
    });
  });

  describe("when given a scalar", function () {
    it("should set the element's own content", function () {
      const $root = fixture("<div></div>");

      $root.loadJSON(5);

      expect($root.text()).toBe("5");
    });

    it("should set each control of a form", function () {
      const $form = fixture('<form><input name="a"><input name="b"></form>');

      $form.loadJSON(5);

      expect([$form.find("[name=a]").val(), $form.find("[name=b]").val()]).toEqual(["5", "5"]);
    });

    it("should set the content of a form with no controls", function () {
      const $form = fixture("<form></form>");

      $form.loadJSON(5);

      expect($form.text()).toBe("5");
    });
  });

  describe("when given a JSON string", function () {
    it("should parse an object string and load it", function () {
      const $root = fixture('<div><span class="a"></span></div>');

      $root.loadJSON('{"a":"parsed"}');

      expect($root.find(".a").text()).toBe("parsed");
    });

    it("should parse a string holding arrays and load it", function () {
      const $root = fixture('<div><ul><li class="i"></li></ul></div>');

      $root.loadJSON('{"i":["one","two"]}');

      expect($root.find(".i").length).toBe(2);
    });

    it("should parse an array string and load it", function () {
      const $list = fixture('<ul><li rel="1"></li><li rel="0"></li></ul>');

      $list.loadJSON('["zero","one"]');

      expect(texts($list.find("li"))).toEqual(["one", "zero"]);
    });

    it("should add one option per item of an array string loaded into a select", function () {
      const $select = fixture('<select><option value="x">X</option></select>');

      $select.loadJSON('[{"value":"a","text":"A"}]');

      expect($select.find("option").length).toBe(2);
    });

    it("should call onLoading before and onLoaded after loading", function () {
      const $root = fixture('<div><span class="a"></span></div>');
      const calls = [];

      $root.loadJSON('{"a":"x"}', {
        onLoading: () => calls.push("loading:" + $root.find(".a").text()),
        onLoaded: () => calls.push("loaded:" + $root.find(".a").text()),
      });

      expect(calls).toEqual(["loading:", "loaded:x"]);
    });

    it("should replace the content with the saved template first", function () {
      const $root = fixture('<div><span class="old"></span></div>');
      $root.data("loadJSON-template", '<b class="a"></b>');

      $root.loadJSON('{"a":"x"}');

      expect($root.html()).toBe('<b class="a">x</b>');
    });

    it("should throw when the string is not valid JSON", function () {
      const $root = fixture("<div></div>");

      const load = () => $root.loadJSON("{not json");

      expect(load).toThrow(SyntaxError);
    });
  });

  describe("when given a URL string", function () {
    it("should request it as JSON without caching and load the response", async function () {
      const $root = fixture('<div><span class="name"></span><span class="city"></span></div>');
      const sent = [];
      $(document).on("ajaxSend.test", function (event, xhr, settings) {
        sent.push(settings);
      });

      await new Promise(function (resolve) {
        $root.loadJSON("/fixtures/person.json", { onLoaded: resolve });
      });
      $(document).off("ajaxSend.test");

      expect($root.find(".name").text()).toBe("Ada Lovelace");
      expect($root.find(".city").text()).toBe("London");
      expect(sent[0].dataType).toBe("json");
      expect(sent[0].url).toMatch(/^\/fixtures\/person\.json\?_=\d+$/);
    });

    it("should treat a JSON string with leading whitespace as a URL", function () {
      const $root = fixture("<div></div>");
      const sent = [];
      $(document).on("ajaxSend.test", function (event, xhr, settings) {
        sent.push(settings.url);
        xhr.abort();
      });

      $root.loadJSON(' {"a":1}');
      $(document).off("ajaxSend.test");

      expect(sent[0]).toMatch(/^ \{"a":1\}\?_=\d+$/);
    });

    it("should leave the element unchanged and call no callback when the request fails", async function () {
      const $root = fixture('<div><span class="name">before</span></div>');
      const calls = [];

      await new Promise(function (resolve) {
        $(document).one("ajaxComplete", () => setTimeout(resolve));
        $root.loadJSON("/fixtures/missing.json", {
          onLoading: () => calls.push("loading"),
          onLoaded: () => calls.push("loaded"),
        });
      });

      expect($root.find(".name").text()).toBe("before");
      expect(calls).toEqual([]);
    });
  });

  describe("when given null or nothing", function () {
    it("should throw a TypeError", function () {
      const $root = fixture("<div></div>");

      const loadNull = () => $root.loadJSON(null);
      const loadNothing = () => $root.loadJSON();

      expect(loadNull).toThrow(TypeError);
      expect(loadNothing).toThrow(TypeError);
    });
  });
});

describe("loadJSON callbacks", function () {
  it("should call onLoading before and onLoaded after loading, once per element", function () {
    const $root = fixture('<section><p><b class="a"></b></p><p><b class="a"></b></p></section>');
    const calls = [];

    $root.find("p").loadJSON(
      { a: "x" },
      {
        onLoading: () => calls.push("loading:" + $root.find(".a").text()),
        onLoaded: () => calls.push("loaded:" + $root.find(".a").text()),
      }
    );

    expect(calls).toEqual(["loading:", "loaded:x", "loading:x", "loaded:xx"]);
  });

  it("should call the callbacks with no arguments, as methods of a copy of the options", function () {
    const $root = fixture("<div></div>");
    const seen = [];
    const options = {
      onLoaded: function () {
        seen.push(this, arguments.length);
      },
    };

    $root.loadJSON({}, options);

    expect(seen[0]).not.toBe(options);
    expect(seen[0].onLoaded).toBe(options.onLoaded);
    expect(seen[1]).toBe(0);
  });

  it("should accept and ignore the mobile option", function () {
    const $root = fixture('<div><span class="a"></span></div>');

    $root.loadJSON({ a: 1 }, { mobile: true });

    expect($root.find(".a").text()).toBe("1");
  });
});
