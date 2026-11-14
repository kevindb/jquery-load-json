import { afterEach } from "vitest";

const roots = [];

afterEach(function () {
  while (roots.length) {
    roots.pop().remove();
  }
});

// Appends `html` to the document for one test and returns it as a jQuery object.
export function fixture(html) {
  const $root = $(html).appendTo(document.body);
  roots.push($root);
  return $root;
}

// Trimmed text of each element in a jQuery collection.
export function texts($elements) {
  return $elements
    .map(function () {
      return $(this).text().trim();
    })
    .get();
}

// Values of the checked or selected controls in a jQuery collection.
export function checked($controls) {
  return $controls
    .filter(function () {
      return this.checked || this.selected;
    })
    .map(function () {
      return this.value;
    })
    .get();
}

// Temporarily defines $.fn[name] for one test.
export function stubPlugin(name, implementation) {
  const original = $.fn[name];
  $.fn[name] = implementation;
  roots.push({
    remove() {
      if (original === undefined) {
        delete $.fn[name];
      } else {
        $.fn[name] = original;
      }
    },
  });
}
