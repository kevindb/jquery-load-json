import jQuery from "jquery";

// Each step of a match: its selector for the key, and the same test without a selector.
var steps = [
  {
    selector: function (key) {
      return "." + key;
    },
    test: function (element, key) {
      return jQuery(element).hasClass(key);
    },
  },
  {
    selector: function (key) {
      return "#" + key;
    },
    test: function (element, key) {
      return element.id === key;
    },
  },
  {
    selector: function (key) {
      return '[name="' + key + '"]';
    },
    test: function (element, key) {
      return element.getAttribute("name") === key;
    },
  },
];

// Whether the browser accepts a selector as CSS.
function isValidCss(selector) {
  try {
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch (error) {
    return false;
  }
}

// Runs a step's selector inside scope. When the key makes the selector invalid (jQuery throws, or,
// before jQuery 3, finds nothing for a selector the browser rejects), it compares each element's
// attribute with the key instead.
function query(step, key, scope) {
  var selector = step.selector(key);

  try {
    var $matches = jQuery(selector, scope);
    if ($matches.length > 0 || isValidCss(selector)) {
      return $matches;
    }
  } catch (error) {}

  return jQuery(scope)
    .find("*")
    .filter(function () {
      return step.test(this, key);
    });
}

/**
 * The match of a key: the elements inside `scope` whose class, then id, then name is the key.
 */
export function match(key, scope) {
  for (var i = 0; i < steps.length; i++) {
    var $matches = query(steps[i], key, scope);
    if ($matches.length > 0) {
      return $matches;
    }
  }

  return jQuery();
}
