import { describe, expect, it } from "vitest";
import { fixture, itBeforeJQuery4, stubPlugin } from "./helpers.js";

describe("global side effects", function () {
  it("should not add Array.prototype.contains", function () {
    const $root = fixture("<div></div>");

    $root.loadJSON({});

    expect("contains" in Array.prototype).toBe(false);
  });
});

describe("jQuery Mobile refresh", function () {
  itBeforeJQuery4("should refresh a select through selectmenu when present", function () {
    const calls = [];
    stubPlugin("selectmenu", function (method) {
      calls.push([this[0].name, method]);
    });
    const $form = fixture('<form><select name="s"><option value="x">X</option></select></form>');

    $form.loadJSON({ s: "x" });

    expect(calls).toEqual([["s", "refresh"]]);
  });

  itBeforeJQuery4("should refresh a select after appending options to it", function () {
    const calls = [];
    stubPlugin("selectmenu", function (method) {
      calls.push([this[0].type, method]);
    });
    const $one = fixture('<select><option value="x">X</option></select>');
    const $multiple = fixture('<select multiple><option value="x">X</option></select>');

    $one.loadJSON([{ value: "a", text: "A" }]);
    $multiple.loadJSON([{ value: "a", text: "A" }]);

    expect(calls).toEqual([
      ["select-one", "refresh"],
      ["select-multiple", "refresh"],
    ]);
  });

  itBeforeJQuery4("should refresh a multiple select after selecting values in it", function () {
    const calls = [];
    stubPlugin("selectmenu", function (method) {
      calls.push([this[0].name, method]);
    });
    const $form = fixture(
      '<form><select multiple name="m"><option value="x">X</option><option value="y">Y</option></select></form>'
    );

    $form.loadJSON({ m: "y" });

    expect(calls).toEqual([["m", "refresh"]]);
  });

  itBeforeJQuery4(
    "should refresh a checkbox or radio through checkboxradio when present",
    function () {
      const calls = [];
      stubPlugin("checkboxradio", function (method) {
        calls.push([this[0].type, method]);
      });
      const $form = fixture(
        '<form><input type="checkbox" name="c" value="a"><input type="radio" name="r" value="b"></form>'
      );

      $form.loadJSON({ c: "a", r: "b" });

      expect(calls).toEqual([
        ["checkbox", "refresh"],
        ["radio", "refresh"],
      ]);
    }
  );

  it("should ignore an error thrown by the refresh", function () {
    stubPlugin("selectmenu", function () {
      throw new Error("not initialized");
    });
    stubPlugin("checkboxradio", function () {
      throw new Error("not initialized");
    });
    const $form = fixture(
      '<form><select name="s"><option value="x">X</option><option value="y">Y</option></select><input type="checkbox" name="c" value="a"></form>'
    );

    $form.loadJSON({ s: "y", c: "a" });

    expect($form.find("select").val()).toBe("y");
    expect($form.find("input")[0].checked).toBe(true);
  });
});
