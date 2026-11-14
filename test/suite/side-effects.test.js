import { describe, expect, it } from "vitest";
import { fixture, stubPlugin } from "./helpers.js";

describe("global side effects", function () {
  it("should not add Array.prototype.contains", function () {
    const $root = fixture("<div></div>");

    $root.loadJSON({});

    expect("contains" in Array.prototype).toBe(false);
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
