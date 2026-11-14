/*!
 * jQuery loadJSON plugin
 * v2.0.0-dev
 * https://github.com/kevindb/jquery-load-json
 *
 * This is a jQuery plugin that enables developers to load JSON data from the server and load JSON object into the DOM.
 *
 * Copyright 2015 Kevin Morris
 * Copyright 2011 Jovan Popovic
 * Copyright 2008 Alexandre Caprais
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 */

import jQuery from 'jquery';
export { default } from 'jquery';

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

// Sets the contents as text, or as HTML when the html option is true.
function content(element, value, name, options) {
  try {
    if (options.html) {
      $(element).html(value.toString());
    } else {
      $(element).text(value.toString());
    }
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
function kindOf(element) {
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
 * `name` is the key the value was loaded from and `options` the options passed to loadJSON.
 */
function setValue(element, value, name, options) {
  var node = $(element)[0];

  kinds[kindOf(node)](node, value, name, options);
}

// Whether a DOM element's kind takes an object whole (an option or an image), rather than the walk
// loading each of its keys into a match.
function takesObject(element) {
  var kind = kindOf(element);

  return kind == "option" || kind == "image";
}

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
function match(key, scope) {
  for (var i = 0; i < steps.length; i++) {
    var $matches = query(steps[i], key, scope);
    if ($matches.length > 0) {
      return $matches;
    }
  }

  return jQuery();
}


(function ($) {

  // Whether a DOM element is a select (one or multiple).
  function isSelect(element) {
    return element.nodeType === 1 && /^select-/.test(kindOf(element));
  }

  // Loads each key of an object into its match within the element.
  function walkObject(object, element, name, options) {
    // An option or an image matched by the enclosing key takes the object whole
    if (element.length >= 1 && takesObject(element[0])) {
      if (kindOf(element[0]) == "option") {
        setValue(element[0], object, name, options);
      } else {
        element.each(function () {
          setValue(this, object, name, options);
        });
      }
    }

    for (var key in object) {
      if (key.length === 0) {
        continue;
      }
      var $match = match(key, element);
      if ($match.length !== 0) {
        walk(object[key], $match, key, options);
      }
    }
  }

  // Loads an array: whole into a select or a checkbox group, otherwise as a repeat of the element.
  function walkArray(array, element, name, options) {
    if (element.length == 1 && (isSelect(element) || isSelect(element[0]))) {
      setValue(element, array, name, options);
      return;
    }

    if (element.length > 0 && kindOf(element[0]) == "checkbox") {
      element.each(function () {
        setValue(this, array, name, options);
      });
      return;
    }

    repeat(array, element, name, options);
  }

  // Fills the existing elements in order, then appends copies of the last one for the remaining
  // items. A select's options are not filled; each item gets a copy of the last option.
  function repeat(array, element, name, options) {
    var elements = jQuery.makeArray(element);
    var last = elements[elements.length - 1];
    var $copySource = $(last).clone(true);
    var filled = 0;

    if (elements[0].tagName != "OPTION") {
      filled = Math.min(elements.length, array.length);
      for (var i = 0; i < filled; i++) {
        walk(array[i], $(element).eq(i), name, options);
      }
    }

    // Each copy goes right after the original last element, so the items are added from the end
    for (var j = array.length - 1; j >= filled; j--) {
      walk(array[j], $copySource.clone(true).insertAfter(last), name, options);
    }
  }

  // Sets a single value on each element of the set, or on the element itself.
  function walkValue(value, element, name, options) {
    if (element.length > 0) {
      for (var i = 0; i < element.length; i++) {
        setValue(element[i], value, name, options);
      }
    } else {
      setValue(element, value, name, options);
    }
  }

  // Loads a value of any shape into an element (a DOM element or a jQuery set).
  function walk(value, element, name, options) {
    if (value === undefined || value === null) {
      return;
    }
    if (value.constructor == Object) {
      walkObject(value, element, name, options);
    } else if (value.constructor == Array) {
      walkArray(value, element, name, options);
    } else {
      walkValue(value, element, name, options);
    }
  }

  // Restores the saved template, or saves the current markup when there is none.
  function useSavedTemplate($element) {
    var saved = $element.data("loadJSON-template");

    if (typeof saved == "string" && saved !== "") {
      $element.html(saved);
    } else {
      $element.data("loadJSON-template", $element.html());
    }
  }

  // Loads data into one element: the saved template, the callbacks and the walk.
  function load(element, data, properties) {
    useSavedTemplate($(element));
    properties.onLoading();
    walk(data, element, undefined, properties);
    properties.onLoaded();
  }

  // Loads the loadJSON argument into one element. A string is JSON.
  function loadArgument(element, argument, properties) {
    load(element, argument.constructor == String ? JSON.parse(argument) : argument, properties);
  }

  $.fn.loadJSON = function (data, options) {
    var defaults = {
      onLoading: function () {},
      onLoaded: function () {},
      html: false,
    };
    var properties = $.extend(defaults, options);

    return this.each(function () {
      loadArgument(this, data, properties);
    });
  };
})(jQuery);
