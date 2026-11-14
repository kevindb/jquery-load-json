import jQuery from "jquery";

// Element kinds: how a value is set on each kind of element.

var $ = jQuery;

// Input types whose value is set directly.
var rField =
  /^(?:color|date|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/;

// Appends a copy of the select's last option for each {value, text, selected} item.
function addOptions(select, items) {
  var options = jQuery.makeArray(select);
  var last = options[options.length - 1];
  var template = $(last).clone(true);

  // Each copy goes right after the original last option, so the items are added from the end
  for (var i = items.length - 1; i >= 0; i--) {
    var $option = template.clone(true).insertAfter(last);
    $option.attr("value", items[i].value);
    $option.text(items[i].text);
    if (items[i].selected) {
      $option.attr("selected", true);
    }
  }
}

// Whether an array holds a value, comparing with ==.
function containsLoosely(values, value) {
  for (var i = 0; i < values.length; i++) {
    if (values[i] == value) {
      return true;
    }
  }
  return false;
}

function field(element, value) {
  $(element).val(value);
}

function checkbox(element, value) {
  var $element = $(element);
  var elementValue = $element.val();

  $element.prop(
    "checked",
    (value.constructor == Array && containsLoosely(value, elementValue)) || value == elementValue
  );
}

function radio(element, value) {
  var $element = $(element);

  $element.prop("checked", value.toString().toLowerCase() == element.value.toLowerCase());
}

function option(element, value) {
  var $element = $(element);

  $element.attr("value", value.value);
  $element.text(value.text);
  if (value.selected) {
    $element.attr("selected", true);
  }
}

function selectOne(element, value) {
  if (value.constructor == Array) {
    addOptions(element, value);
  } else {
    $(element).val(value);
  }
}

function selectMultiple(element, value) {
  var options = element.options;

  // An array loaded into a select with one option or none adds options; otherwise it selects
  if (value.constructor == Array && options.length <= 1) {
    addOptions(element, value);
    return;
  }

  var values = value.constructor == Array ? value : [value];
  for (var i = 0; i < options.length; i++) {
    for (var j = 0; j < values.length; j++) {
      options[i].selected |= options[i].value == values[j];
    }
  }
}

function link(element, value, name) {
  var $element = $(element);
  var href = $element.attr("href");

  if (href) {
    // If a href value exists, add the pair to its query, before any fragment
    var iFragment = href.indexOf("#");
    var fragment = "";

    if (iFragment >= 0) {
      fragment = href.substring(iFragment);
      href = href.substring(0, iFragment);
    }

    href += (href.indexOf("?") >= 0 ? "&" : "?") + name + "=" + value + fragment;
  } else {
    // If no href exists, set href to value
    href = value;
  }

  $element.attr("href", href);
}

function image(element, value) {
  var $element = $(element);

  if (value.constructor == Object) {
    // An object sets the image's own src, alt and title
    $element.attr("src", value.src);
    $element.attr("alt", value.alt);
    $element.attr("title", value.title);
  } else {
    // Any other value is the image address
    $element.attr("src", value);
  }
}

function content(element, value) {
  try {
    $(element).html(value.toString());
  } catch (exc) {}
}

var kinds = {
  field: field,
  checkbox: checkbox,
  radio: radio,
  option: option,
  "select-one": selectOne,
  "select-multiple": selectMultiple,
  link: link,
  image: image,
  content: content,
};

// The element kind of a DOM element, from its type or, when it has none, its tag name.
export function kindOf(element) {
  var type = (element.type || element.tagName).toLowerCase();

  switch (type) {
    case "checkbox":
    case "radio":
    case "option":
    case "select-one":
    case "select-multiple":
      return type;
    case "a":
      return "link";
    case "img":
      return "image";
    default:
      return rField.test(type) ? "field" : "content";
  }
}

/**
 * Sets a value on an element by its kind. `element` is a DOM element or a jQuery set of one;
 * `name` is the key the value was loaded from.
 */
export function setValue(element, value, name) {
  var node = $(element)[0];

  kinds[kindOf(node)](node, value, name);
}

// Whether a DOM element's kind takes an object whole (an option or an image), rather than the walk
// loading each of its keys into a match.
export function takesObject(element) {
  var kind = kindOf(element);

  return kind == "option" || kind == "image";
}
