import jQuery from "jquery";

// Behavior kept for compatibility with earlier versions and removed in 2.0.

var $ = jQuery;

// Adds Array.prototype.contains (loose equality), which earlier versions defined on every call.
export function installContains() {
  Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
      if (this[i] == obj) {
        return true;
      }
    }
    return false;
  };
}

// Refreshes a jQuery Mobile widget (selectmenu or checkboxradio) when the element has one.
export function refreshMobile($element, widget) {
  try {
    if ($.isFunction($element[widget])) {
      $element[widget]("refresh");
    }
  } catch (ex) {}
}
