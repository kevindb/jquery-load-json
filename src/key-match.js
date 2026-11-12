import jQuery from "jquery";
import { notice } from "./legacy.js";

/**
 * The match of a key: the elements inside `scope` whose class, then id, then name is the key.
 * When none match, the elements anywhere in the document whose rel attribute is the key.
 */
export function match(key, scope) {
  var steps = ["." + key, "#" + key, '[name="' + key + '"]'];

  for (var i = 0; i < steps.length; i++) {
    var $matches = jQuery(steps[i], scope);
    if ($matches.length > 0) {
      return $matches;
    }
  }

  var $rel = jQuery('[rel="' + key + '"]');
  if ($rel.length > 0) {
    notice("rel");
  }
  return $rel;
}
