import jQuery from "jquery";

// Behavior kept for compatibility with earlier versions and removed in 2.0.

var $ = jQuery;

// Adds Array.prototype.contains (loose equality), which earlier versions defined on every call.
export function installContains() {
  notice("contains");
  Object.defineProperty(Array.prototype, "contains", {
    configurable: true,
    writable: true,
    value: function (obj) {
      var i = this.length;
      while (i--) {
        if (this[i] == obj) {
          return true;
        }
      }
      return false;
    },
  });
}

// Refreshes a jQuery Mobile widget (selectmenu or checkboxradio) when the element has one.
export function refreshMobile($element, widget) {
  try {
    if ($.isFunction($element[widget])) {
      notice("mobile");
      $element[widget]("refresh");
    }
  } catch (ex) {}
}

// Deprecation notices: shown once per page with console.warn when $.fn.loadJSON.debug is true.
var messages = {
  contains:
    "Array.prototype.contains is deprecated and will be removed in 2.0. Use Array.prototype.indexOf instead.",
  mobile:
    "Refreshing jQuery Mobile selectmenu and checkboxradio widgets is deprecated and will be removed in 2.0. Refresh them in onLoaded instead.",
  mobileOption: "The mobile option has no effect and will be removed in 2.0.",
  srcAlt:
    'An image value is used as the whole src: the "src$alt" format is not supported. Pass {src, alt} instead.',
  imageFallback:
    "Setting images from the top-level src, alt and title is deprecated and will be removed in 2.0. Give each image its own value.",
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
