import { describe, expect, it } from "vitest";
import { checked, fixture } from "./helpers.js";

describe("form fields", function () {
  describe("when loading text-like inputs", function () {
    it("should set the value of each input type", function () {
      const data = {
        text: "x",
        email: "a@b.c",
        hidden: "h",
        number: "4",
        password: "pw",
        search: "q",
        tel: "555",
        url: "http://example.com/",
        range: "7",
        color: "#ff0000",
        date: "2020-01-02",
        month: "2020-01",
        week: "2020-W01",
        time: "10:00",
        "datetime-local": "2020-01-02T03:04",
      };
      const $form = fixture(
        "<form>" +
          Object.keys(data)
            .map((type) => `<input type="${type}" name="${type}">`)
            .join("") +
          "</form>"
      );

      $form.loadJSON(data);

      const values = {};
      $form.find("input").each(function () {
        values[this.name] = this.value;
      });
      expect(values).toEqual(data);
    });

    it("should set an input of the obsolete datetime type as text", function () {
      const $form = fixture('<form><input type="datetime" name="d"></form>');

      $form.loadJSON({ d: "anything" });

      expect($form.find("input").val()).toBe("anything");
    });
  });

  describe("when loading a textarea", function () {
    it("should set its text, not its markup", function () {
      const $form = fixture('<form><textarea name="t"></textarea></form>');

      $form.loadJSON({ t: "<b>x</b>" });

      expect($form.find("textarea").val()).toBe("<b>x</b>");
    });
  });

  describe("when loading buttons", function () {
    it("should set a button element's content as HTML", function () {
      const $form = fixture('<form><button name="b">old</button></form>');

      $form.loadJSON({ b: "<i>new</i>" });

      expect($form.find("button i").text()).toBe("new");
    });

    it("should leave submit and button inputs unchanged", function () {
      const $form = fixture(
        '<form><input type="submit" name="s" value="Go"><input type="button" name="b" value="Btn"></form>'
      );

      $form.loadJSON({ s: "x", b: "y" });

      expect($form.find("[name=s]").val()).toBe("Go");
      expect($form.find("[name=b]").val()).toBe("Btn");
    });

    it("should leave a file input unchanged", function () {
      const $form = fixture('<form><input type="file" name="f"></form>');

      $form.loadJSON({ f: "x" });

      expect($form.find("input").val()).toBe("");
    });
  });

  describe("when loading checkboxes", function () {
    it("should check the boxes whose values are in an array and uncheck the rest", function () {
      const $form = fixture(
        '<form><input type="checkbox" name="c" value="a" checked><input type="checkbox" name="c" value="b"><input type="checkbox" name="c" value="c"></form>'
      );

      $form.loadJSON({ c: ["b", "c"] });

      expect(checked($form.find("input"))).toEqual(["b", "c"]);
    });

    it("should check only the box whose value equals a scalar", function () {
      const $form = fixture(
        '<form><input type="checkbox" name="c" value="a" checked><input type="checkbox" name="c" value="b"></form>'
      );

      $form.loadJSON({ c: "b" });

      expect(checked($form.find("input"))).toEqual(["b"]);
    });

    it("should compare loosely, so the number 1 checks value 1", function () {
      const $form = fixture('<form><input type="checkbox" name="c" value="1"></form>');

      $form.loadJSON({ c: 1 });

      expect(checked($form.find("input"))).toEqual(["1"]);
    });

    it("should not check a box without a value attribute for true", function () {
      const $form = fixture('<form><input type="checkbox" name="c"></form>');

      $form.loadJSON({ c: true });

      expect(checked($form.find("input"))).toEqual([]);
    });
  });

  describe("when loading radio buttons", function () {
    it("should check the button whose value matches, ignoring case", function () {
      const $form = fixture(
        '<form><input type="radio" name="r" value="A"><input type="radio" name="r" value="b" checked></form>'
      );

      $form.loadJSON({ r: "a" });

      expect(checked($form.find("input"))).toEqual(["A"]);
    });

    it("should compare the string form of a non-string value", function () {
      const $form = fixture(
        '<form><input type="radio" name="r" value="true"><input type="radio" name="r" value="false"></form>'
      );

      $form.loadJSON({ r: false });

      expect(checked($form.find("input"))).toEqual(["false"]);
    });

    it("should uncheck a matched button whose value differs, whatever its group", function () {
      const $form = fixture(
        '<form><input type="radio" class="r" name="x" value="a" checked><input type="radio" class="r" name="y" value="b"></form>'
      );

      $form.loadJSON({ r: "b" });

      expect(checked($form.find("input"))).toEqual(["b"]);
    });
  });

  describe("when loading a single select", function () {
    it("should select the option with a scalar value", function () {
      const $form = fixture(
        '<form><select name="s"><option value="x">X</option><option value="y">Y</option></select></form>'
      );

      $form.loadJSON({ s: "y" });

      expect($form.find("select").val()).toBe("y");
    });

    it("should append options when the select itself is loaded with an array", function () {
      const $select = fixture('<select><option value="x">X</option></select>');

      $select.loadJSON([
        { value: "a", text: "A" },
        { value: "b", text: "B", selected: true },
      ]);

      expect($select.find("option").length).toBe(3);
      expect($select.find("option").eq(1).text()).toBe("A");
      expect($select.val()).toBe("b");
    });

    it("should append options to a select with several options loaded with an array", function () {
      const $select = fixture(
        '<select><option value="x">X</option><option value="y">Y</option></select>'
      );

      $select.loadJSON([{ value: "a", text: "A" }]);

      expect(
        $select
          .find("option")
          .map(function () {
            return this.value;
          })
          .get()
      ).toEqual(["x", "y", "a"]);
    });

    it("should append options when a key's value is an array", function () {
      const $form = fixture('<form><select name="s"><option value="x">X</option></select></form>');

      $form.loadJSON({ s: [{ value: "a", text: "A" }] });

      expect($form.find("option").length).toBe(2);
    });

    it("should set an option's value, text and selected state from an object", function () {
      const $select = fixture(
        '<select><option value="x">X</option><option value="old">Old</option></select>'
      );

      $select.loadJSON({ value: "v", text: "Vee", selected: true });

      expect($select.find("option").eq(0).val()).toBe("v");
      expect($select.find("option").eq(0).text()).toBe("Vee");
      expect($select.val()).toBe("v");
    });

    it("should select a classed option loaded from an object with selected true", function () {
      const $form = fixture(
        '<form><select name="s"><option value="x">X</option><option class="o" value="y">Y</option></select></form>'
      );

      $form.loadJSON({ o: { value: "v", text: "Vee", selected: true } });

      expect($form.find("select").val()).toBe("v");
    });

    it("should copy event handlers to the appended options", function () {
      const $select = fixture('<select><option value="x">X</option></select>');
      const clicked = [];
      $select.find("option").on("click", function () {
        clicked.push(this.value);
      });

      $select.loadJSON([{ value: "a", text: "A" }]);
      $select.find("option").trigger("click");

      expect(clicked).toEqual(["x", "a"]);
    });

    it("should add an option per item for an array loaded into a classed option", function () {
      const $form = fixture(
        '<form><select name="s"><option class="o" value="">Pick</option></select></form>'
      );

      $form.loadJSON({
        o: [
          { value: "a", text: "A" },
          { value: "b", text: "B" },
        ],
      });

      expect(
        $form
          .find("option")
          .map(function () {
            return this.value;
          })
          .get()
      ).toEqual(["", "a", "b"]);
    });
  });

  describe("when loading a multiple select", function () {
    it("should select the option with a scalar value", function () {
      const $form = fixture(
        '<form><select multiple name="m"><option value="x">X</option><option value="y">Y</option></select></form>'
      );

      $form.loadJSON({ m: "y" });

      expect($form.find("select").val()).toEqual(["y"]);
    });

    it("should keep options that were already selected", function () {
      const $form = fixture(
        '<form><select multiple name="m"><option value="x" selected>X</option><option value="y">Y</option></select></form>'
      );

      $form.loadJSON({ m: "y" });

      expect($form.find("select").val()).toEqual(["x", "y"]);
    });

    it("should compare a scalar with each option's whole value", function () {
      const $form = fixture(
        '<form><select multiple name="m"><option value="y">Y</option><option value="yes">Yes</option></select></form>'
      );

      $form.loadJSON({ m: "yes" });

      expect($form.find("select").val()).toEqual(["yes"]);
    });

    it("should select the values in an array", function () {
      const $form = fixture(
        '<form><select multiple name="m"><option value="x">X</option><option value="y">Y</option><option value="z">Z</option></select></form>'
      );

      $form.loadJSON({ m: ["x", "z"] });

      expect($form.find("select").val()).toEqual(["x", "z"]);
    });

    it("should select a scalar value in a select with one option", function () {
      const $form = fixture(
        '<form><select multiple name="m"><option value="x">X</option></select></form>'
      );

      $form.loadJSON({ m: "x" });

      expect(checked($form.find("option"))).toEqual(["x"]);
    });

    it("should leave a select with no options empty for a scalar", function () {
      const $form = fixture('<form><select multiple name="m"></select></form>');

      $form.loadJSON({ m: "x" });

      expect($form.find("option").length).toBe(0);
    });

    it("should append options when the select itself, with one option, is loaded with an array", function () {
      const $select = fixture('<select multiple><option value="x">X</option></select>');

      $select.loadJSON([{ value: "a", text: "A", selected: true }]);

      expect(checked($select.find("option"))).toEqual(["a"]);
      expect($select.find("option").length).toBe(2);
    });

    it("should append a copy of the last option for an array of values loaded into the select itself", function () {
      const $select = fixture(
        '<select multiple><option value="x">X</option><option value="y">Y</option></select>'
      );

      $select.loadJSON(["y"]);

      expect(
        $select
          .find("option")
          .map(function () {
            return this.value;
          })
          .get()
      ).toEqual(["x", "y", "y"]);
      expect(checked($select.find("option"))).toEqual([]);
    });
  });
});
