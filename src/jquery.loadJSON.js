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
import { setValue } from "./element-kinds.js";
import { installContains, notice } from "./legacy.js";

(function ($) {
  "use strict";

  // Elements anywhere in the document whose rel attribute is the key.
  function relMatch(key) {
    var $matches = jQuery('[rel="' + key + '"]');
    if ($matches.length > 0) {
      notice("rel");
    }
    return $matches;
  }

  function browseJSON(obj, element, name, data) {
    var $element = $(element);

    // no object
    if (obj === undefined || obj === null) {
      // Do nothing
      // branch
    } else if (obj.constructor == Object) {
      if (element.length >= 1 && element[0].tagName == "OPTION") {
        setValue(element[0], obj, name, data);
      } else if (element.length >= 1 && element[0].tagName == "IMG") {
        element.each(function () {
          setValue(this, obj, name, data);
        });
      }

      for (var prop in obj) {
        if (prop === null || typeof prop == "undefined" || prop.length === 0) {
          continue;
        } else {
          //Find an element with class, id, name, or rel attribute that matches the property name
          var child =
            jQuery.makeArray(jQuery("." + prop, element)).length > 0
              ? jQuery("." + prop, element)
              : jQuery("#" + prop, element).length > 0
                ? jQuery("#" + prop, element)
                : jQuery('[name="' + prop + '"]', element).length > 0
                  ? jQuery('[name="' + prop + '"]', element)
                  : relMatch(prop);

          if (child.length !== 0) {
            browseJSON(obj[prop], jQuery(child, element), prop, data);
          }
        }
      }

      // array
    } else if (obj.constructor == Array) {
      if (
        element.length == 1 &&
        (element.type == "select" ||
          element.type == "select-one" ||
          element.type == "select-multiple" ||
          element[0].type == "select" ||
          element[0].type == "select-one" ||
          element[0].type == "select-multiple")
      ) {
        ///nova dva reda
        setValue(element, obj, name, data);
        return;
      } else if (element.length > 0 && element[0].type == "checkbox") {
        element.each(function () {
          setValue(this, obj, name, data);
        });
      } else {
        var arrayElements = $element.children("[rel]");
        if (arrayElements.length > 0) {
          notice("relIndex");
          //if there are rel=[index] elements populate them instead of iteration
          arrayElements.each(function () {
            var $this = $(this);
            var rel = $this.attr("rel");
            browseJSON(obj[rel], $this, name, data);
          });
        } else {
          //recursive iteration
          var arr = jQuery.makeArray(element);
          var arrLen = arr.length;
          var template = $(arr[arrLen - 1]).clone(true);
          var nbToCreate = obj.length; //how many duplicate
          var i = 0;

          if (element[0] === null || (element[0] !== null && element[0].tagName != "OPTION")) {
            for (var iExist = 0; iExist < arrLen; ++iExist) {
              if (i < obj.length) {
                var elem = $element.eq(iExist);
                browseJSON(obj[i], elem, name, data);
              }
              i++;
            }
            nbToCreate = obj.length - arrLen;
          }

          //fill started by last
          i = obj.length - 1;
          for (var iCreate = 0; iCreate < nbToCreate; ++iCreate) {
            //duplicate the last
            var last = template.clone(true).insertAfter(arr[arrLen - 1]);
            browseJSON(obj[i], last, name, data);
            i--;
          }
        }
      }

      // data only
    } else {
      var elemLen = element.length;

      if (elemLen > 0) {
        for (var i = 0; i < elemLen; ++i) {
          setValue(element[i], obj, name, data);
        }
      } else {
        setValue(element, obj, name, data);
      }
    }
  } //function browseJSON end

  function init(placeholder) {
    var template;

    if (
      placeholder.data("loadJSON-template") !== null &&
      placeholder.data("loadJSON-template") != ""
    ) {
      template = placeholder.data("loadJSON-template");
      placeholder.html(template);
    } else {
      template = placeholder.html();
      placeholder.data("loadJSON-template", template);
    }
  }

  $.fn.loadJSON = function (obj, options) {
    installContains();

    var defaults = {
      onLoading: function () {},
      onLoaded: function () {},
      mobile: false,
    };

    var properties = $.extend(defaults, options);

    return this.each(function () {
      var $this = $(this);

      if (obj.constructor == String) {
        if (obj.charAt(0) == "{" || obj.charAt(0) == "[") {
          var data = $.parseJSON(obj);
          init($this);
          properties.onLoading();
          browseJSON(data, this, undefined, obj);
          properties.onLoaded();
        } else {
          notice("url");
          var element = $this;
          $.ajax({
            url: obj,
            success: function (data) {
              element.loadJSON(data, properties);
            },
            cache: false,
            dataType: "json",
          });
        }
      } else {
        init($this);
        properties.onLoading();
        browseJSON(obj, this, undefined, obj);
        properties.onLoaded();
      }
    });
  };

  // Set to true to show a console warning, once per page, for each behavior removed in 2.0.
  $.fn.loadJSON.debug = false;
})(jQuery);

export default jQuery;
