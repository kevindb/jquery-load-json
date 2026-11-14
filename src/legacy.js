import jQuery from "jquery";

// Behavior kept for compatibility with earlier versions and removed in 2.0.

var $ = jQuery;

// Deprecation notices: shown once per page with console.warn when $.fn.loadJSON.debug is true.
var messages = {
  rel: "Matching keys by the rel attribute is deprecated and will be removed in 2.0. Use a class, id or name.",
  relIndex:
    'Loading array items into rel="index" children is deprecated and will be removed in 2.0.',
  url: "Passing a URL to loadJSON is deprecated and will be removed in 2.0. Load the data with $.getJSON and pass it to loadJSON.",
  html: "Values are inserted as HTML. From 2.0 they are inserted as text unless the html option is true.",
};

var shown = {};

export function notice(id) {
  if (!$.fn.loadJSON.debug || shown[id]) {
    return;
  }
  shown[id] = true;
  console.warn("jQuery loadJSON: " + messages[id]);
}
