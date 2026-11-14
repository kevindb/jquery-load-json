import jQuery from "jquery";

// The selector of each step of a match, by class, then id, then name. The key is escaped, so it
// matches literally whatever characters it holds.
var steps = [
  function (key) {
    return "." + jQuery.escapeSelector(key);
  },
  function (key) {
    return "#" + jQuery.escapeSelector(key);
  },
  function (key) {
    return '[name="' + jQuery.escapeSelector(key) + '"]';
  },
];

/**
 * The match of a key: the elements inside `scope` whose class, then id, then name is the key.
 */
export function match(key, scope) {
  for (var i = 0; i < steps.length; i++) {
    var $matches = jQuery(steps[i](key), scope);
    if ($matches.length > 0) {
      return $matches;
    }
  }

  return jQuery();
}
