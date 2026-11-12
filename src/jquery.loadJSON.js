/*!
 * jQuery loadJSON plugin
 * v1.3.4
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

import jQuery from "jquery";
import { kindOf, setValue, takesWhole } from "./element-kinds.js";
import { installContains, notice } from "./legacy.js";
import { match } from "./key-match.js";

(function ($) {
  "use strict";

  // Whether a DOM element is a select (one or multiple).
  function isSelect(element) {
    return element.nodeType === 1 && /^select-/.test(kindOf(element));
  }

  // Loads each key of an object into its match within the element.
  function walkObject(object, element, name, data) {
    // An option or an image matched by the enclosing key takes the object whole
    if (element.length >= 1 && takesWhole(element[0], object)) {
      if (kindOf(element[0]) == "option") {
        setValue(element[0], object, name, data);
      } else {
        element.each(function () {
          setValue(this, object, name, data);
        });
      }
    }

    for (var key in object) {
      if (key.length === 0) {
        continue;
      }
      var $match = match(key, element);
      if ($match.length !== 0) {
        walk(object[key], $match, key, data);
      }
    }
  }

  // Loads an array: whole into a select or a checkbox group, item by item into rel index
  // children, or as a repeat of the element.
  function walkArray(array, element, name, data) {
    if (element.length == 1 && (isSelect(element) || isSelect(element[0]))) {
      setValue(element, array, name, data);
      return;
    }

    if (element.length > 0 && kindOf(element[0]) == "checkbox") {
      element.each(function () {
        setValue(this, array, name, data);
      });
      return;
    }

    var $element = $(element);
    var $children = $element.children("[rel]");
    if ($children.length > 0) {
      notice("relIndex");
      $children.each(function () {
        var $child = $(this);
        walk(array[$child.attr("rel")], $child, name, data);
      });
      return;
    }

    repeat(array, element, name, data);
  }

  // Fills the existing elements in order, then appends copies of the last one for the remaining
  // items. A select's options are not filled; each item gets a copy of the last option.
  function repeat(array, element, name, data) {
    var elements = jQuery.makeArray(element);
    var last = elements[elements.length - 1];
    var $copySource = $(last).clone(true);
    var filled = 0;

    if (elements[0].tagName != "OPTION") {
      filled = Math.min(elements.length, array.length);
      for (var i = 0; i < filled; i++) {
        walk(array[i], $(element).eq(i), name, data);
      }
    }

    // Each copy goes right after the original last element, so the items are added from the end
    for (var j = array.length - 1; j >= filled; j--) {
      walk(array[j], $copySource.clone(true).insertAfter(last), name, data);
    }
  }

  // Sets a single value on each element of the set, or on the element itself.
  function walkValue(value, element, name, data) {
    if (element.length > 0) {
      for (var i = 0; i < element.length; i++) {
        setValue(element[i], value, name, data);
      }
    } else {
      setValue(element, value, name, data);
    }
  }

  // Loads a value of any shape into an element (a DOM element or a jQuery set).
  function walk(value, element, name, data) {
    if (value === undefined || value === null) {
      return;
    }
    if (value.constructor == Object) {
      walkObject(value, element, name, data);
    } else if (value.constructor == Array) {
      walkArray(value, element, name, data);
    } else {
      walkValue(value, element, name, data);
    }
  }

  // Restores the saved template, or saves the current markup when there is none.
  function useSavedTemplate($element) {
    var saved = $element.data("loadJSON-template");

    if (saved !== null && saved != "") {
      $element.html(saved);
    } else {
      $element.data("loadJSON-template", $element.html());
    }
  }

  // Loads data into one element: the saved template, the callbacks and the walk.
  function load(element, data, argument, properties) {
    useSavedTemplate($(element));
    properties.onLoading();
    walk(data, element, undefined, argument);
    properties.onLoaded();
  }

  // Loads the loadJSON argument into one element. A string starting with { or [ is JSON; any
  // other string is a URL, requested once per element, whose response is loaded the same way.
  function loadArgument(element, argument, properties) {
    if (argument.constructor != String) {
      load(element, argument, argument, properties);
    } else if (argument.charAt(0) == "{" || argument.charAt(0) == "[") {
      load(element, JSON.parse(argument), argument, properties);
    } else {
      notice("url");
      $.ajax({
        url: argument,
        success: function (response) {
          loadArgument(element, response, properties);
        },
        cache: false,
        dataType: "json",
      });
    }
  }

  $.fn.loadJSON = function (data, options) {
    installContains();
    if (options && "mobile" in options) {
      notice("mobileOption");
    }

    var defaults = {
      onLoading: function () {},
      onLoaded: function () {},
      mobile: false,
    };
    var properties = $.extend(defaults, options);

    return this.each(function () {
      loadArgument(this, data, properties);
    });
  };

  // Set to true to show a console warning, once per page, for each behavior removed in 2.0.
  $.fn.loadJSON.debug = false;
})(jQuery);

export default jQuery;
