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

import jQuery from "jquery";
import { kindOf, setValue, takesObject } from "./element-kinds.js";
import { match } from "./key-match.js";

(function ($) {
  "use strict";

  // Whether a DOM element is a select (one or multiple).
  function isSelect(element) {
    return element.nodeType === 1 && /^select-/.test(kindOf(element));
  }

  // Loads each key of an object into its match within the element.
  function walkObject(object, element, name) {
    // An option or an image matched by the enclosing key takes the object whole
    if (element.length >= 1 && takesObject(element[0])) {
      if (kindOf(element[0]) == "option") {
        setValue(element[0], object, name);
      } else {
        element.each(function () {
          setValue(this, object, name);
        });
      }
    }

    for (var key in object) {
      if (key.length === 0) {
        continue;
      }
      var $match = match(key, element);
      if ($match.length !== 0) {
        walk(object[key], $match, key);
      }
    }
  }

  // Loads an array: whole into a select or a checkbox group, otherwise as a repeat of the element.
  function walkArray(array, element, name) {
    if (element.length == 1 && (isSelect(element) || isSelect(element[0]))) {
      setValue(element, array, name);
      return;
    }

    if (element.length > 0 && kindOf(element[0]) == "checkbox") {
      element.each(function () {
        setValue(this, array, name);
      });
      return;
    }

    repeat(array, element, name);
  }

  // Fills the existing elements in order, then appends copies of the last one for the remaining
  // items. A select's options are not filled; each item gets a copy of the last option.
  function repeat(array, element, name) {
    var elements = jQuery.makeArray(element);
    var last = elements[elements.length - 1];
    var $copySource = $(last).clone(true);
    var filled = 0;

    if (elements[0].tagName != "OPTION") {
      filled = Math.min(elements.length, array.length);
      for (var i = 0; i < filled; i++) {
        walk(array[i], $(element).eq(i), name);
      }
    }

    // Each copy goes right after the original last element, so the items are added from the end
    for (var j = array.length - 1; j >= filled; j--) {
      walk(array[j], $copySource.clone(true).insertAfter(last), name);
    }
  }

  // Sets a single value on each element of the set, or on the element itself.
  function walkValue(value, element, name) {
    if (element.length > 0) {
      for (var i = 0; i < element.length; i++) {
        setValue(element[i], value, name);
      }
    } else {
      setValue(element, value, name);
    }
  }

  // Loads a value of any shape into an element (a DOM element or a jQuery set).
  function walk(value, element, name) {
    if (value === undefined || value === null) {
      return;
    }
    if (value.constructor == Object) {
      walkObject(value, element, name);
    } else if (value.constructor == Array) {
      walkArray(value, element, name);
    } else {
      walkValue(value, element, name);
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
  function load(element, data, properties) {
    useSavedTemplate($(element));
    properties.onLoading();
    walk(data, element);
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
    };
    var properties = $.extend(defaults, options);

    return this.each(function () {
      loadArgument(this, data, properties);
    });
  };
})(jQuery);

export default jQuery;
