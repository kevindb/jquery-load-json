import { afterEach, describe, expect, it, vi } from "vitest";
import { fixture, stubPlugin } from "./helpers.js";

describe("global side effects", function () {
  it("should not add Array.prototype.contains", function () {
    const $root = fixture("<div></div>");

    $root.loadJSON({});

    expect("contains" in Array.prototype).toBe(false);
  });
});

describe("console output", function () {
  afterEach(function () {
    delete $.fn.loadJSON.debug;
    vi.restoreAllMocks();
  });

  it("should not define $.fn.loadJSON.debug", function () {
    expect($.fn.loadJSON).not.toHaveProperty("debug");
  });

  it("should write no warnings, even when $.fn.loadJSON.debug is set", function () {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const $root = fixture('<div><span class="a"></span><img class="p"></div>');
    $.fn.loadJSON.debug = true;

    $root.loadJSON({ a: "<b>x</b>", p: 1, src: "top" }, { mobile: true });

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("jQuery Mobile widgets", function () {
  it("should not refresh selectmenu or checkboxradio widgets", function () {
    const calls = [];
    stubPlugin("selectmenu", function (method) {
      calls.push(method);
    });
    stubPlugin("checkboxradio", function (method) {
      calls.push(method);
    });
    const $form = fixture(
      '<form><select name="s"><option value="x">X</option></select><input type="checkbox" name="c" value="a"></form>'
    );

    $form.loadJSON({ s: "x", c: "a" });

    expect(calls).toEqual([]);
  });
});
